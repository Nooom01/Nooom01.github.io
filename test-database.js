// Test Database Connection and Tables
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Use your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🧪 Testing Supabase Database...\n')

  try {
    // Test 1: Check table structure
    console.log('1️⃣ Testing table structure...')
    const { data: tables, error: tablesError } = await supabase
      .from('posts')
      .select('*')
      .limit(0)
    
    if (tablesError) {
      console.error('❌ Tables test failed:', tablesError.message)
      return
    }
    console.log('✅ Tables accessible\n')

    // Test 2: Test inserting a profile (simulate blog owner)
    console.log('2️⃣ Testing profile creation...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: require('crypto').randomUUID(),
        username: 'kawaii_blogger',
        is_blog_owner: true
      })
      .select()
    
    if (profileError) {
      console.log('⚠️ Profile creation (expected to fail due to auth):', profileError.message)
    } else {
      console.log('✅ Profile created:', profile)
    }
    console.log('')

    // Test 3: Test reading posts
    console.log('3️⃣ Testing posts table...')
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
    
    if (postsError) {
      console.log('⚠️ Posts read error:', postsError.message)
    } else {
      console.log('✅ Posts table accessible, found', posts.length, 'posts')
    }
    console.log('')

    // Test 4: Test comments table
    console.log('4️⃣ Testing comments table...')
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
    
    if (commentsError) {
      console.log('⚠️ Comments read error:', commentsError.message)
    } else {
      console.log('✅ Comments table accessible, found', comments.length, 'comments')
    }
    console.log('')

    // Test 5: Test likes table
    console.log('5️⃣ Testing likes table...')
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('*')
    
    if (likesError) {
      console.log('⚠️ Likes read error:', likesError.message)
    } else {
      console.log('✅ Likes table accessible, found', likes.length, 'likes')
    }
    console.log('')

    console.log('🎉 Database test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

// Run the test
testDatabase()