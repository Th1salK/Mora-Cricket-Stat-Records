import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectWithFallback } from '../src/lib/mongodb'
import User from '../src/models/User'

async function main() {
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD
  const uri = process.env.MONGODB_URI

  if (!username || !password) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD environment variables first.')
    process.exit(1)
  }
  if (!uri) {
    console.error('MONGODB_URI is not defined.')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters.')
    process.exit(1)
  }

  await connectWithFallback(uri)

  const existing = await User.findOne({ username: username.toLowerCase() })
  if (existing) {
    console.log(`Admin user "${username}" already exists. Nothing to do.`)
    await mongoose.disconnect()
    process.exit(0)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await User.create({ username, passwordHash })

  console.log(`Admin user "${username}" created.`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error('Failed to seed admin:', err)
  process.exit(1)
})
