'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-client'

interface RecentPost {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  hashtags: string[]
}

const categoryIcons = {
  eat: (
    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  sleep: (
    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  study: (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  play: (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-6h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4a2 2 0 012-2z" />
    </svg>
  ),
  life: (
    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

interface RecentActivityProps {
  onCategoryClick?: (category: string) => void
  onPostClick?: (postId: string) => void
}

export default function RecentActivity({ onCategoryClick, onPostClick }: RecentActivityProps = {}) {
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('RecentActivity component mounted')
    fetchRecentPosts()
    
    // Subscribe to real-time updates instead of polling
    const unsubscribe = subscribeToNewPosts()
    
    // Auto-refresh every 30 seconds as a fallback
    const interval = setInterval(() => {
      fetchRecentPosts()
    }, 30000)
    
    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const fetchRecentPosts = async () => {
    try {
      // Don't show loading state on subsequent fetches to avoid flicker
      if (recentPosts.length === 0) {
        setLoading(true)
      }
      
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, category, created_at, hashtags')
        .eq('is_draft', false)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      // Only update if data has changed
      const hasChanged = JSON.stringify(data) !== JSON.stringify(recentPosts)
      if (hasChanged) {
        setRecentPosts(data || [])
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error)
      // Only clear posts on initial load error
      if (recentPosts.length === 0) {
        setRecentPosts([])
      }
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNewPosts = () => {
    const channel = supabase
      .channel('recent_posts_updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('New post created:', payload)
          fetchRecentPosts()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Post updated:', payload)
          fetchRecentPosts()
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

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Recent Activity</span>
        <button 
          onClick={() => {
            console.log('Refresh button clicked');
            fetchRecentPosts();
          }}
          disabled={loading}
          className="px-2 py-1 text-xs text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <span className="inline-block animate-spin">⟳</span>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
      <div className="">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentPosts.length > 0 ? (
          <motion.div className="space-y-2">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all group"
                onClick={() => onPostClick?.(post.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                  {categoryIcons[post.category as keyof typeof categoryIcons]}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-gray-900">
                    <span className="font-semibold">{post.title}</span>
                    {post.title && post.content && ' · '}
                    <span className="text-gray-600">{truncateContent(post.content)}</span>
                  </p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="mt-1 flex gap-2">
                      {post.hashtags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-blue-500 hover:text-blue-600 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(post.created_at)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
            No recent activity yet. Create your first post!
          </p>
        )}
      </div>
    </div>
  )
}