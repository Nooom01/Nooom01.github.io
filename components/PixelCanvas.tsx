'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface PixelCanvasProps {
  src: string
  width: number
  height: number
  pixelSize?: number
  className?: string
}

export default function PixelCanvas({ src, width, height, pixelSize = 8, className = '' }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentPixelSize, setCurrentPixelSize] = useState(pixelSize)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Set canvas size
      canvas.width = width
      canvas.height = height
      
      // Turn off image smoothing for pixelated effect
      ctx.imageSmoothingEnabled = false
      
      // Calculate scaled dimensions for pixelation
      const scaledWidth = Math.floor(width / currentPixelSize)
      const scaledHeight = Math.floor(height / currentPixelSize)
      
      // Draw image at very small size
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
      
      // Scale it back up to create chunky pixels
      const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight)
      
      // Clear canvas and draw pixelated version
      ctx.clearRect(0, 0, width, height)
      
      // Draw each "pixel" as a larger square
      for (let y = 0; y < scaledHeight; y++) {
        for (let x = 0; x < scaledWidth; x++) {
          const i = (y * scaledWidth + x) * 4
          const r = imageData.data[i]
          const g = imageData.data[i + 1]
          const b = imageData.data[i + 2]
          const a = imageData.data[i + 3]
          
          if (a > 0) {
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`
            ctx.fillRect(
              x * currentPixelSize, 
              y * currentPixelSize, 
              currentPixelSize, 
              currentPixelSize
            )
          }
        }
      }
      
      setIsLoaded(true)
    }
    
    img.onerror = () => {
      console.error('Failed to load image:', src)
    }
    
    img.src = src
  }, [src, width, height, currentPixelSize])

  return (
    <motion.div 
      className={`relative inline-block ${className}`}
    >
      <canvas
        ref={canvasRef}
        className=""
        style={{
          width: `${width}px`,
          height: `${height}px`,
          imageRendering: 'pixelated',
        }}
      />
    </motion.div>
  )
}