-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  is_blog_owner boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create posts table
CREATE TABLE posts (
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
CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  author_name text, -- For anonymous comments
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create likes table
CREATE TABLE likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  user_identifier text, -- For anonymous likes (IP or session)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(post_id, user_id),
  UNIQUE(post_id, user_identifier)
);

-- Create notifications table
CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('like', 'comment')),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  actor_name text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create now_playing table
CREATE TABLE now_playing (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  spotify_id text NOT NULL,
  spotify_type text NOT NULL CHECK (spotify_type IN ('track', 'album', 'playlist')),
  title text NOT NULL,
  artist text,
  album text,
  embed_url text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Blog owner can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Blog owner can update posts" ON posts
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Blog owner can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT USING (is_draft = false);

-- Comments policies
CREATE POLICY "Anyone can create comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments or blog owner can delete any" ON comments
  FOR DELETE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

-- Likes policies
CREATE POLICY "Anyone can like posts" ON likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view likes" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Users can remove own likes" ON likes
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND user_identifier IS NOT NULL)
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Now Playing policies
CREATE POLICY "Public can view now playing" ON now_playing
  FOR SELECT USING (true);

CREATE POLICY "Blog owner can update now playing" ON now_playing
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

-- Create indexes for better performance
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_now_playing_user_id ON now_playing(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for posts updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for now_playing updated_at
CREATE TRIGGER update_now_playing_updated_at BEFORE UPDATE ON now_playing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();