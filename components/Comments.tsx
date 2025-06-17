'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface Comment {
  id: string
  content: string
  author_name: string
  created_at: string
  user_id: string | null
}

interface CommentsProps {
  postId: string
  isExpanded: boolean
}

export default function Comments({ postId, isExpanded }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isExpanded) {
      fetchComments()
      const unsubscribe = subscribeToComments()
      return () => unsubscribe?.()
    }
  }, [postId, isExpanded])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          setComments(prev => [...prev, payload.new as Comment])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const commentData = {
        post_id: postId,
        content: newComment.trim(),
        author_name: user ? 'kawaii_blogger' : (authorName.trim() || 'Anonymous'),
        user_id: user?.id || null
      }

      console.log('Submitting comment:', commentData)
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Comment created:', data)
      setNewComment('')
      setAuthorName('')
      // Refresh comments after successful submission
      fetchComments()
    } catch (error: any) {
      console.error('Error posting comment:', error)
      alert(`Failed to post comment: ${error.message || 'Unknown error'}`)
    } finally {
      setSubmitting(false)
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

  if (!isExpanded) return null

  return (
    <div className="mt-4 pt-4 border-t-2 border-green-200">
      {/* Comments list */}
      {loading ? (
        <p className="text-xs text-gray-500">Loading comments...</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-bold">{comment.author_name || 'kawaii_blogger'}</span>{' '}
                  {comment.content}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTime(comment.created_at)}
                </p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-gray-500">No comments yet. Be the first!</p>
          )}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Post
          </button>
        </div>
      </form>
    </div>
  )
}