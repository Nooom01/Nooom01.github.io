'use client'

import { useState, useEffect } from 'react'
import RecentActivity from '@/components/RecentActivity'
import SimpleAuth from '@/components/SimpleAuth'
import PostModal from '@/components/PostModal'
import CategoryFeed from '@/components/CategoryFeed'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import NowPlaying from '@/components/NowPlaying'
import { supabase } from '@/lib/supabase-client'

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showCategoryFeed, setShowCategoryFeed] = useState(false)
  const [editingPost, setEditingPost] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [postToDelete, setPostToDelete] = useState<any>(null)
  const [isBlogOwner, setIsBlogOwner] = useState(false)

  const handleCategoryClick = (category: string) => {
    console.log('Category clicked:', category)
    setSelectedCategory(category)
    setShowCategoryFeed(true)
  }

  const handleCreatePost = (category: string) => {
    console.log('Create post clicked:', category)
    setSelectedCategory(category)
    setEditingPost(null)
    setShowCreatePost(true)
  }

  const handleEditPost = (post: any) => {
    setSelectedCategory(post.category)
    setEditingPost(post)
    setShowCreatePost(true)
    setShowCategoryFeed(false)
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
          <header className="bg-blue-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-blue-100">
            <h1 className="text-lg sm:text-xl font-medium text-gray-900 text-center">
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

            {/* Middle Section - Activities */}
            <div className="flex-1 lg:flex-initial lg:col-span-2 lg:border-r border-b lg:border-b-0 border-gray-200 bg-gray-50 order-2 lg:order-1">
              <div className="border-b border-gray-200 bg-white px-4 py-2">
                <h2 className="text-sm font-medium text-gray-900 tracking-tight">Activities</h2>
              </div>
              <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { 
                    category: 'eat', 
                    icon: (
                      <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ), 
                    label: 'Eat' 
                  },
                  { 
                    category: 'sleep', 
                    icon: (
                      <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ), 
                    label: 'Sleep' 
                  },
                  { 
                    category: 'study', 
                    icon: (
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ), 
                    label: 'Study' 
                  },
                  { 
                    category: 'play', 
                    icon: (
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-4-6h4a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                      </svg>
                    ), 
                    label: 'Play' 
                  },
                  { 
                    category: 'life', 
                    icon: (
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    ), 
                    label: 'Life' 
                  }
                ].map(({ category, icon, label }) => (
                  <div 
                    key={category} 
                    className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md sm:shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <div className="transform scale-75 sm:scale-100">
                          {icon}
                        </div>
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-gray-900">{label}</span>
                      {isBlogOwner && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreatePost(category);
                          }}
                          className="mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium hover:from-gray-900 hover:to-black shadow-md"
                        >
                          <span className="hidden sm:inline">Create New</span>
                          <span className="sm:hidden">New</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
              
              {/* Recent Activity Block */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 flex-shrink-0">
                  <h2 className="text-sm font-medium text-gray-900 tracking-tight">Recent Activity</h2>
                </div>
                <div className="flex-1 overflow-y-auto min-h-[200px] lg:min-h-[300px]">
                  <div className="p-4">
                    <RecentActivity onCategoryClick={handleCategoryClick} />
                    <div className="h-6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showCreatePost && selectedCategory && (
          <PostModal
            category={selectedCategory}
            editPost={editingPost}
            onClose={() => {
              setShowCreatePost(false)
              setSelectedCategory(null)
              setEditingPost(null)
            }}
          />
        )}

        {showCategoryFeed && selectedCategory && (
          <CategoryFeed
            category={selectedCategory}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            isBlogOwner={isBlogOwner}
            onClose={() => {
              setShowCategoryFeed(false)
              setSelectedCategory(null)
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