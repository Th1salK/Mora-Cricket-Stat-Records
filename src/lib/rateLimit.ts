const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

type Attempt = { count: number; resetAt: number }

const attempts = new Map<string, Attempt>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

function sweep() {
  const now = Date.now()
  for (const [key, a] of attempts) {
    if (a.resetAt <= now) attempts.delete(key)
  }
}

/** True when the caller may attempt a login (under the failure cap). */
export function checkLoginRateLimit(request: Request): boolean {
  const ip = getClientIp(request)
  const now = Date.now()
  if (attempts.size > 1000) sweep()

  const entry = attempts.get(ip)
  if (!entry || entry.resetAt <= now) return true
  return entry.count < MAX_ATTEMPTS
}

/** Record a failed login attempt. */
export function recordLoginFailure(request: Request): void {
  const ip = getClientIp(request)
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    entry.count += 1
  }
}

/** Reset the failure counter (called on successful login). */
export function clearLoginRateLimit(request: Request): void {
  attempts.delete(getClientIp(request))
}

/** Remaining seconds until the lockout expires, for the 429 response. */
export function loginLockoutSeconds(request: Request): number {
  const entry = attempts.get(getClientIp(request))
  if (!entry) return 0
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000))
}
