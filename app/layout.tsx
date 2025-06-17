import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kawaii Blog - My Personal Life Journal',
  description: 'A cute personal blog to share my daily activities and thoughts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-kawaii-background`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}