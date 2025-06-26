'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-client'
import React from 'react'

interface Post {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  hashtags: string[]
  image_urls?: string[]
  video_urls?: string[]
  music?: any
  weather?: {
    temp: number
    location: string
    icon: string
    condition: string
  }
  profiles?: {
    username: string
    avatar_url?: string
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

interface AllPostsFeedProps {
  onPostClick?: (postId: string) => void
  onEditPost?: (post: any) => void
  onDeletePost?: (post: any) => void
  isBlogOwner?: boolean
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

export default function AllPostsFeed({ onPostClick, onEditPost, onDeletePost, isBlogOwner }: AllPostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [likesCount, setLikesCount] = useState<Record<string, number>>({})
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({})
  const [user, setUser] = useState<any>(null)

  const POSTS_PER_PAGE = 10

  useEffect(() => {
    fetchPosts()
    getCurrentUser()
    
    const unsubscribe = subscribeToPostUpdates()
    
    return () => {
      unsubscribe()
    }
  }, [])

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchPosts = async (offset = 0, append = false) => {
    try {
      if (!append) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, category, created_at, hashtags, image_urls, video_urls, music, weather')
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1)

      if (error) {
        console.error('Supabase error:', error.message || error)
        throw error
      }
      
      const newPosts = data || []
      
      // Add mock profile data
      const postsWithProfile = newPosts.map(post => ({
        ...post,
        profiles: {
          username: 'Blog Owner',
          avatar_url: null
        }
      }))
      
      if (append) {
        setPosts(prev => [...prev, ...postsWithProfile])
      } else {
        setPosts(postsWithProfile)
      }
      
      // Fetch likes for all posts
      if (postsWithProfile.length > 0) {
        await fetchLikesForPosts(postsWithProfile.map(p => p.id))
      }
      
      setHasMore(newPosts.length === POSTS_PER_PAGE)
    } catch (error: any) {
      console.error('Error fetching posts:', error.message || error)
      if (!append) {
        setPosts([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMorePosts = () => {
    fetchPosts(posts.length, true)
  }

  const fetchLikesForPosts = async (postIds: string[]) => {
    try {
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .in('post_id', postIds)

      // Count likes per post
      const likesPerPost: Record<string, number> = {}
      postIds.forEach(id => likesPerPost[id] = 0)
      likes?.forEach(like => {
        likesPerPost[like.post_id] = (likesPerPost[like.post_id] || 0) + 1
      })
      setLikesCount(prev => ({ ...prev, ...likesPerPost }))

      // Check which posts the user has liked
      if (user) {
        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('user_id', user.id)

        const likedPosts: Record<string, boolean> = {}
        userLikes?.forEach(like => {
          likedPosts[like.post_id] = true
        })
        setHasLiked(prev => ({ ...prev, ...likedPosts }))
      } else {
        // For anonymous users
        const sessionId = getOrCreateSessionId()
        const { data: sessionLikes } = await supabase
          .from('likes')
          .select('post_id')
          .in('post_id', postIds)
          .eq('session_id', sessionId)

        const likedPosts: Record<string, boolean> = {}
        sessionLikes?.forEach(like => {
          likedPosts[like.post_id] = true
        })
        setHasLiked(prev => ({ ...prev, ...likedPosts }))
      }
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const toggleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation()
    
    try {
      if (hasLiked[postId]) {
        // Remove like
        if (user) {
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id)
        } else {
          const sessionId = getOrCreateSessionId()
          await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('session_id', sessionId)
        }
        setLikesCount(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) - 1) }))
        setHasLiked(prev => ({ ...prev, [postId]: false }))
      } else {
        // Add like
        const likeData = user 
          ? { post_id: postId, user_id: user.id }
          : { post_id: postId, session_id: getOrCreateSessionId() }

        await supabase
          .from('likes')
          .insert(likeData)
        
        setLikesCount(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
        setHasLiked(prev => ({ ...prev, [postId]: true }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const subscribeToPostUpdates = () => {
    const channel = supabase
      .channel('all_posts_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const truncateContent = (content: string, maxLength: number = 280) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const formatLikes = (count: number) => {
    if (count === 0) return ''
    if (count === 1) return '1 like'
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k likes`
    }
    return `${count} likes`
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {posts.length > 0 ? (
          <motion.div className="space-y-0 divide-y divide-gray-200">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onPostClick?.(post.id)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {post.profiles?.username?.charAt(0).toUpperCase() || 'B'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{post.profiles?.username || 'Blog Owner'}</h3>
                        <span className="text-gray-500">·</span>
                        <span className="text-sm text-gray-500">{formatTime(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Weather info */}
                  {post.weather && (
                    <div className="mb-3">
                      <div className="bg-gray-50 px-3 py-2 rounded-xl inline-flex items-center gap-2">
                        <span className="text-sm">{post.weather.icon}</span>
                        <span className="text-xs text-gray-600 font-medium">
                          {post.weather.temp}°C in {post.weather.location}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="mb-3">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {truncateContent(post.content)}
                    </p>
                  </div>

                  {/* Image preview if exists */}
                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mb-3 -mx-4">
                      <img 
                        src={post.image_urls[0]} 
                        alt="Post" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Hashtags */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mb-3">
                      {post.hashtags.map((tag, i) => (
                        <span key={i} className="text-sm text-blue-500 mr-2 hover:text-blue-600 cursor-pointer transition-colors font-medium">#{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6">
                    <motion.button
                      onClick={(e) => toggleLike(e, post.id)}
                      className="flex items-center gap-2 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={hasLiked[post.id] ? "#ef4444" : "none"}
                        stroke={hasLiked[post.id] ? "#ef4444" : "#6b7280"}
                        strokeWidth="2"
                        className="cursor-pointer transition-colors hover:stroke-red-500"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span className="text-sm text-gray-600">
                        {formatLikes(likesCount[post.id] || 0)}
                      </span>
                    </motion.button>

                    <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span className="text-sm">Comment</span>
                    </button>

                    {/* Edit and Delete buttons for blog owner */}
                    {isBlogOwner && (
                      <div className="ml-auto flex gap-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditPost?.(post)
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeletePost?.(post)
                          }}
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
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No posts yet.</p>
            {isBlogOwner && (
              <p className="text-sm text-gray-400">Create your first post to get started!</p>
            )}
          </div>
        )}
        
        {hasMore && posts.length > 0 && (
          <div className="p-4 text-center">
            <button
              onClick={loadMorePosts}
              disabled={loadingMore}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}