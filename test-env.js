// Temporary test file to check environment variables
console.log('Testing environment variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)