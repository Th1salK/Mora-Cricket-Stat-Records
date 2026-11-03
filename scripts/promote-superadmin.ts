import mongoose from 'mongoose'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { connectWithFallback } from '@/lib/mongodb'
import User from '@/models/User'

async function main() {
  if (process.argv.slice(2).some((arg) => arg !== '--apply')) throw new Error('Only --apply is supported.')
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined.')
  const apply = process.argv.includes('--apply')
  mongoose.set('autoCreate', false)
  mongoose.set('autoIndex', false)
  await connectWithFallback(uri)
  try {
    const owner = await User.findOne({ username: 'thisal36' }).select('_id username role').lean()
    if (!owner) throw new Error('The existing Thisal36 account was not found. No account was created or changed.')
    const other = await User.exists({ role: 'superadmin', _id: { $ne: owner._id } })
    if (other) throw new Error('Another superadmin already exists. No roles were changed.')
    console.log(apply ? 'APPLY: promoting the existing Thisal36 account.' : 'DRY RUN: no writes. Use --apply to promote the existing Thisal36 account.')
    console.table([{ username: owner.username, currentRole: owner.role ?? 'admin', requestedRole: 'superadmin', needsChange: owner.role !== 'superadmin' }])
    if (!apply) return
    if (owner.role !== 'superadmin') {
      const directory = join(process.cwd(), 'scripts', 'output')
      await mkdir(directory, { recursive: true })
      const backup = join(directory, `superadmin-promotion-${Date.now()}.json`)
      await writeFile(backup, JSON.stringify({ id: String(owner._id), username: owner.username, previousRole: owner.role ?? null, promotedAt: new Date().toISOString() }, null, 2), { flag: 'wx' })
      await User.updateOne({ _id: owner._id }, { $set: { role: 'superadmin' } }, { runValidators: true })
      console.log(`Previous role recorded in ${backup}`)
    }
    await User.createIndexes()
    const promoted = await User.findById(owner._id).select('role').lean()
    if (promoted?.role !== 'superadmin') throw new Error('Role verification failed')
    console.log('Verified: Thisal36 is the superadmin. Password and existing sessions unchanged.')
  } finally { await mongoose.disconnect() }
}
main().catch((error) => {
  console.error('Superadmin promotion failed:', error instanceof Error ? error.message : 'Unknown error')
  process.exitCode = 1
})
