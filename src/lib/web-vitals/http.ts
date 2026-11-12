export const MAX_TELEMETRY_BODY_BYTES = 4 * 1024

export class TelemetryHttpError extends Error {
  readonly status: number

  constructor(status: number, code: string) {
    super(code)
    this.name = 'TelemetryHttpError'
    this.status = status
  }
}

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null
  const first = value.split(',')[0]?.trim()
  return first ? first : null
}

function normalizeHost(value: string, protocol: string): string | null {
  try {
    const host = value.trim().replace(/\.$/, '')
    return new URL(`${protocol}//${host}`).host.toLowerCase()
  } catch {
    return null
  }
}

function hasJsonContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type')
  if (!contentType) return false
  const mime = contentType.split(';', 1)[0]?.trim().toLowerCase()
  return mime === 'application/json'
}

/**
 * Reads a JSON body with a hard byte ceiling. The body is consumed as a stream
 * so a missing or dishonest Content-Length cannot bypass the limit.
 */
export async function readLimitedJson(
  request: Request,
  maxBytes = MAX_TELEMETRY_BODY_BYTES,
): Promise<unknown> {
  if (!hasJsonContentType(request)) {
    throw new TelemetryHttpError(415, 'unsupported_media_type')
  }

  const contentLength = request.headers.get('content-length')
  if (contentLength !== null) {
    const declaredLength = Number(contentLength)
    if (!Number.isFinite(declaredLength) || declaredLength < 0) {
      throw new TelemetryHttpError(400, 'invalid_content_length')
    }
    if (declaredLength > maxBytes) {
      throw new TelemetryHttpError(413, 'payload_too_large')
    }
  }

  if (!request.body) {
    throw new TelemetryHttpError(400, 'empty_body')
  }

  const reader = request.body.getReader()
  const chunks: Array<Uint8Array> = []
  let total = 0

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel().catch(() => {})
        throw new TelemetryHttpError(413, 'payload_too_large')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  if (total === 0) {
    throw new TelemetryHttpError(400, 'empty_body')
  }

  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    throw new TelemetryHttpError(400, 'invalid_json')
  }
}

/**
 * Same-origin gate that also works behind a reverse proxy: the Origin host is
 * compared against X-Forwarded-Host and Host, and browser cross-site requests
 * are rejected outright. Absent Origin is only accepted when Fetch Metadata
 * explicitly marks the request as same-origin (or a non-browser "none").
 */
export function isSameOriginRequest(request: Request): boolean {
  const secFetchSite = request.headers
    .get('sec-fetch-site')
    ?.trim()
    .toLowerCase()

  if (
    secFetchSite &&
    secFetchSite !== 'same-origin' &&
    secFetchSite !== 'none'
  ) {
    return false
  }

  const origin = request.headers.get('origin')
  if (!origin) {
    return secFetchSite === 'same-origin' || secFetchSite === 'none'
  }

  let originUrl: URL
  try {
    originUrl = new URL(origin)
  } catch {
    return false
  }

  if (originUrl.username || originUrl.password) return false
  if (originUrl.protocol !== 'http:' && originUrl.protocol !== 'https:') {
    return false
  }

  // Prefer the external host supplied by the reverse proxy. Falling back to
  // Host keeps local development working without accepting either header as
  // an alternate origin.
  const expectedHost =
    firstHeaderValue(request.headers.get('x-forwarded-host')) ??
    firstHeaderValue(request.headers.get('host'))
  if (!expectedHost) return false

  const originHost = normalizeHost(originUrl.host, originUrl.protocol)
  return (
    originHost !== null &&
    normalizeHost(expectedHost, originUrl.protocol) === originHost
  )
}
