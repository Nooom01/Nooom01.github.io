-- Step 1: Create Tables Only
-- Run this first in Supabase SQL Editor

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  is_blog_owner boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  category text NOT NULL CHECK (category IN ('eat', 'sleep', 'study', 'play', 'life')),
  title text NOT NULL,
  content text NOT NULL,
  hashtags text[],
  image_urls text[],
  video_urls text[],
  is_draft boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create comments table with nested comment support
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  author_name text, -- For anonymous comments
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  user_identifier text, -- For anonymous likes (IP or session)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, user_identifier)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('like', 'comment')),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  actor_name text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);