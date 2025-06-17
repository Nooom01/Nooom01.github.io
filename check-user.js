const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.log('❌ No user logged in. Please sign in first.')
    return
  }
  
  console.log('✅ Current user ID:', user.id)
  console.log('📧 Email:', user.email)
  console.log('\n📝 Run this SQL in Supabase Dashboard:')
  console.log(`
INSERT INTO profiles (id, username, is_blog_owner) 
VALUES ('${user.id}', 'kawaii_blogger', true)
ON CONFLICT (id) 
DO UPDATE SET is_blog_owner = true;
  `)
}

checkCurrentUser()