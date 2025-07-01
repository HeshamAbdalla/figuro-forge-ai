
-- Add likes table to track user likes for figurines
CREATE TABLE public.figurine_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  figurine_id UUID NOT NULL REFERENCES public.figurines(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, figurine_id)
);

-- Enable RLS for likes
ALTER TABLE public.figurine_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for likes
CREATE POLICY "Users can view all likes"
  ON public.figurine_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON public.figurine_likes
  FOR ALL
  USING (get_current_user_id() = user_id);

-- Add like_count to figurines table for caching
ALTER TABLE public.figurines 
ADD COLUMN like_count INTEGER DEFAULT 0;

-- Function to update like count
CREATE OR REPLACE FUNCTION public.update_figurine_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.figurines 
    SET like_count = like_count + 1 
    WHERE id = NEW.figurine_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.figurines 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.figurine_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update like counts
CREATE TRIGGER update_figurine_like_count_trigger
  AFTER INSERT OR DELETE ON public.figurine_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_figurine_like_count();

-- Add creator display name to figurines metadata for better performance
-- This will be populated by the application when creating figurines
