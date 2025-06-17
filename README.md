# 🌸 Kawaii Blog Platform

A cute personal blog platform with Instagram-style features, built with Next.js and Supabase.

## 🌟 Features

- **5 Activity Categories**: Eat 🍽️, Sleep 😴, Study 📚, Play 🎮, Life 🌟
- **Instagram-style Feed**: Chronological posts with likes and comments
- **Nested Comments**: Reddit-style comment threads
- **Real-time Updates**: Instant updates for likes and comments
- **Hashtag Support**: Organize posts with hashtags
- **Anonymous Interaction**: Users can interact without accounts
- **Rich Media**: Support for images and videos
- **Animated Avatar**: Cute bouncing cat mascot

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

### Setup Instructions

1. **Clone the repository**
   ```bash
   cd kawaii-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [app.supabase.com](https://app.supabase.com)
   - Go to Settings > API
   - Copy your project URL and anon key

4. **Configure environment variables**
   - Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Set up the database**
   - Go to SQL Editor in Supabase
   - Copy and run the SQL from `supabase/schema.sql`
   - Make yourself the blog owner:
   ```sql
   UPDATE profiles 
   SET is_blog_owner = true 
   WHERE id = 'your-user-id';
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)**

## 🎨 Customization

### Colors
Edit the color palette in `tailwind.config.ts`:
- `pastel`: Soft pastel colors
- `kawaii`: Main theme colors

### Avatar
Replace `/public/assets/avatar.png` with your own cute avatar!

### Categories
Modify activity categories in:
- `components/ActivityIcons.tsx`
- Database schema

## 📝 Usage

### For Blog Owner
- **Create Post**: Right-click on any activity icon
- **View Posts**: Left-click on activity icons
- **Edit/Delete**: Available in post view
### For Visitors
- **View Posts**: Click on activity icons
- **Like**: Click the heart button
- **Comment**: Add comments below posts
- **Create Account**: Optional for username persistence

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Animation**: Framer Motion
- **State**: React Query
- **Forms**: React Hook Form

## 📁 Project Structure

```
kawaii-blog/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Utility functions
├── types/            # TypeScript types
├── public/           # Static assets
└── supabase/         # Database schema
```

## 🚀 Deployment

1. Deploy to Vercel:
   ```bash
   npx vercel
   ```

2. Add environment variables in Vercel dashboard

3. Your kawaii blog is live! 🎉

## 📝 License

MIT License - feel free to use this for your own kawaii blog!

---

Made with 💕 using Next.js and Supabase