'use client'

import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import Comments from '@/components/Comments'
import SpotifyEmbed from '@/components/SpotifyEmbed'

interface CategoryFeedProps {
  category: string
  onClose: () => void
  onEditPost?: (post: Post) => void
  onDeletePost?: (post: Post) => void
  isBlogOwner?: boolean
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

interface Post {
  id: string
  title: string
  content: string
  hashtags: string[]
  image_urls: string[]
  video_urls: string[]
  created_at: string
  user_id: string
  username?: string
  weather?: {
    temp: number
    condition: string
    icon: string
    location: string
  }
  music?: {
    title: string
    artist: string
    url?: string
    source?: string
    spotifyId?: string
    type?: 'track' | 'playlist' | 'album'
  }
}

function SimplePost({ post, category, onEditPost, onDeletePost, isBlogOwner }: { post: Post; category: string; onEditPost?: (post: Post) => void; onDeletePost?: (post: Post) => void; isBlogOwner?: boolean }) {
  console.log('🎯 SimplePost component rendered for post:', post.id, 'category:', category)
  
  const [showComments, setShowComments] = useState(false)
  const [commentsCount, setCommentsCount] = useState(0)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    fetchLikesAndComments()
  }, [post.id])

  const fetchLikesAndComments = async () => {
    try {
      console.log('🔍 Fetching likes for post:', post.id)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 Current user:', user?.id || 'Not logged in')
      
      // Fetch likes count
      const { count: likesCount, error: likesError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      
      console.log('❤️ Likes count result:', { likesCount, likesError })
      
      if (likesError) {
        console.error('Likes table error:', likesError)
        setLikesCount(0)
      } else {
        setLikesCount(likesCount || 0)
      }
      
      // Fetch comments count
      const { count: commentsCountData, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      
      console.log('💬 Comments count result:', { commentsCountData, commentsError })
      
      if (commentsError) {
        console.error('Comments table error:', commentsError)
        setCommentsCount(0)
      } else {
        setCommentsCount(commentsCountData || 0)
      }
      
      // Check if current user liked this post
      if (user) {
        const { data: userLike, error: likeError } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .maybeSingle()
        
        console.log('🔍 User like check:', { userLike, likeError, postId: post.id, userId: user.id })
        
        // Only log actual errors, not "no rows found"
        if (likeError && likeError.code !== 'PGRST116') {
          console.error('Error checking user like:', likeError)
          setIsLiked(false)
        } else {
          setIsLiked(!!userLike)
          console.log('❤️ User liked this post:', !!userLike)
        }
      } else {
        console.log('👤 No user logged in, setting isLiked to false')
        setIsLiked(false)
      }
    } catch (error) {
      console.error('Error fetching likes/comments:', error)
      // Set defaults on error
      setCommentsCount(0)
      setLikesCount(0)
      setIsLiked(false)
    }
  }

  const formatLikes = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k likes`
    }
    return `${num} likes`
  }

  const username = post.username || 'kawaii_blogger'

  const toggleLike = async () => {
    console.log('❤️ TOGGLE LIKE CLICKED for post:', post.id)
    
    if (isLiking) return
    
    setIsLiking(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('❌ User not authenticated')
        setIsLiking(false)
        return
      }
      
      console.log('🔄 Toggling like:', { postId: post.id, userId: user.id, currentlyLiked: isLiked })
      
      if (isLiked) {
        // Unlike
        console.log('➖ Removing like...')
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)
        
        if (error) {
          console.error('❌ Error removing like:', error)
          throw error
        }
        
        console.log('✅ Like removed successfully')
        setLikesCount(prev => Math.max(0, prev - 1))
        setIsLiked(false)
      } else {
        // Like
        console.log('➕ Adding like...')
        const { error } = await supabase
          .from('likes')
          .insert({ post_id: post.id, user_id: user.id })
        
        if (error) {
          console.error('❌ Error adding like:', error)
          throw error
        }
        
        console.log('✅ Like added successfully')
        setLikesCount(prev => prev + 1)
        setIsLiked(true)
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <motion.div 
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
      style={{ maxWidth: '468px', width: '100%' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      data-post-id={post.id}
      data-component="simple-post"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-xs sm:text-sm">{username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{username}</h3>
            {/* Show timestamp for posts without images (Twitter-style) */}
            {(!post.image_urls || post.image_urls.length === 0) && (
              <span className="text-xs text-gray-500">· {new Date(post.created_at).toLocaleDateString()}</span>
            )}
          </div>
          {/* Show title only for posts with images */}
          {category !== 'sleep' && post.image_urls && post.image_urls.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-gray-500">{post.title}</span>
            </div>
          )}
        </div>
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
      {category !== 'sleep' && post.image_urls && post.image_urls.length > 0 && (
        <div 
          className="relative bg-gray-50 flex items-center justify-center"
          style={{ height: '300px' }}
        >
          <img src={post.image_urls[0]} alt="Post" className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Sleep posts: Show emoji inline with content */}
      {category === 'sleep' && (
        <div className="mb-3 mx-3 sm:mx-4 flex items-center gap-3 bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl">
          <motion.div 
            className="flex items-center justify-center"
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {React.cloneElement(categoryIcons[category as keyof typeof categoryIcons], {
                className: "w-6 h-6"
              })}
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
            disabled={isLiking}
            className="transition-transform"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill={isLiked ? "#ef4444" : "none"}
              stroke={isLiked ? "#ef4444" : "#374151"}
              strokeWidth="2"
              className="cursor-pointer transition-colors hover:stroke-red-500"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </motion.button>
          
          {/* Edit button for blog owner */}
          {isBlogOwner && (
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
          )}

          {/* Delete button for blog owner */}
          {isBlogOwner && (
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
        {category === 'sleep' || (!post.image_urls || post.image_urls.length === 0) ? (
          /* Sleep posts and posts without images: Twitter-style */
          <p className="text-sm text-gray-900 leading-relaxed">
            {post.content}
          </p>
        ) : (
          /* Posts with images: Instagram-style with username */
          <p className="text-sm text-gray-900 leading-relaxed">
            <span className="font-semibold">{username}</span> {post.content}
          </p>
        )}
      </div>


      {/* Like button and stats for posts WITHOUT images - Twitter style */}
      {(!post.image_urls || post.image_urls.length === 0) && (
        <div className="px-3 sm:px-4 mb-3">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={toggleLike}
              disabled={isLiking}
              className="flex items-center gap-1 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill={isLiked ? "#ef4444" : "none"}
                stroke={isLiked ? "#ef4444" : "#6b7280"}
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

      {/* Comments count */}
      <p 
        className="text-sm text-gray-500 mb-3 cursor-pointer hover:text-gray-700 transition-colors px-3 sm:px-4"
        onClick={() => setShowComments(!showComments)}
      >
        {showComments ? 'Hide' : 'View'} {commentsCount} comments
      </p>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="mb-3 px-3 sm:px-4">
          {post.hashtags.map((tag, i) => (
            <span key={i} className="text-xs text-blue-500 mr-2 hover:text-blue-600 cursor-pointer transition-colors font-medium">#{tag}</span>
          ))}
        </div>
      )}

      {/* Comments section */}
      {!showComments && (
        <div 
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-100 cursor-pointer"
          onClick={() => setShowComments(true)}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-xs">{username.charAt(0).toUpperCase()}</span>
          </div>
          <span className="flex-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">Add a comment...</span>
        </div>
      )}
      <Comments postId={post.id} isExpanded={showComments} />
    </motion.div>
  )
}

export default function CategoryFeed({ category, onClose, onEditPost, onDeletePost, isBlogOwner }: CategoryFeedProps) {
  console.log('📋 CategoryFeed component loaded for category:', category)
  
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [category])

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts for category:', category)
      
      // First, get posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('category', category)
        .eq('is_draft', false)
        .order('created_at', { ascending: false })

      console.log('Posts query result:', { posts, error: postsError })

      if (postsError) throw postsError

      if (!posts || posts.length === 0) {
        console.log('No posts found for category:', category)
        setPosts([])
        return
      }

      // Then get usernames for each post
      const postsWithUsernames = await Promise.all(
        posts.map(async (post) => {
          if (post.user_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', post.user_id)
              .single()
            
            return {
              ...post,
              username: profile?.username || 'Blog Owner'
            }
          } else {
            return {
              ...post,
              username: 'Blog Owner'
            }
          }
        })
      )
      
      setPosts(postsWithUsernames)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-1 sm:p-4 pointer-events-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white bg-opacity-90 rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto pointer-events-auto mx-1 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="inline-flex items-center">{categoryIcons[category as keyof typeof categoryIcons]}</span>
            {category.charAt(0).toUpperCase() + category.slice(1)} Posts
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3">
          {loading ? (
            <p className="text-center text-gray-500 text-sm">Loading posts...</p>
          ) : posts.length > 0 ? (
            <div className="space-y-6 flex flex-col items-center">
              {posts.map((post) => (
                <SimplePost key={post.id} post={post} category={category} onEditPost={onEditPost} onDeletePost={onDeletePost} isBlogOwner={isBlogOwner} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm bg-gray-50 p-6 rounded-xl">
              No posts in this category yet.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}