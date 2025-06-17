export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          is_blog_owner: boolean
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          is_blog_owner?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          is_blog_owner?: boolean
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string | null
          category: 'eat' | 'sleep' | 'study' | 'play' | 'life'
          title: string
          content: string
          hashtags: string[] | null
          image_urls: string[] | null
          video_urls: string[] | null
          is_draft: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          category: 'eat' | 'sleep' | 'study' | 'play' | 'life'
          title: string
          content: string
          hashtags?: string[] | null
          image_urls?: string[] | null
          video_urls?: string[] | null
          is_draft?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          category?: 'eat' | 'sleep' | 'study' | 'play' | 'life'
          title?: string
          content?: string
          hashtags?: string[] | null
          image_urls?: string[] | null
          video_urls?: string[] | null
          is_draft?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          parent_id: string | null
          user_id: string | null
          author_name: string | null
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          parent_id?: string | null
          user_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          parent_id?: string | null
          user_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string | null
          user_identifier: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id?: string | null
          user_identifier?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string | null
          user_identifier?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: 'like' | 'comment'
          post_id: string
          actor_name: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: 'like' | 'comment'
          post_id: string
          actor_name?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: 'like' | 'comment'
          post_id?: string
          actor_name?: string | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}