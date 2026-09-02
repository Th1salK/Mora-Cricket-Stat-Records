type Attempt = { count: number; resetAt: number }

const stores = new Map<string, Map<string, Attempt>>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

function getStore(key: string): Map<string, Attempt> {
  let store = stores.get(key)
  if (!store) {
    store = new Map()
    stores.set(key, store)
  }
  return store
}

function sweep(store: Map<string, Attempt>) {
  const now = Date.now()
  for (const [key, a] of store) {
    if (a.resetAt <= now) store.delete(key)
  }
}

export function checkRateLimit(request: Request, key: string, maxAttempts: number, windowMs: number): boolean {
  const store = getStore(key)
  const ip = getClientIp(request)
  const now = Date.now()
  if (store.size > 1000) sweep(store)

  const entry = store.get(ip)
  if (!entry || entry.resetAt <= now) return true
  return entry.count < maxAttempts
}

export function recordAttempt(request: Request, key: string, windowMs: number): void {
  const store = getStore(key)
  const ip = getClientIp(request)
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + windowMs })
  } else {
    entry.count += 1
  }
}

export function clearRateLimit(request: Request, key: string): void {
  const store = getStore(key)
  store.delete(getClientIp(request))
}

export function lockoutSeconds(request: Request, key: string): number {
  const store = getStore(key)
  const entry = store.get(getClientIp(request))
  if (!entry) return 0
  return Math.max(0, Math.ceil((entry.resetAt - Date.now()) / 1000))
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

export function checkLoginRateLimit(request: Request): boolean {
  return checkRateLimit(request, "login", LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)
}

export function recordLoginFailure(request: Request): void {
  recordAttempt(request, "login", LOGIN_WINDOW_MS)
}

export function clearLoginRateLimit(request: Request): void {
  clearRateLimit(request, "login")
}

export function loginLockoutSeconds(request: Request): number {
  return lockoutSeconds(request, "login")
}

const API_WINDOW_MS = 15 * 60 * 1000
const API_MAX_ATTEMPTS = 30

export function checkApiRateLimit(request: Request): boolean {
  return checkRateLimit(request, "api-mutation", API_MAX_ATTEMPTS, API_WINDOW_MS)
}

export function recordApiAttempt(request: Request): void {
  recordAttempt(request, "api-mutation", API_WINDOW_MS)
}

export function apiLockoutSeconds(request: Request): number {
  return lockoutSeconds(request, "api-mutation")
}
