-- Add weather and music fields to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS weather jsonb,
ADD COLUMN IF NOT EXISTS music jsonb;

-- Weather will store: { temp: number, condition: string, icon: string, location: string }
-- Music will store: { title: string, artist: string, url?: string, source?: string }