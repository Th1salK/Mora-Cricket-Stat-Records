import { z } from 'zod'

export function isSuperadminRole(role: unknown): boolean {
  return role === 'superadmin'
}

export const createAdminSchema = z.object({
  username: z.string().trim().toLowerCase().min(3, 'Username must have at least 3 characters').max(50)
    .regex(/^[a-z0-9_.-]+$/, 'Use letters, numbers, dots, underscores or hyphens for the username'),
  password: z.string().min(8, 'Password must have at least 8 characters')
    .refine((value) => new TextEncoder().encode(value).length <= 72, 'Password must be 72 bytes or fewer'),
}).strict()
export const deleteAdminSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid account ID'),
}).strict()

export class AdminAccountError extends Error {
  constructor(message: string, public readonly status: number) { super(message) }
}
