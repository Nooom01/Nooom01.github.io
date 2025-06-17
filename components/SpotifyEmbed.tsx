'use client'

interface SpotifyEmbedProps {
  spotifyId?: string
  type?: 'track' | 'playlist' | 'album'
}

export default function SpotifyEmbed({ spotifyId, type = 'track' }: SpotifyEmbedProps) {
  if (!spotifyId) return null

  // Spotify embed URLs
  const embedUrl = `https://open.spotify.com/embed/${type}/${spotifyId}?utm_source=generator&theme=0`
  
  // Different heights for different content types - made much more compact
  const height = type === 'track' ? 80 : 200

  return (
    <div className="w-full">
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    </div>
  )
}