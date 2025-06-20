import type { Metadata } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })
const bebas = Bebas_Neue({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas'
})

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
      <body className={`${inter.className} ${bebas.variable} bg-kawaii-background`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}