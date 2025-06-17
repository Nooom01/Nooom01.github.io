'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import type { User } from '@supabase/supabase-js'
import ProfileEdit from './ProfileEdit'

export default function SimpleAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) alert(error.message)
    else alert('Check your email for confirmation!')
    setLoading(false)
  }

  const signIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const [showLogin, setShowLogin] = useState(false)

  if (user) {
    return (
      <>
        <div className="absolute top-4 right-4 z-50">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm text-gray-700">{user.email}</span>
            <button 
              onClick={() => setShowProfileEdit(true)}
              className="px-4 py-1.5 bg-pink-400 text-white rounded-full text-sm hover:bg-pink-500 transition-colors"
            >
              Edit Profile
            </button>
            <button 
              onClick={signOut}
              className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        {showProfileEdit && (
          <ProfileEdit 
            user={user} 
            onClose={() => setShowProfileEdit(false)}
            onUpdate={() => {
              // Optionally refresh user data or show success message
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* Subtle login button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowLogin(!showLogin)}
          className="px-5 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login
        </button>
      </div>

      {/* Login modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 tracking-tight">Sign in to your account</h3>
              <button onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <div className="flex gap-2">
                <button 
                  onClick={signIn}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Sign In'}
                </button>
                <button 
                  onClick={signUp}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}