const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables!');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAvatarStorage() {
  try {
    console.log('Setting up avatar storage bucket...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'supabase', 'avatars-storage-setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try a different approach
      console.log('Direct SQL execution not available, creating bucket via API...');
      
      // Create bucket via Storage API
      const { data: bucket, error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880
      });
      
      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError;
      }
      
      console.log('✅ Avatar storage bucket created successfully!');
    } else {
      console.log('✅ Avatar storage setup completed successfully!');
    }
    
    // Test the bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucket = buckets?.find(b => b.name === 'avatars');
    
    if (avatarBucket) {
      console.log('✅ Verified: Avatar bucket exists and is', avatarBucket.public ? 'public' : 'private');
    }
    
  } catch (error) {
    console.error('Error setting up avatar storage:', error);
    process.exit(1);
  }
}

setupAvatarStorage();