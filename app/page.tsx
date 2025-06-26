'use client'

import { useState, useEffect } from 'react'
import RecentActivity from '@/components/RecentActivity'
import SimpleAuth from '@/components/SimpleAuth'
import PostModal from '@/components/PostModal'
import AllPostsFeed from '@/components/AllPostsFeed'
import SinglePostModal from '@/components/SinglePostModal'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import NowPlaying from '@/components/NowPlaying'
import { supabase } from '@/lib/supabase-client'

export default function Home() {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showSinglePost, setShowSinglePost] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [postToDelete, setPostToDelete] = useState<any>(null)
  const [isBlogOwner, setIsBlogOwner] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('🚀 React component mounted! Page.tsx is running')
    setMounted(true)
  }, [])


  const handlePostClick = (postId: string) => {
    console.log('📝 Post clicked:', postId)
    setSelectedPostId(postId)
    setShowSinglePost(true)
  }

  const handleCreatePost = () => {
    console.log('Create post clicked')
    setEditingPost(null)
    setShowCreatePost(true)
  }

  const handleEditPost = (post: any) => {
    setEditingPost(post)
    setShowCreatePost(true)
    setShowSinglePost(false)
  }

  const handleDeletePost = (post: any) => {
    setPostToDelete(post)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!postToDelete) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postToDelete.id)

      if (error) throw error

      alert('Post deleted successfully! 🗑️')
      
      // Close dialog and refresh
      setShowDeleteDialog(false)
      setPostToDelete(null)
      window.location.reload()
    } catch (error: any) {
      console.error('Error deleting post:', error)
      alert(`Failed to delete post: ${error.message || 'Unknown error'}`)
    }
  }

  const cancelDelete = () => {
    setShowDeleteDialog(false)
    setPostToDelete(null)
  }

  // Check if current user is blog owner
  useEffect(() => {
    const checkBlogOwner = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_blog_owner')
            .eq('id', user.id)
            .single()
          
          setIsBlogOwner(profile?.is_blog_owner || false)
        } else {
          setIsBlogOwner(false)
        }
      } catch (error) {
        console.error('Error checking blog owner status:', error)
        setIsBlogOwner(false)
      }
    }

    checkBlogOwner()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkBlogOwner()
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 p-0">
      <div className="min-h-screen flex flex-col relative">
        {/* Full height container */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Authentication positioned over the header */}
          <SimpleAuth />
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-6 py-5 sm:py-6 border-b border-gray-200 shadow-sm">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center font-[var(--font-poppins)] tracking-tight">
              Daily Check-In
            </h1>
          </header>

          {/* Main Content Grid - fills remaining height */}
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-4 min-h-0">
            {/* Left Section - About - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:block lg:col-span-1 lg:border-r border-gray-200 bg-white">
              {/* About Block */}
              <div className="p-4">
                <h2 className="text-sm font-medium text-gray-900 mb-2 tracking-tight">About</h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Hi! Stop checking on me directly, just look at this. How easy right?
                </p>
              </div>
            </div>

            {/* Middle Section - Posts Feed */}
            <div className="flex-1 lg:flex-initial lg:col-span-2 lg:border-r border-b lg:border-b-0 border-gray-200 bg-white order-2 lg:order-1 flex flex-col">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900 tracking-tight">All Posts</h2>
                {isBlogOwner && (
                  <button 
                    onClick={handleCreatePost}
                    className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                  >
                    Create Post
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-0">
                <AllPostsFeed 
                  onPostClick={handlePostClick}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  isBlogOwner={isBlogOwner}
                />
              </div>
            </div>

            {/* Right Section - Now Playing & Recent - Shown first on mobile */}
            <div className="lg:col-span-1 bg-white flex flex-col h-auto lg:h-full order-1 lg:order-2">
              {/* Mobile About Section */}
              <div className="lg:hidden border-b border-gray-200">
                <div className="p-4">
                  <h2 className="text-sm font-medium text-gray-900 mb-2 tracking-tight">About</h2>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Hi! Stop checking on me directly, just look at this. How easy right?
                  </p>
                </div>
              </div>
              
              {/* Now Playing Block */}
              <div className="border-b border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                  <h2 className="text-sm font-medium text-gray-900 tracking-tight">Now Playing</h2>
                </div>
                <div className="p-4">
                  <NowPlaying />
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Modals */}
        {showCreatePost && (
          <PostModal
            editPost={editingPost}
            isBlogOwner={isBlogOwner}
            onClose={() => {
              setShowCreatePost(false)
              setEditingPost(null)
            }}
          />
        )}

        {mounted && showSinglePost && selectedPostId && (
          <SinglePostModal
            postId={selectedPostId}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            isBlogOwner={isBlogOwner}
            onClose={() => {
              setShowSinglePost(false)
              setSelectedPostId(null)
            }}
          />
        )}


        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          post={postToDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    </main>
  )
}