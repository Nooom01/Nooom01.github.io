'use client'

import { motion } from 'framer-motion'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  post: any
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({ isOpen, post, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-0 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🗑️ Delete Post
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-900 mb-3">
              Are you sure you want to delete this post?
            </p>
            
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
              <p className="text-sm font-bold text-gray-900">
                {post?.title || 'Sleep Log'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {post?.content.substring(0, 100)}...
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4">
            <p className="text-xs text-red-700">
              ⚠️ This action cannot be undone. All comments and likes will also be deleted.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}