-- Create now_playing table for current Spotify track
CREATE TABLE IF NOT EXISTS now_playing (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  spotify_url text NOT NULL,
  spotify_id text NOT NULL,
  spotify_type text NOT NULL CHECK (spotify_type IN ('track', 'playlist', 'album')),
  title text,
  artist text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE now_playing ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Blog owner can manage now playing" ON now_playing
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_blog_owner = true)
  );

CREATE POLICY "Public can view now playing" ON now_playing
  FOR SELECT USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_now_playing_updated_at BEFORE UPDATE ON now_playing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one active now_playing entry per user
CREATE UNIQUE INDEX idx_now_playing_user_id ON now_playing(user_id);