
export interface Profile {
  id: string;
  avatar_url?: string | null;
  created_at?: string | null;
  display_name?: string | null;
  updated_at?: string | null;
  generation_count?: number | null;
  [key: string]: any;
}

export interface Figurine {
  id: string;
  title: string;
  prompt: string;
  style: 'isometric' | 'anime' | 'pixar' | 'steampunk' | 'lowpoly' | 'cyberpunk' | 'realistic' | 'chibi' | 'text-to-3d';
  image_url: string;
  saved_image_url: string | null;
  model_url: string | null;
  created_at: string;
  updated_at?: string;
  user_id?: string;
  is_public?: boolean;
  file_type?: 'image' | 'web-icon' | '3d-model';
  metadata?: Record<string, any>;
  like_count?: number;
}
