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
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;

-- Now Playing policies
CREATE POLICY "Public can view now playing" ON now_playing
  FOR SELECT USING (true);

CREATE POLICY "Blog owner can insert now playing" ON now_playing
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Blog owner can update now playing" ON now_playing
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Blog owner can delete now playing" ON now_playing
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

-- Create index for better performance
CREATE INDEX idx_now_playing_user_id ON now_playing(user_id);

-- Trigger for now_playing updated_at
CREATE TRIGGER update_now_playing_updated_at BEFORE UPDATE ON now_playing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();