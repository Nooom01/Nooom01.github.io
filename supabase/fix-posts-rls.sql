-- Check if RLS is enabled on posts table
-- If it is, we need to add policies for public read access

-- Enable RLS on posts table (if not already enabled)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view published posts" ON posts;
DROP POLICY IF EXISTS "Blog owner can do everything" ON posts;

-- Allow anyone to read published posts
CREATE POLICY "Public can view published posts" ON posts
  FOR SELECT 
  USING (is_draft = false);

-- Allow blog owner to do everything
CREATE POLICY "Blog owner can do everything" ON posts
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_blog_owner = true
    )
  );

-- Test query to see if there are any posts
SELECT COUNT(*) as total_posts, 
       COUNT(CASE WHEN is_draft = false THEN 1 END) as published_posts
FROM posts;