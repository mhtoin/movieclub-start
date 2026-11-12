import { describe, expect, it } from 'vitest'
import {
  MAX_TELEMETRY_BODY_BYTES,
  TelemetryHttpError,
  isSameOriginRequest,
  readLimitedJson,
} from './http'

function postRequest(headers: Record<string, string>): Request {
  return new Request('https://internal.local/api/web-vitals', {
    method: 'POST',
    headers,
  })
}

describe('readLimitedJson', () => {
  it('parses a JSON body under the limit', async () => {
    const request = new Request('https://internal.local/api/web-vitals', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ ok: true }),
    })

    await expect(readLimitedJson(request)).resolves.toEqual({ ok: true })
  })

  it('rejects non-JSON content types', async () => {
    const request = new Request('https://internal.local/api/web-vitals', {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: '{}',
    })

    await expect(readLimitedJson(request)).rejects.toMatchObject({
      status: 415,
    })
  })

  it('rejects a declared Content-Length above the limit', async () => {
    const request = new Request('https://internal.local/api/web-vitals', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': String(MAX_TELEMETRY_BODY_BYTES + 1),
      },
      body: '{}',
    })

    await expect(readLimitedJson(request)).rejects.toMatchObject({
      status: 413,
    })
  })

  it('enforces the limit on a stream without Content-Length', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('a'.repeat(MAX_TELEMETRY_BODY_BYTES + 1)),
        )
        controller.close()
      },
    })
    const init = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: stream,
      duplex: 'half',
    } as RequestInit & { duplex: 'half' }
    const request = new Request('https://internal.local/api/web-vitals', init)

    await expect(readLimitedJson(request)).rejects.toMatchObject({
      status: 413,
    })
  })

  it('rejects invalid JSON', async () => {
    const request = new Request('https://internal.local/api/web-vitals', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{not-json',
    })

    const error = await readLimitedJson(request).catch((cause) => cause)

    expect(error).toBeInstanceOf(TelemetryHttpError)
    expect(error).toMatchObject({ status: 400 })
  })
})

describe('isSameOriginRequest', () => {
  it('accepts a matching Origin and Host', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://leffaseura.club',
          host: 'leffaseura.club',
        }),
      ),
    ).toBe(true)
  })

  it('compares against X-Forwarded-Host behind a reverse proxy', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://leffaseura.club',
          'x-forwarded-host': 'leffaseura.club, movieclub-app:3001',
          host: 'movieclub-app:3001',
        }),
      ),
    ).toBe(true)
  })

  it('does not accept a matching Origin from a non-authoritative Host header', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://evil.example',
          'x-forwarded-host': 'leffaseura.club',
          host: 'evil.example',
        }),
      ),
    ).toBe(false)
  })

  it('normalizes default ports', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://leffaseura.club:443',
          host: 'leffaseura.club',
        }),
      ),
    ).toBe(true)
  })

  it('does not treat a non-default port as same-origin', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://leffaseura.club:8443',
          host: 'leffaseura.club',
        }),
      ),
    ).toBe(false)
  })

  it('accepts local development origins', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'http://localhost:3001',
          host: 'localhost:3001',
        }),
      ),
    ).toBe(true)
  })

  it('rejects a cross-origin Origin', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://evil.example',
          host: 'leffaseura.club',
        }),
      ),
    ).toBe(false)
  })

  it('rejects Sec-Fetch-Site cross-site even with a matching Origin', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://leffaseura.club',
          host: 'leffaseura.club',
          'sec-fetch-site': 'cross-site',
        }),
      ),
    ).toBe(false)
  })

  it('rejects Sec-Fetch-Site same-site (stricter same-origin policy)', () => {
    expect(
      isSameOriginRequest(
        postRequest({
          origin: 'https://sub.leffaseura.club',
          'x-forwarded-host': 'sub.leffaseura.club',
          'sec-fetch-site': 'same-site',
        }),
      ),
    ).toBe(false)
  })

  it('accepts an absent Origin only with an explicit same-origin signal', () => {
    expect(
      isSameOriginRequest(postRequest({ 'sec-fetch-site': 'same-origin' })),
    ).toBe(true)
    expect(isSameOriginRequest(postRequest({}))).toBe(false)
  })

  it('rejects malformed and non-http origins', () => {
    expect(
      isSameOriginRequest(
        postRequest({ origin: 'not a url', host: 'leffaseura.club' }),
      ),
    ).toBe(false)
    expect(
      isSameOriginRequest(
        postRequest({ origin: 'null', host: 'leffaseura.club' }),
      ),
    ).toBe(false)
  })
})
