'use client'

import { motion } from 'framer-motion'

interface PostProps {
  id: string
  username: string
  location?: string
  imageUrl: string
  likes: number
  caption: string
  comments: number
  timestamp: string
}

export default function Post({ 
  id, 
  username, 
  location, 
  imageUrl, 
  likes, 
  caption, 
  comments,
  timestamp 
}: PostProps) {
  const formatLikes = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k likes`
    }
    return `${num} likes`
  }

  return (
    <motion.article
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ width: '468px' }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-sm">{username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{username}</h3>
          {location && (
            <div className="flex items-center gap-1 mt-0.5">
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-gray-500">{location}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative bg-gray-50 flex items-center justify-center" style={{ height: '400px' }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Post content" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <motion.span 
              className="text-6xl"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎮
            </motion.span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <motion.button 
          className="hover:scale-110 active:scale-95 transition-transform"
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6 text-gray-700 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6 text-gray-700 hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </motion.button>
        <motion.button 
          className="ml-auto"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6 text-gray-700 hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </motion.button>
      </div>

      {/* Likes count */}
      <p className="font-semibold text-gray-900 text-sm px-4 mb-2">
        {formatLikes(likes)}
      </p>

      {/* Caption */}
      <div className="mb-3 px-4">
        <p className="text-gray-900 text-sm leading-relaxed">
          <span className="font-semibold">{username}</span> {caption}
          {caption.length > 50 && (
            <button className="text-gray-500 ml-1 hover:text-gray-700 transition-colors">...more</button>
          )}
        </p>
      </div>

      {/* View comments */}
      {comments > 0 && (
        <p className="text-sm text-gray-500 mb-3 cursor-pointer hover:text-gray-700 transition-colors px-4">
          View {comments} comments
        </p>
      )}

      {/* Add comment */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-xs">{username.charAt(0).toUpperCase()}</span>
        </div>
        <p className="flex-1 text-sm text-gray-500 cursor-text hover:text-gray-700 transition-colors">Add a comment...</p>
      </div>
    </motion.article>
  )
}