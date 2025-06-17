'use client'

import { useState, useEffect } from 'react'

interface MusicData {
  title: string
  artist: string
  url: string
  source: 'Spotify'
  spotifyId?: string
  type?: 'track' | 'playlist' | 'album'
}

interface SpotifyMusicWidgetProps {
  onMusicUpdate: (music: MusicData | null) => void
  defaultMusic?: MusicData | null
}

// Parse Spotify URL to extract ID and type
function parseSpotifyUrl(url: string): { id: string; type: 'track' | 'playlist' | 'album' } | null {
  try {
    const urlObj = new URL(url)
    
    // Handle both regular and international URLs
    // Regular: /track/ID
    // International: /intl-ja/track/ID
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)
    
    if (urlObj.hostname === 'open.spotify.com') {
      let typeIndex = -1
      let type: 'track' | 'playlist' | 'album' | null = null
      
      // Find the type in the path (track, playlist, or album)
      for (let i = 0; i < pathParts.length; i++) {
        if (['track', 'playlist', 'album'].includes(pathParts[i])) {
          type = pathParts[i] as 'track' | 'playlist' | 'album'
          typeIndex = i
          break
        }
      }
      
      // Get the ID which should be right after the type
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

export default function SpotifyMusicWidget({ onMusicUpdate, defaultMusic }: SpotifyMusicWidgetProps) {
  const [enabled, setEnabled] = useState(!!defaultMusic)
  const [spotifyUrl, setSpotifyUrl] = useState(defaultMusic?.url || '')
  const [music, setMusic] = useState<MusicData | null>(defaultMusic || null)
  const [error, setError] = useState('')

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    if (!newEnabled) {
      onMusicUpdate(null)
      setMusic(null)
    } else if (music) {
      onMusicUpdate(music)
    }
  }

  const handleUrlChange = async (url: string) => {
    setSpotifyUrl(url)
    setError('')
    
    if (!url) {
      setMusic(null)
      onMusicUpdate(null)
      return
    }

    const parsed = parseSpotifyUrl(url)
    if (!parsed) {
      setError('Please paste a valid Spotify link')
      setMusic(null)
      onMusicUpdate(null)
      return
    }

    // For now, we'll use a simple format. In a production app, you'd use Spotify API
    // to get the actual track/playlist name
    const musicData: MusicData = {
      title: `Spotify ${parsed.type}`,
      artist: 'Loading...',
      url: url,
      source: 'Spotify',
      spotifyId: parsed.id,
      type: parsed.type
    }

    // Try to extract info from URL if possible
    try {
      // Fetch using Spotify oEmbed API (no auth required)
      const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
      if (response.ok) {
        const data = await response.json()
        musicData.title = data.title || musicData.title
        musicData.artist = data.provider_name === 'Spotify' ? 'Spotify' : 'Various Artists'
      }
    } catch (e) {
      // Fallback to basic info
    }

    setMusic(musicData)
    if (enabled) {
      onMusicUpdate(musicData)
    }
  }

  useEffect(() => {
    if (spotifyUrl) {
      handleUrlChange(spotifyUrl)
    }
  }, [enabled])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="font-pixel text-pixel-sm text-kawaii-text font-bold">
          🎵 Currently on Spotify
        </label>
        <button
          type="button"
          onClick={handleToggle}
          className={`px-3 py-1 border-2 border-kawaii-border rounded font-pixel text-pixel-xs transition-colors pixel-ui ${
            enabled ? 'bg-kawaii-accent' : 'bg-kawaii-surface'
          }`}
          style={{ borderStyle: 'outset' }}
        >
          {enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="bg-kawaii-surface border-2 border-kawaii-border rounded-lg p-3 pixel-ui" style={{ borderStyle: 'inset' }}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="font-pixel text-pixel-xs text-kawaii-text">Spotify Share</span>
              </div>
              
              <input
                type="text"
                placeholder="Paste Spotify link (song, playlist, or album)..."
                value={spotifyUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full px-2 py-2 border-2 border-kawaii-border rounded font-pixel text-pixel-xs bg-white"
                style={{ borderStyle: 'inset' }}
              />
              
              {error && (
                <p className="font-pixel text-pixel-xs text-red-500">{error}</p>
              )}
              
              {music && !error && (
                <div className="mt-2 p-2 bg-white border border-kawaii-border rounded">
                  <p className="font-pixel text-pixel-xs text-kawaii-text">
                    ✅ {music.title}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-kawaii-surface/50 border border-kawaii-border rounded p-2">
            <p className="font-pixel text-pixel-xs text-kawaii-text/70">
              💡 How to share from Spotify:
            </p>
            <ol className="font-pixel text-pixel-xs text-kawaii-text/60 mt-1 ml-3 space-y-1">
              <li>1. Open Spotify app/web</li>
              <li>2. Click ••• on any song/playlist</li>
              <li>3. Select "Share" → "Copy link"</li>
              <li>4. Paste here!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}