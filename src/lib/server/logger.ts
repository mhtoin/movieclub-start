import '@tanstack/react-start/server-only'

const EVENT_NAME = 'request.unexpected_error'
const MAX_STRING_LENGTH = 600
const MAX_PATH_LENGTH = 300
const MAX_CAUSE_DEPTH = 3
const MAX_STACK_LENGTH = 4_000

/**
 * Matches absolute URLs and absolute paths that carry a query string or hash.
 * Query values are stripped entirely because they may contain tokens, emails,
 * or other request data.
 */
const URL_PATTERN = /\bhttps?:\/\/[^\s"'<>]+/gi
const DATABASE_URL_PATTERN = /\b(?:postgres(?:ql)?|mysql):\/\/[^\s"'<>]+/gi
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const SENSITIVE_VALUE_PATTERN =
  /\b(password|token|secret|authorization|cookie|api[_-]?key|session|email)\b\s*[:=]\s*("[^"]*"|'[^']*'|[^,\s;]+)/gi

/** Redacts any remaining query-style key/value pairs in free-form text. */
const QUERY_VALUE_PATTERN = /([?&][^=\s&#]+)=([^\s&#]*)/g

type SafeError = {
  name: string
  message?: string
  stack?: string
  code?: string | number
  cause?: SafeError
}

export type RequestErrorLogInput = {
  request: Request
  pathname?: string
  error: unknown
}

type RuntimeProcess = {
  process?: {
    stderr?: {
      write?: (chunk: string) => void
    }
  }
}

function truncate(value: string, maxLength = MAX_STRING_LENGTH): string {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}…[truncated ${value.length - maxLength} chars]`
}

function stripQueryAndHash(value: string): string {
  const queryIndex = value.indexOf('?')
  const hashIndex = value.indexOf('#')
  const end = Math.min(
    queryIndex === -1 ? value.length : queryIndex,
    hashIndex === -1 ? value.length : hashIndex,
  )
  return value.slice(0, end)
}

function sanitizeText(value: string, maxLength = MAX_STRING_LENGTH): string {
  const bounded = truncate(value, maxLength)
  const sanitized = bounded
    .replace(DATABASE_URL_PATTERN, '[database-url]')
    .replace(URL_PATTERN, (match) => {
      try {
        const url = new URL(match)
        url.username = ''
        url.password = ''
        url.search = ''
        url.hash = ''
        return url.toString().replace(/\/$/, '')
      } catch {
        return '[url]'
      }
    })
    .replace(QUERY_VALUE_PATTERN, '$1=[redacted]')
    .replace(SENSITIVE_VALUE_PATTERN, '$1=[redacted]')
    .replace(EMAIL_PATTERN, '[email]')
  return truncate(sanitized, maxLength)
}

function readProperty(value: object, key: string): unknown {
  try {
    return (value as Record<string, unknown>)[key]
  } catch {
    return undefined
  }
}

function toSafeError(error: unknown, depth = 0): SafeError {
  if (error instanceof Error) {
    const safeError: SafeError = {
      name: sanitizeText(
        typeof error.name === 'string' && error.name.length > 0
          ? error.name
          : 'Error',
      ),
      message: sanitizeText(
        typeof error.message === 'string' ? error.message : '',
      ),
    }

    const code = readProperty(error, 'code')
    if (typeof code === 'string') {
      safeError.code = sanitizeText(code)
    } else if (typeof code === 'number' && Number.isFinite(code)) {
      safeError.code = code
    }

    if (depth < MAX_CAUSE_DEPTH) {
      const cause = readProperty(error, 'cause')
      if (cause !== undefined && cause !== error) {
        safeError.cause = toSafeError(cause, depth + 1)
      }

      if (typeof error.stack === 'string') {
        safeError.stack = sanitizeText(error.stack, MAX_STACK_LENGTH)
      }
    }

    return safeError
  }

  if (typeof error === 'string') {
    return { name: 'NonError', message: sanitizeText(error) }
  }

  if (
    typeof error === 'number' ||
    typeof error === 'boolean' ||
    typeof error === 'bigint'
  ) {
    return { name: 'NonError', message: truncate(String(error)) }
  }

  if (typeof error === 'object' && error !== null) {
    const name = readProperty(error, 'name')
    const message = readProperty(error, 'message')
    if (typeof name === 'string' || typeof message === 'string') {
      return {
        name: sanitizeText(
          typeof name === 'string' && name.length > 0 ? name : 'NonError',
        ),
        message: sanitizeText(typeof message === 'string' ? message : ''),
      }
    }
  }

  return { name: 'NonError', message: 'Non-error value was thrown' }
}

function getSafeMethod(request: Request): string {
  try {
    return truncate(request.method || 'UNKNOWN', 32)
  } catch {
    return 'UNKNOWN'
  }
}

function getSafePathname(request: Request, pathname?: string): string {
  let candidate = pathname

  if (!candidate) {
    try {
      candidate = new URL(request.url).pathname
    } catch {
      candidate = '/'
    }
  }

  return truncate(stripQueryAndHash(candidate), MAX_PATH_LENGTH)
}

/**
 * Returns true for thrown `Response` values, which TanStack Start uses for
 * control flow (redirects and other framework-generated responses). These are
 * expected and must not be reported as failures.
 */
export function isThrownResponse(error: unknown): boolean {
  return typeof Response !== 'undefined' && error instanceof Response
}

/**
 * Emits a single-line structured diagnostic for an unexpected request error.
 *
 * Only the request method and pathname are logged; query strings, headers,
 * cookies, bodies, and environment values are never included. Logging is
 * best-effort and must never replace or mask the original error.
 */
export function logUnexpectedRequestError({
  request,
  pathname,
  error,
}: RequestErrorLogInput): void {
  logServerError(EVENT_NAME, error, {
    method: getSafeMethod(request),
    path: getSafePathname(request, pathname),
  })
}

/** Emits a structured diagnostic for a server error handled by a route. */
export function logServerError(
  event: string,
  error: unknown,
  context?: { method?: string; path?: string },
): void {
  try {
    const entry = {
      event: sanitizeText(event),
      time: new Date().toISOString(),
      ...(context?.method ? { method: truncate(context.method, 32) } : {}),
      ...(context?.path
        ? { path: truncate(stripQueryAndHash(context.path), MAX_PATH_LENGTH) }
        : {}),
      error: toSafeError(error),
    }

    const line = `${JSON.stringify(entry)}\n`
    const runtime = globalThis as unknown as RuntimeProcess
    runtime.process?.stderr?.write?.(line)
  } catch {
    // Best-effort only: never let diagnostics break request handling.
  }
}
