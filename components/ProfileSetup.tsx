'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface ProfileSetupProps {
  onClose?: () => void
}

export default function ProfileSetup({ onClose }: ProfileSetupProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    username: '',
    display_name: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // Try to fetch existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (existingProfile) {
        setProfile({
          username: existingProfile.username || '',
          display_name: existingProfile.display_name || '',
          bio: existingProfile.bio || ''
        })
      } else {
        // Set defaults from user metadata
        setProfile({
          username: user.email?.split('@')[0] || '',
          display_name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          bio: ''
        })
      }
    }
  }

  const saveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      alert('Profile saved successfully! 🎉')
      if (onClose) onClose()
    } catch (error: any) {
      console.error('Error saving profile:', error)
      alert(`Failed to save profile: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <p className="text-center text-gray-600">Please log in to set up your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Profile Setup</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Display Name"
            />
            <p className="text-sm text-gray-500 mt-1">This is what others will see on your posts</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={saveProfile}
            disabled={saving || !profile.display_name.trim()}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}