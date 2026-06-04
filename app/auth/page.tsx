'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check existing session on load
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        router.push('/')
      }

      setCheckingSession(false)
    }

    checkUser()
  }, [router])

  const handleAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password
        })

        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
      }

      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Prevent UI flash while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-6 border rounded-lg bg-card space-y-4">

        <h1 className="text-xl font-bold text-center">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </h1>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading
            ? 'Loading...'
            : mode === 'login'
              ? 'Login'
              : 'Sign Up'}
        </button>

        <button
          onClick={() =>
            setMode(mode === 'login' ? 'signup' : 'login')
          }
          className="w-full text-sm text-muted-foreground"
        >
          {mode === 'login'
            ? 'Need an account? Sign up'
            : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  )
}