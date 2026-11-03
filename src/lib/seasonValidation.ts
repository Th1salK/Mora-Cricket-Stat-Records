import { z } from 'zod'

export const seasonIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a season')
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date').refine((value) => {
  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}, 'Enter a valid date')
export const seasonInputSchema = z.object({
  name: z.string().trim().min(1, 'Season name is required').max(40),
  startDate: date,
  endDate: date,
  makeCurrent: z.boolean().default(false),
}).refine((value) => value.endDate > value.startDate, {
  message: 'End date must be after start date', path: ['endDate'],
})
export const seasonChangeSchema = z.object({ action: z.enum(['set-current', 'end']) })

export class SeasonError extends Error {}
