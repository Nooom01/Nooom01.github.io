'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '@/lib/supabase-client'
import WeatherWidget from '@/components/WeatherWidget'

interface PostModalProps {
  onClose: () => void
  isBlogOwner?: boolean
  editPost?: {
    id: string
    title: string
    content: string
    category: string
    hashtags: string[]
    image_urls: string[]
    video_urls: string[]
  }
}

const categoryEmojis = {
  eat: '🍳',
  sleep: '😴',
  study: '📚',
  play: '🎮',
  life: '⭐',
}

// Post templates for each category
const postTemplates = {
  eat: [
    {
      name: "Restaurant Review",
      title: "Amazing [Food] at [Restaurant]!",
      content: "Just tried [food/dish] at [restaurant name] and it was incredible! The [describe taste/texture] was perfect. Rating: ⭐⭐⭐⭐⭐\n\nLocation: [address]\nPrice: [price range]\nWould definitely come back!",
      hashtags: "#foodie #restaurant #delicious #yummy"
    },
    {
      name: "Home Cooking",
      title: "Homemade [Dish Name]",
      content: "Cooked [dish name] today! 👨‍🍳\n\nIngredients I used:\n- [ingredient 1]\n- [ingredient 2]\n- [ingredient 3]\n\nIt turned out [how it was]! Next time I'll try [what to improve].",
      hashtags: "#homecooking #recipe #cooking #kitchen"
    },
    {
      name: "Quick Snack",
      title: "[Snack/Drink] Break",
      content: "Having [snack/drink] right now. Perfect for [time of day/mood/situation]! 😋",
      hashtags: "#snack #break #treat #yummy"
    }
  ],
  sleep: [
    {
      name: "Good Night",
      title: "Sleep Log",
      content: "Going to bed at [time]. Feeling [tired/energetic/peaceful]. Hope to get [X] hours of sleep tonight! 😴",
      hashtags: "#goodnight #sleep #bedtime #rest"
    },
    {
      name: "Morning Report", 
      title: "Sleep Log",
      content: "Slept for [X] hours last night. Woke up feeling [refreshed/tired/groggy]. Sleep quality: [rating/10] ⭐",
      hashtags: "#sleep #morning #rest #sleeplog"
    },
    {
      name: "Nap Time",
      title: "Sleep Log", 
      content: "Taking a [X] minute nap. Needed some rest after [activity/reason]. 💤",
      hashtags: "#nap #rest #recharge #sleepy"
    }
  ],
  study: [
    {
      name: "Learning Session",
      title: "Studying [Subject/Topic]",
      content: "Spent [X] hours studying [subject/topic] today. Learned about [key concepts]. \n\nProgress: [what you accomplished]\nNext: [what's next]\n\nFeeling [motivated/challenged/excited]! 📚",
      hashtags: "#study #learning #education #progress"
    },
    {
      name: "Course Update",
      title: "[Course Name] - Week [X]",
      content: "Week [X] of [course name] complete! \n\nThis week covered:\n- [topic 1]\n- [topic 2]\n- [topic 3]\n\nAssignment: [assignment details]\nDue: [date]",
      hashtags: "#course #online learning #progress #education"
    },
    {
      name: "Book Reading",
      title: "Reading: [Book Title]",
      content: "Currently reading '[book title]' by [author]. \n\nPage [X] of [total pages]\nChapter: [chapter name/number]\n\nThoughts so far: [your thoughts]",
      hashtags: "#reading #books #knowledge #learning"
    }
  ],
  play: [
    {
      name: "Gaming Session",
      title: "Playing [Game Name]",
      content: "Just had an epic [X] hour gaming session with [game name]! 🎮\n\nProgress: [what you achieved]\nLevel/Score: [level or score]\nBest moment: [highlight]\n\nNext goal: [what's next]",
      hashtags: "#gaming #videogames #fun #achievement"
    },
    {
      name: "Outdoor Activity",
      title: "[Activity] at [Location]",
      content: "Went [activity] at [location] today! The weather was [weather condition] and it was [how it felt].\n\nDuration: [time]\nWith: [who you went with]\nHighlight: [best part]",
      hashtags: "#outdoor #activity #fun #adventure"
    },
    {
      name: "Movie/Show",
      title: "Watched: [Title]",
      content: "Just finished watching '[title]' and wow! [your reaction]\n\nGenre: [genre]\nRating: [your rating]/10\nFavorite part: [what you liked]\n\nWould recommend to: [type of people]",
      hashtags: "#movie #tv #entertainment #review"
    }
  ],
  life: [
    {
      name: "Daily Reflection",
      title: "Today's Thoughts",
      content: "Reflecting on today... [your thoughts]\n\nGrateful for: [what you're grateful for]\nLearned: [what you learned]\nTomorrow's goal: [what you want to do tomorrow]",
      hashtags: "#reflection #gratitude #life #thoughts"
    },
    {
      name: "Achievement",
      title: "Accomplished: [Achievement]",
      content: "So proud of myself for [achievement]! 🎉\n\nIt took [time/effort] but I finally [what you did]. \n\nHow I feel: [emotions]\nNext challenge: [what's next]",
      hashtags: "#achievement #proud #success #milestone"
    },
    {
      name: "Random Thoughts",
      title: "Random Musings",
      content: "Just thinking about [topic/subject]...\n\n[your thoughts and observations]\n\nLife is [your perspective]! ✨",
      hashtags: "#thoughts #life #random #musings"
    }
  ]
}

