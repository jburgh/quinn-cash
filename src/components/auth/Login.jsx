import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import CoinIcon from '../common/CoinIcon'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError('Wrong email or password. Try again!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-quinn-blue to-quinn-blue-dark flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <CoinIcon size="xl" className="mb-4" />
        <h1 className="font-display text-5xl text-white mb-2">Quinn Cash</h1>
        <p className="font-body text-blue-200 text-lg">Your family reward store</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="font-display text-2xl text-quinn-blue mb-6 text-center">Sign In</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 rounded-2xl p-4 mb-5 text-center font-body text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-body font-bold text-gray-500 mb-1 text-sm">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-quinn-blue transition-colors"
              placeholder="family@email.com"
              required
            />
          </div>
          <div>
            <label className="block font-body font-bold text-gray-500 mb-1 text-sm">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 font-body focus:outline-none focus:border-quinn-blue transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-quinn-orange hover:bg-quinn-orange-dark text-white font-display text-2xl py-4 rounded-2xl transition-colors disabled:opacity-50 mt-2 active:scale-95"
          >
            {loading ? 'Signing in...' : "Let's Go! 🚀"}
          </button>
        </form>
      </div>
    </div>
  )
}
