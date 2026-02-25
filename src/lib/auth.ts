import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'
const COOKIE_VALUE = 'authenticated'

/** Call from Server Components or Route Handlers to check admin status. */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

/** Call from a Route Handler to set the admin session cookie. */
export function buildAdminCookie(maxAge = 60 * 60 * 24 * 7): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: COOKIE_VALUE,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    },
  }
}

/** Cookie options to clear the admin session. */
export function buildClearCookie(): { name: string; value: string; options: Record<string, unknown> } {
  return {
    name: COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  }
}
