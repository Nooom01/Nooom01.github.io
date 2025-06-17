import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseKey)
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}