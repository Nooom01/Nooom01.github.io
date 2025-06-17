const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testComment() {
  console.log('🧪 Testing comment creation...\n')

  // Get the first post
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .limit(1)
  
  if (!posts || posts.length === 0) {
    console.log('❌ No posts found to comment on')
    return
  }

  const postId = posts[0].id
  console.log('📝 Found post:', posts[0].title, '(ID:', postId, ')')

  // Try to create a comment
  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      content: 'Test comment from script',
      author_name: 'Test User'
    })
    .select()

  if (error) {
    console.error('❌ Error creating comment:', error)
  } else {
    console.log('✅ Comment created successfully:', data)
  }

  // Check comments
  const { data: comments, error: fetchError } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)

  if (!fetchError) {
    console.log('\n📊 Total comments on post:', comments.length)
  }
}

testComment()