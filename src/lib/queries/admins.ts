import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export type AdminAccountRow = { id: string; username: string; role: 'admin' | 'superadmin'; createdAt: string }
export async function listAdmins(): Promise<AdminAccountRow[]> {
  await connectDB()
  const users = await User.find().select('username role createdAt').sort({ role: -1, username: 1 }).lean()
  return users.map((user) => ({
    id: String(user._id), username: user.username, role: user.role ?? 'admin', createdAt: user.createdAt.toISOString(),
  }))
}
