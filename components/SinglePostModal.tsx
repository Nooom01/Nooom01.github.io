'use client'

import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
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
  weather?: {
    temp: number
    location: string
    icon: string
  }
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
      console.log('Fetching post with ID:', postId)
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      console.log('Post query result:', { data, error })

      if (error) throw error
      
      // Add a mock profile for now since we don't have proper user profiles set up
      const postWithProfile = {
        ...data,
        profiles: {
          username: 'Blog Owner',
          avatar_url: null
        }
      }
      
      setPost(postWithProfile)
      
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
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: '468px', width: '100%' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs sm:text-sm">
              {post.profiles?.username?.charAt(0).toUpperCase() || 'B'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{post.profiles?.username || 'Blog Owner'}</h3>
              {/* Show timestamp for posts without images (Twitter-style) */}
              {(!post.image_urls || post.image_urls.length === 0) && (
                <span className="text-xs text-gray-500">· {new Date(post.created_at).toLocaleDateString()}</span>
              )}
            </div>
            {/* Show title only for posts with images */}
            {post.category !== 'sleep' && post.image_urls && post.image_urls.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-gray-500">{post.title}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Weather info */}
        {post.weather && (
          <div className="px-3 sm:px-4 mb-3">
            <div className="bg-gray-50 px-3 py-2 rounded-xl inline-flex items-center gap-2">
              <span className="text-sm">{post.weather.icon}</span>
              <span className="text-xs text-gray-600 font-medium">
                {post.weather.temp}°C in {post.weather.location}
              </span>
            </div>
          </div>
        )}

        {/* Image display - Only show if images exist */}
        {post.category !== 'sleep' && post.image_urls && post.image_urls.length > 0 && (
          <div 
            className="relative bg-gray-50 flex items-center justify-center"
            style={{ height: '300px' }}
          >
            <img src={post.image_urls[0]} alt="Post" className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Sleep posts: Show emoji inline with content */}
        {post.category === 'sleep' && (
          <div className="mb-3 mx-3 sm:mx-4 flex items-center gap-3 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl">
            <motion.div 
              className="flex items-center justify-center"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {categoryIcons[post.category as keyof typeof categoryIcons] && 
                  React.cloneElement(categoryIcons[post.category as keyof typeof categoryIcons], {
                    className: "w-6 h-6"
                  })
                }
              </div>
            </motion.div>
            <div className="text-gray-500 text-xs">
              {new Date(post.created_at).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Actions - Only show here for posts WITH images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3">
            <motion.button
              onClick={toggleLike}
              className="transition-transform"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill={hasLiked ? "#ef4444" : "none"}
                stroke={hasLiked ? "#ef4444" : "#374151"}
                strokeWidth="2"
                className="cursor-pointer transition-colors hover:stroke-red-500"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </motion.button>
            
            {/* Edit button for blog owner */}
            {isBlogOwner && (
              <>
                <motion.button
                  onClick={() => onEditPost?.(post)}
                  className="transition-colors"
                  title="Edit post"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => onDeletePost?.(post)}
                  className="transition-colors"
                  title="Delete post"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="cursor-pointer text-red-500 hover:text-red-700"
                  >
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6V20a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6M8,6V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2V6"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </motion.button>
              </>
            )}
          </div>
        )}

        {/* Likes - Only show here for posts WITH images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <p className="font-semibold text-gray-900 text-sm px-3 sm:px-4 mb-2">
            {formatLikes(likesCount)}
          </p>
        )}

        {/* Content */}
        <div className="mb-3 px-3 sm:px-4">
          <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Like button and stats for posts WITHOUT images - Twitter style */}
        {(!post.image_urls || post.image_urls.length === 0) && (
          <div className="px-3 sm:px-4 mb-3">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleLike}
                className="flex items-center gap-1 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill={hasLiked ? "#ef4444" : "none"}
                  stroke={hasLiked ? "#ef4444" : "#6b7280"}
                  strokeWidth="2"
                  className="cursor-pointer transition-colors hover:stroke-red-500"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className="text-sm text-gray-600">{likesCount}</span>
              </motion.button>
              
              {/* Edit and Delete buttons for blog owner */}
              {isBlogOwner && (
                <>
                  <motion.button
                    onClick={() => onEditPost?.(post)}
                    className="transition-colors"
                    title="Edit post"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg 
                      width="18" 
                      height="18" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </motion.button>
                  <motion.button
                    onClick={() => onDeletePost?.(post)}
                    className="transition-colors"
                    title="Delete post"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      <polyline points="3,6 5,6 21,6"></polyline>
                      <path d="M19,6V20a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6M8,6V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2V6"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </motion.button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mb-3 px-3 sm:px-4">
            {post.hashtags.map((tag, i) => (
              <span key={i} className="text-xs text-blue-500 mr-2 hover:text-blue-600 cursor-pointer transition-colors font-medium">#{tag}</span>
            ))}
          </div>
        )}

        {/* Spotify Embeds */}
        {post.spotify_urls && post.spotify_urls.length > 0 && (
          <div className="mb-3 px-3 sm:px-4 space-y-3">
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

        {/* Comments */}
        <div className="px-3 sm:px-4 pb-3">
          <Comments postId={post.id} isExpanded={true} />
        </div>
      </motion.div>
    </motion.div>
  )
}