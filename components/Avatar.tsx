'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import PixelCanvas from './PixelCanvas'

export default function Avatar() {
  const [bounce, setBounce] = useState(false)

  // Trigger bounce animation on certain events
  useEffect(() => {
    const handleInteraction = () => {
      setBounce(true)
      setTimeout(() => setBounce(false), 1000)
    }

    // Add event listeners for likes, comments, etc.
    window.addEventListener('user-interaction', handleInteraction)
    return () => window.removeEventListener('user-interaction', handleInteraction)
  }, [])

  return (
    <motion.div
      className="relative"
      animate={{
        y: bounce ? [0, -10, 0] : 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="flex justify-center items-center"
        whileHover={{ 
          scale: 1.05,
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <div className="w-20 h-20">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            {/* Simple character outline */}
            <circle cx="50" cy="35" r="12" className="stroke-gray-600" />
            {/* Body */}
            <path d="M30 65 Q30 55 35 52 Q45 48 50 48 Q55 48 65 52 Q70 55 70 65 L70 80 Q70 85 65 85 L35 85 Q30 85 30 80 Z" className="stroke-gray-600" fill="none" />
            {/* Simple face features */}
            <circle cx="46" cy="32" r="1.5" className="fill-gray-600" />
            <circle cx="54" cy="32" r="1.5" className="fill-gray-600" />
            <path d="M47 38 Q50 40 53 38" className="stroke-gray-600" strokeLinecap="round" />
            {/* Small decorative elements */}
            <circle cx="25" cy="25" r="2" className="stroke-blue-400" strokeWidth="1.5" fill="none" />
            <circle cx="75" cy="30" r="1.5" className="stroke-blue-400" strokeWidth="1.5" fill="none" />
            <path d="M20 75 L22 73 L24 75 L22 77 Z" className="stroke-blue-400" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  )
}