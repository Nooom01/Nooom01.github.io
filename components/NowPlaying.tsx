'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-client'
import SpotifyEmbed from '@/components/SpotifyEmbed'

interface NowPlayingData {
  spotify_id: string
  spotify_type: 'track' | 'playlist' | 'album'
  title: string
  artist?: string
  album?: string
  embed_url: string
  updated_at: string
}

// Parse Spotify URL to extract ID and type
function parseSpotifyUrl(url: string): { id: string; type: 'track' | 'playlist' | 'album' } | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)
    
    if (urlObj.hostname === 'open.spotify.com') {
      let typeIndex = -1
      let type: 'track' | 'playlist' | 'album' | null = null
      
      for (let i = 0; i < pathParts.length; i++) {
        if (['track', 'playlist', 'album'].includes(pathParts[i])) {
          type = pathParts[i] as 'track' | 'playlist' | 'album'
          typeIndex = i
          break
        }
      }
      
      if (type && typeIndex >= 0 && pathParts[typeIndex + 1]) {
        const id = pathParts[typeIndex + 1].split('?')[0]
        if (id) {
          return { id, type }
        }
      }
    }
  } catch (e) {
    // Invalid URL
  }
  return null
}

export default function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    checkOwnership()
    fetchNowPlaying()
    subscribeToUpdates()
  }, [])

  const checkOwnership = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_blog_owner')
        .eq('id', user.id)
        .single()
      
      setIsOwner(profile?.is_blog_owner || false)
    }
  }

  const fetchNowPlaying = async () => {
    const { data, error } = await supabase
      .from('now_playing')
      .select('*')
      .single()
    
    if (data && !error) {
      setNowPlaying(data)
    }
  }

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel('now_playing_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'now_playing'
        },
        () => {
          fetchNowPlaying()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleUpdate = async () => {
    setError('')
    
    if (!spotifyUrl) {
      setError('Please enter a Spotify URL')
      return
    }

    const parsed = parseSpotifyUrl(spotifyUrl)
    if (!parsed) {
      setError('Please enter a valid Spotify link')
      return
    }

    setIsUpdating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to update')
        return
      }

      const musicData = {
        user_id: user.id,
        spotify_id: parsed.id,
        spotify_type: parsed.type,
        title: `Spotify ${parsed.type}`, // Default title
        embed_url: `https://open.spotify.com/embed/${parsed.type}/${parsed.id}`,
        updated_at: new Date().toISOString()
      }

      // Try to get title from Spotify oEmbed
      try {
        const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`)
        if (response.ok) {
          const data = await response.json()
          if (data.title) {
            // Parse title and artist from Spotify's format "Song · Artist"
            const parts = data.title.split(' · ')
            if (parts.length >= 2) {
              Object.assign(musicData, {
                title: parts[0],
                artist: parts.slice(1).join(' · ')
              })
            } else {
              Object.assign(musicData, { title: data.title })
            }
          }
        }
      } catch (e) {
        // Ignore oEmbed errors
      }

      // First try to update existing record
      const { data: existingData } = await supabase
        .from('now_playing')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let error
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('now_playing')
          .update(musicData)
          .eq('user_id', user.id)
        error = updateError
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('now_playing')
          .insert(musicData)
        error = insertError
      }

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setSpotifyUrl('')
      setIsEditing(false)
      fetchNowPlaying()
    } catch (error: any) {
      console.error('Error updating now playing:', error)
      setError(`Failed to update: ${error.message || error}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div>
      <div className="">
        {!nowPlaying || isEditing ? (
          // Edit mode
          <div>
            {isOwner ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="text-xs text-gray-700">Share from Spotify</span>
                </div>
                
                <input
                  type="text"
                  placeholder="Paste Spotify link (song, playlist, or album)..."
                  value={spotifyUrl}
                  onChange={(e) => {
                    setSpotifyUrl(e.target.value)
                    setError('')
                  }}
                  className="w-full px-2 py-2 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                />
                
                {error && (
                  <p className="text-xs text-red-600">{error}</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </button>
                  {nowPlaying && (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                Nothing playing right now
              </p>
            )}
          </div>
        ) : (
          // Display mode
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div>
                  {nowPlaying.title && nowPlaying.artist ? (
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {nowPlaying.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {nowPlaying.artist}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-gray-900">
                      Spotify {nowPlaying.spotify_type}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {formatTime(nowPlaying.updated_at)}
                  </p>
                </div>
              </div>
              
              {isOwner && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  Change
                </button>
              )}
            </div>

            {/* Spotify Embed */}
            <SpotifyEmbed 
              spotifyId={nowPlaying.spotify_id} 
              type={nowPlaying.spotify_type}
            />
            
            <a
              href={`https://open.spotify.com/${nowPlaying.spotify_type}/${nowPlaying.spotify_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Open in Spotify
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}