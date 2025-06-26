import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })
const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: 'Daily Check-In',
  description: 'Personal daily activity tracker and life journal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${poppins.variable} bg-kawaii-background`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}