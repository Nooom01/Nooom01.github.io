-- Create storage bucket for posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true);

-- Set up storage policies for posts bucket
CREATE POLICY "Public can view post files" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Blog owners can upload post files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'posts' AND 
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Blog owners can update post files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'posts' AND 
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Blog owners can delete post files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'posts' AND 
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );