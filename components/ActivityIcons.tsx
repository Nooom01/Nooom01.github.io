'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase-client'

interface ActivityIconsProps {
  onCategoryClick: (category: string) => void
  onCreateClick: (category: string) => void
}

const activities = [
  { id: 'eat', emoji: '🍳', label: 'EAT', position: { top: '-30px', left: '-100px' }, color: 'bg-green-200' },
  { id: 'sleep', emoji: '😴', label: 'SLEEP', position: { top: '-30px', right: '-100px' }, color: 'bg-emerald-200' },
  { id: 'study', emoji: '📚', label: 'STUDY', position: { bottom: '-30px', left: '-100px' }, color: 'bg-lime-200' },
  { id: 'play', emoji: '🎮', label: 'PLAY', position: { bottom: '-30px', right: '-100px' }, color: 'bg-green-300' },
  { id: 'life', emoji: '⭐', label: 'LIFE', position: { top: '50%', left: '-140px', transform: 'translateY(-50%)' }, color: 'bg-emerald-300' },
]

export default function ActivityIcons({ onCategoryClick, onCreateClick }: ActivityIconsProps) {
  const [isBlogOwner, setIsBlogOwner] = useState(false)

  useEffect(() => {
    checkOwnership()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkOwnership()
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkOwnership = async () => {
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
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          className="absolute pointer-events-auto z-30"
          style={activity.position}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.2, type: "spring", stiffness: 300 }}
        >
          <motion.button
            className={`activity-icon pixel-icon group relative ${activity.color} cursor-pointer`}
            whileHover={{ 
              scale: 1.05, 
              y: -3
            }}
            whileTap={{ 
              scale: 0.9,
              rotate: 0 
            }}
            onClick={() => {
              console.log('Activity clicked:', activity.id)
              onCategoryClick(activity.id)
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              if (isBlogOwner) {
                onCreateClick(activity.id)
              }
            }}
            transition={{ duration: 0.1 }}
          >
            <span className="text-2xl filter drop-shadow-sm">{activity.emoji}</span>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity font-bold bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">
              {activity.label}
            </span>
          </motion.button>
        </motion.div>
      ))}
    </div>
  )
}