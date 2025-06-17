-- Step 2: Enable Row Level Security and Create Policies
-- Run this AFTER Step 1 completes successfully

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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