'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface PixelatedImageProps {
  src: string
  alt: string
  width: number
  height: number
  pixelSize?: 'small' | 'medium' | 'large'
  className?: string
}

export default function PixelatedImage({ 
  src, 
  alt, 
  width, 
  height, 
  pixelSize = 'medium',
  className = '' 
}: PixelatedImageProps) {
  const [isPixelated, setIsPixelated] = useState(true)

  const getPixelClass = () => {
    switch (pixelSize) {
      case 'small':
        return 'pixelated pixel-hover'
      case 'large':
        return 'pixel-8bit pixel-hover'
      default:
        return 'pixel-retro pixel-hover'
    }
  }

  return (
    <motion.div 
      className="relative inline-block cursor-pointer"
      onClick={() => setIsPixelated(!isPixelated)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-all duration-300 ${isPixelated ? getPixelClass() : ''} ${className}`}
        style={{
          imageRendering: isPixelated ? 'pixelated' : 'auto',
        }}
      />
      <div className="absolute bottom-1 right-1 bg-kawaii-surface border border-kawaii-border px-1 text-pixel-xs font-pixel opacity-70">
        {isPixelated ? '8-BIT' : 'HD'}
      </div>
    </motion.div>
  )
}