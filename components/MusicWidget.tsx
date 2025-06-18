'use client'

import { useState, useEffect } from 'react'

interface MusicData {
  title: string
  artist: string
  url?: string
  source?: string
  spotifyId?: string
}

interface MusicWidgetProps {
  onMusicUpdate: (music: MusicData | null) => void
  defaultMusic?: MusicData | null
}

export default function MusicWidget({ onMusicUpdate, defaultMusic }: MusicWidgetProps) {
  const [enabled, setEnabled] = useState(!!defaultMusic)
  const [music, setMusic] = useState<MusicData>(defaultMusic || {
    title: '',
    artist: '',
    url: '',
    source: 'Other'
  })

  const handleToggle = () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)
    if (!newEnabled) {
      onMusicUpdate(null)
    } else if (music.title || music.artist) {
      onMusicUpdate(music)
    }
  }

  const handleMusicChange = (field: keyof MusicData, value: string) => {
    const newMusic = { ...music, [field]: value }
    setMusic(newMusic)
    if (enabled && (newMusic.title || newMusic.artist)) {
      onMusicUpdate(newMusic)
    }
  }

  // Music sources
  const musicSources = [
    { name: 'Spotify', emoji: '🎵' },
    { name: 'YouTube', emoji: '📺' },
    { name: 'SoundCloud', emoji: '☁️' },
    { name: 'Other', emoji: '🎶' }
  ]

  // Quick music templates
  const musicTemplates = [
    { title: 'Lofi Hip Hop Radio', artist: 'ChilledCow', source: 'YouTube' },
    { title: 'Study Playlist', artist: 'Focus Music', source: 'Spotify' },
    { title: 'Kawaii Future Bass', artist: 'Snail\'s House', source: 'Spotify' },
    { title: 'Animal Crossing OST', artist: 'Nintendo', source: 'YouTube' }
  ]

  const applyTemplate = (template: typeof musicTemplates[0]) => {
    const newMusic = { ...template, url: music.url }
    setMusic(newMusic)
    if (enabled) {
      onMusicUpdate(newMusic)
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="font-pixel text-pixel-sm text-kawaii-text font-bold">
          🎵 Currently Listening
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
              <input
                type="text"
                placeholder="Song title..."
                value={music.title}
                onChange={(e) => handleMusicChange('title', e.target.value)}
                className="w-full px-2 py-1 border-2 border-kawaii-border rounded font-pixel text-pixel-xs bg-white"
                style={{ borderStyle: 'inset' }}
              />
              <input
                type="text"
                placeholder="Artist..."
                value={music.artist}
                onChange={(e) => handleMusicChange('artist', e.target.value)}
                className="w-full px-2 py-1 border-2 border-kawaii-border rounded font-pixel text-pixel-xs bg-white"
                style={{ borderStyle: 'inset' }}
              />
              <input
                type="text"
                placeholder="Link (optional)..."
                value={music.url || ''}
                onChange={(e) => handleMusicChange('url', e.target.value)}
                className="w-full px-2 py-1 border-2 border-kawaii-border rounded font-pixel text-pixel-xs bg-white"
                style={{ borderStyle: 'inset' }}
              />
              
              {/* Source selector */}
              <div className="flex gap-1">
                {musicSources.map((source) => (
                  <button
                    key={source.name}
                    type="button"
                    onClick={() => handleMusicChange('source', source.name)}
                    className={`flex-1 px-2 py-1 border border-kawaii-border rounded font-pixel text-pixel-xs transition-colors pixel-ui ${
                      music.source === source.name ? 'bg-kawaii-accent' : 'bg-kawaii-background'
                    }`}
                    style={{ borderStyle: 'outset' }}
                  >
                    {source.emoji} {source.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick templates */}
          <div>
            <p className="font-pixel text-pixel-xs text-kawaii-text/60 mb-1">Quick picks:</p>
            <div className="flex flex-wrap gap-1">
              {musicTemplates.map((template, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="px-2 py-1 bg-kawaii-surface border border-kawaii-border rounded font-pixel text-pixel-xs hover:bg-kawaii-accent transition-colors pixel-ui"
                  style={{ borderStyle: 'outset' }}
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}