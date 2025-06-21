'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Comments from '@/components/Comments'
import SpotifyEmbed from '@/components/SpotifyEmbed'

interface SinglePostModalProps {
  postId: string
  onClose: () => void
  onEditPost?: (post: Post) => void
  onDeletePost?: (post: Post) => void
  isBlogOwner?: boolean
}

interface Post {
  id: string
  title: string
  content: string
  category: string
  image_urls: string[]
  video_urls: string[]
  spotify_urls: string[]
  hashtags: string[]
  created_at: string
  profiles: {
    username: string
    avatar_url: string
  }
}

const categoryIcons = {
  eat: (
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  sleep: (
    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  study: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  play: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-6h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4a2 2 0 012-2z" />
    </svg>
  ),
  life: (
    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

// Helper to get or create a session ID for anonymous likes
function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('kawaii_blog_session')
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('kawaii_blog_session', sessionId)
  }
  return sessionId
}

export default function SinglePostModal({ 
  postId, 
  onClose, 
  onEditPost, 
  onDeletePost, 
  isBlogOwner = false 
}: SinglePostModalProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [likesCount, setLikesCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchPost()
    getCurrentUser()
  }, [postId])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single()

      if (error) throw error
      setPost(data)
      
      // Fetch likes count and user's like status
      await fetchLikes(data.id)
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikes = async (postId: string) => {
    try {
      // Get total likes count
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('post_id', postId)

      setLikesCount(count || 0)

      // Check if current user has liked
      if (user) {
        const { data: userLike, error: likeError } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle()

        if (likeError) {
          console.error('Error checking user like:', likeError)
        } else {
          setHasLiked(!!userLike)
        }
      } else {
        // For anonymous users, check by session
        const sessionId = getOrCreateSessionId()
        const { data: sessionLike, error: sessionError } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('session_id', sessionId)
          .maybeSingle()

        if (sessionError) {
          console.error('Error checking session like:', sessionError)
        } else {
          setHasLiked(!!sessionLike)
        }
      }
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const toggleLike = async () => {
    if (!post) return

    try {
      if (hasLiked) {
        // Remove like
        if (user) {
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', post.id)
            .eq('user_id', user.id)
        } else {
          const sessionId = getOrCreateSessionId()
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', post.id)
            .eq('session_id', sessionId)
        }
        setLikesCount(prev => Math.max(0, prev - 1))
        setHasLiked(false)
      } else {
        // Add like
        const likeData = user 
          ? { post_id: post.id, user_id: user.id }
          : { post_id: post.id, session_id: getOrCreateSessionId() }

        await supabase
          .from('likes')
          .insert(likeData)
        
        setLikesCount(prev => prev + 1)
        setHasLiked(true)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatLikes = (count: number) => {
    if (count === 0) return 'Be the first to like this!'
    if (count === 1) return '1 like'
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k likes`
    }
    return `${count} likes`
  }

  if (loading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </motion.div>
    )
  }

  if (!post) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="bg-white rounded-2xl p-8">
          <p className="text-red-500">Post not found</p>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            {categoryIcons[post.category as keyof typeof categoryIcons]}
            <h2 className="text-lg font-semibold text-gray-900 capitalize">{post.category} Post</h2>
          </div>
          <div className="flex items-center gap-2">
            {isBlogOwner && (
              <>
                <button
                  onClick={() => onEditPost?.(post)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeletePost?.(post)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-4">
            {/* Author and timestamp */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {post.profiles?.username?.charAt(0).toUpperCase() || 'B'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.profiles?.username || 'Blog Owner'}</p>
                <p className="text-xs text-gray-500">{formatTime(post.created_at)}</p>
              </div>
            </div>

            {/* Title */}
            {post.title && (
              <h3 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h3>
            )}

            {/* Images */}
            {post.image_urls && post.image_urls.length > 0 && (
              <div className="mb-4">
                {post.image_urls.length === 1 ? (
                  <img 
                    src={post.image_urls[0]} 
                    alt="Post content" 
                    className="w-full max-h-96 object-cover rounded-xl"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {post.image_urls.slice(0, 4).map((url, index) => (
                      <img 
                        key={index}
                        src={url} 
                        alt={`Post content ${index + 1}`} 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            {post.content && (
              <div className="mb-4">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>
            )}

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {post.hashtags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-blue-500 hover:text-blue-600 transition-colors cursor-pointer text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Spotify Embeds */}
            {post.spotify_urls && post.spotify_urls.length > 0 && (
              <div className="mb-4 space-y-4">
                {post.spotify_urls.map((url, index) => {
                  // Extract Spotify ID from URL
                  const spotifyId = url.split('/').pop()?.split('?')[0]
                  const type: 'track' | 'playlist' | 'album' = url.includes('/track/') ? 'track' : url.includes('/playlist/') ? 'playlist' : 'album'
                  return (
                    <SpotifyEmbed key={index} spotifyId={spotifyId} type={type} />
                  )
                })}
              </div>
            )}

            {/* Like Button */}
            <div className="mb-4">
              <motion.button 
                onClick={toggleLike}
                className="flex items-center gap-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ scale: hasLiked ? [1, 1.3, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg 
                    className={`w-6 h-6 transition-colors ${
                      hasLiked 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-700 hover:text-red-500'
                    }`}
                    fill={hasLiked ? 'currentColor' : 'none'}
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </motion.div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-500 transition-colors">
                  {formatLikes(likesCount)}
                </span>
              </motion.button>
            </div>

            {/* Comments */}
            <Comments postId={post.id} isExpanded={true} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}