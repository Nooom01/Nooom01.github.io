-- Setup Blog Owner Profile
-- Run this in Supabase SQL Editor to create your blog owner account

-- First, let's see if there are any authenticated users
SELECT * FROM auth.users;

-- If you see your user ID, replace 'YOUR_USER_ID_HERE' with your actual user ID
-- If no users exist, you need to sign up first through your app

-- Create blog owner profile (replace the UUID with your actual user ID)
INSERT INTO profiles (id, username, is_blog_owner, avatar_url)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with your actual user ID from auth.users
  'kawaii_blogger',
  true,
  '/assets/avatar.png'
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_blog_owner = true,
  username = 'kawaii_blogger';

-- Verify the profile was created
SELECT * FROM profiles WHERE is_blog_owner = true;