interface FormData {
  content: string
  hashtags: string
}

export default function PostModal({ onClose, editPost, isBlogOwner = false }: PostModalProps) {
  // Security check - only blog owner can create/edit posts
  if (!isBlogOwner) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only the blog owner can create or edit posts.</p>
          <button
            onClick={onClose}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ images: string[], videos: string[] }>({ 
    images: editPost?.image_urls || [], 
    videos: editPost?.video_urls || [] 
  })
  const [isUploading, setIsUploading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(!editPost) // Show templates by default for new posts
  const [weatherData, setWeatherData] = useState<any>(null)
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: editPost ? {
      content: editPost.content,
      hashtags: editPost.hashtags?.join(' ') || ''
    } : {
      content: '',
      hashtags: ''
    }
  })

  const applyTemplate = (template: any) => {
    setValue('content', template.content)
    setValue('hashtags', template.hashtags)
    setShowTemplates(false)
  }

  const uploadFiles = async (files: FileList, type: 'images' | 'videos') => {
    if (!files || files.length === 0) return []

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${type}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      setUploadedFiles(prev => ({
        ...prev,
        [type]: [...prev[type], ...uploadedUrls]
      }))

      return uploadedUrls
    } catch (error) {
      console.error('Error uploading files:', error)
      alert(`Failed to upload ${type}: ${error}`)
      return []
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos') => {
    const files = e.target.files
    if (files) {
      uploadFiles(files, type)
    }
  }

  const removeFile = (url: string, type: 'images' | 'videos') => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter(file => file !== url)
    }))
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('You must be logged in to create posts')
        return
      }

      // Parse hashtags into array
      const hashtagsArray = data.hashtags 
        ? data.hashtags.split(' ').filter((tag: string) => tag.trim().length > 0)
        : []
      
      const postData = {
        category: editPost?.category || 'life', // Use existing category for edits, default to 'life' for new posts
        title: 'Untitled',
        content: data.content,
        hashtags: hashtagsArray,
        image_urls: uploadedFiles.images,
        video_urls: uploadedFiles.videos,
        is_draft: false,
        updated_at: new Date().toISOString(),
        weather: weatherData,
        user_id: user.id
      }
      
      if (editPost) {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editPost.id)
        
        if (error) throw error
        alert('Post updated successfully! ✨')
      } else {
        // Create new post
        const { error } = await supabase
          .from('posts')
          .insert(postData)
        
        if (error) throw error
        alert('Post created successfully! 🎉')
      }
      
      // Trigger avatar bounce
      window.dispatchEvent(new Event('user-interaction'))
      
      reset()
      setUploadedFiles({ images: [], videos: [] })
      onClose()
    } catch (error: any) {
      console.error(`Error ${editPost ? 'updating' : 'creating'} post:`, error)
      alert(`Failed to ${editPost ? 'update' : 'create'} post: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
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
        className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto pointer-events-auto mx-1 sm:mx-4"
        onClick={(e) => e.stopPropagation()}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-lg">📝</span>
            {editPost ? 'Edit' : 'Create'} Post
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-4 sm:p-6">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-gray-700 mb-2 font-medium text-sm">
                What's on your mind?
              </label>
              <textarea
                {...register('content', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                placeholder="Share your thoughts..."
              />
            </div>
            

            {/* Hashtags */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium text-sm">
                Hashtags:
              </label>
              <input
                {...register('hashtags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#life #thoughts #daily"
              />
            </div>

            {/* Photo/Video Upload */}
            {/* Photo Upload */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium text-sm">
                Photos:
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'images')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
              {uploadedFiles.images.length > 0 && (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {uploadedFiles.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Upload ${index + 1}`} 
                        className="w-full h-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(url, 'images')}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium text-sm">
                Videos:
              </label>
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'videos')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUploading}
              />
              {uploadedFiles.videos.length > 0 && (
                <div className="mt-2 space-y-2">
                  {uploadedFiles.videos.map((url, index) => (
                    <div key={index} className="relative">
                      <video 
                        src={url} 
                        className="w-full h-32 object-cover rounded border border-gray-300"
                        controls
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(url, 'videos')}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isUploading && (
              <div className="text-center text-gray-600 text-sm">
                Uploading files... 📤
              </div>
            )}

            {/* Weather Widget */}
            <div className="pt-4 border-t border-gray-200">
              <WeatherWidget onWeatherUpdate={setWeatherData} />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}