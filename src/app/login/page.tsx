import { redirect } from 'next/navigation'
import { isAdmin } from '../../lib/auth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  if (await isAdmin()) {
    redirect('/')
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="glass p-8">
        <h1 className="text-white text-2xl font-bold mb-1">Admin Login</h1>
        <p className="text-slate-400 text-sm mb-6">Sign in to manage matches, players and stats.</p>
        <LoginForm />
      </div>
    </div>
  )
}
