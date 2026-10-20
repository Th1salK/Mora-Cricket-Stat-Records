import RateLimit from "@/models/RateLimit"
import { connectDB } from "@/lib/mongodb"

type Entry = { count: number; expiresAt: Date }

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

function docKey(request: Request, bucket: string) {
  return `${bucket}:${getClientIp(request)}` // one document per bucket + IP
}

// Is this IP still under the limit? (does not count)
export async function checkRateLimit(request: Request, bucket: string, maxAttempts: number): Promise<boolean> {
  await connectDB()
  const entry = await RateLimit.findOne({
    key: docKey(request, bucket),
    expiresAt: { $gt: new Date() },          // ignore windows that have ended
  }).lean<Entry>()
  if (!entry) return true
  return entry.count < maxAttempts
}

// Add 1 and return the new count.
export async function recordAttempt(request: Request, bucket: string, windowMs: number): Promise<number> {
  await connectDB()
  const key = docKey(request, bucket)
  const now = new Date()

  const updated = await RateLimit.findOneAndUpdate(
    { key, expiresAt: { $gt: now } },        // a window that's still running
    { $inc: { count: 1 } },
    { new: true }
  ).lean<Entry>()
  if (updated) return updated.count

  await RateLimit.updateOne(                 // no running window: start one at 1
    { key },
    { $set: { count: 1, expiresAt: new Date(now.getTime() + windowMs) } },
    { upsert: true }
  )
  return 1
}

export async function clearRateLimit(request: Request, bucket: string): Promise<void> {
  await connectDB()
  await RateLimit.deleteOne({ key: docKey(request, bucket) })
}

export async function lockoutSeconds(request: Request, bucket: string): Promise<number> {
  await connectDB()
  const entry = await RateLimit.findOne({ key: docKey(request, bucket) }).lean<Entry>()
  if (!entry) return 0
  return Math.max(0, Math.ceil((entry.expiresAt.getTime() - Date.now()) / 1000))
}

// ---- Login: count failures only, clear on success (same behaviour as before) ----
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

export const checkLoginRateLimit = (r: Request) => checkRateLimit(r, "login", LOGIN_MAX_ATTEMPTS)
export const recordLoginFailure  = (r: Request) => recordAttempt(r, "login", LOGIN_WINDOW_MS)
export const clearLoginRateLimit = (r: Request) => clearRateLimit(r, "login")
export const loginLockoutSeconds = (r: Request) => lockoutSeconds(r, "login")

// ---- API writes: every call counts, so check + record happen together ----
const API_WINDOW_MS = 15 * 60 * 1000
const API_MAX_ATTEMPTS = 30

export async function checkApiRateLimit(request: Request): Promise<boolean> {
  const count = await recordAttempt(request, "api-mutation", API_WINDOW_MS)
  return count <= API_MAX_ATTEMPTS           // <= because this request is already counted
}

export const apiLockoutSeconds = (r: Request) => lockoutSeconds(r, "api-mutation")