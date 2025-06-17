const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkPosts() {
  console.log('🔍 Checking posts in database...\n')

  // 1. Check all posts
  const { data: allPosts, error: allError } = await supabase
    .from('posts')
    .select('*')
  
  if (allError) {
    console.error('❌ Error fetching posts:', allError)
    return
  }
  
  console.log(`📊 Total posts found: ${allPosts.length}`)
  
  if (allPosts.length > 0) {
    console.log('\n📝 Post details:')
    allPosts.forEach(post => {
      console.log(`- ID: ${post.id}`)
      console.log(`  Category: ${post.category}`)
      console.log(`  Title: ${post.title}`)
      console.log(`  Draft: ${post.is_draft}`)
      console.log(`  Created: ${post.created_at}`)
      console.log('')
    })
  }

  // 2. Check posts by category
  const categories = ['eat', 'sleep', 'study', 'play', 'life']
  console.log('\n📂 Posts by category:')
  
  for (const category of categories) {
    const { data: categoryPosts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('category', category)
      .eq('is_draft', false)
    
    if (!error) {
      console.log(`${category}: ${categoryPosts.length} posts`)
    }
  }

  // 3. Check with the exact query from CategoryFeed
  console.log('\n🔍 Testing CategoryFeed query:')
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (username, avatar_url),
      likes (count),
      comments (count)
    `)
    .eq('category', 'eat')
    .eq('is_draft', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ CategoryFeed query error:', error)
  } else {
    console.log('✅ CategoryFeed query successful, found:', data.length, 'posts')
  }
}

checkPosts()