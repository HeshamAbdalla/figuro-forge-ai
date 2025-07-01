
-- Create enum for share token status
CREATE TYPE public.share_status AS ENUM ('active', 'revoked', 'expired');

-- Create table for shareable model tokens
CREATE TABLE public.shared_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  figurine_id UUID NOT NULL REFERENCES public.figurines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  max_views INTEGER,
  status public.share_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  viewer_info JSONB DEFAULT '{}',
  
  -- Indexes for performance
  CONSTRAINT shared_models_token_key UNIQUE (share_token)
);

-- Create index for better query performance
CREATE INDEX idx_shared_models_token ON public.shared_models(share_token);
CREATE INDEX idx_shared_models_figurine_id ON public.shared_models(figurine_id);
CREATE INDEX idx_shared_models_user_id ON public.shared_models(user_id);
CREATE INDEX idx_shared_models_status ON public.shared_models(status);

-- Enable RLS
ALTER TABLE public.shared_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own shared models"
  ON public.shared_models
  FOR ALL
  USING (get_current_user_id() = user_id);

CREATE POLICY "Public can view active shared models"
  ON public.shared_models
  FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > now()));

-- Function to generate secure share tokens
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to create a shared model
CREATE OR REPLACE FUNCTION public.create_shared_model(
  p_figurine_id UUID,
  p_password TEXT DEFAULT NULL,
  p_expires_hours INTEGER DEFAULT NULL,
  p_max_views INTEGER DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_share_token TEXT;
  v_password_hash TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := get_current_user_id();
  
  -- Verify user owns the figurine
  IF NOT EXISTS (
    SELECT 1 FROM public.figurines 
    WHERE id = p_figurine_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'Figurine not found or access denied';
  END IF;
  
  -- Generate unique share token
  v_share_token := public.generate_share_token();
  
  -- Hash password if provided
  IF p_password IS NOT NULL THEN
    v_password_hash := crypt(p_password, gen_salt('bf'));
  END IF;
  
  -- Set expiration if provided
  IF p_expires_hours IS NOT NULL THEN
    v_expires_at := now() + (p_expires_hours || ' hours')::INTERVAL;
  END IF;
  
  -- Insert shared model record
  INSERT INTO public.shared_models (
    figurine_id,
    user_id,
    share_token,
    password_hash,
    expires_at,
    max_views
  ) VALUES (
    p_figurine_id,
    v_user_id,
    v_share_token,
    v_password_hash,
    v_expires_at,
    p_max_views
  );
  
  RETURN v_share_token;
END;
$$;

-- Function to validate share access
CREATE OR REPLACE FUNCTION public.validate_share_access(
  p_share_token TEXT,
  p_password TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_shared_model RECORD;
  v_figurine RECORD;
  v_result JSONB;
BEGIN
  -- Get shared model
  SELECT * INTO v_shared_model
  FROM public.shared_models
  WHERE share_token = p_share_token;
  
  -- Check if share exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Share not found'
    );
  END IF;
  
  -- Check if share is active
  IF v_shared_model.status != 'active' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Share is no longer active'
    );
  END IF;
  
  -- Check expiration
  IF v_shared_model.expires_at IS NOT NULL AND v_shared_model.expires_at < now() THEN
    -- Auto-expire the share
    UPDATE public.shared_models
    SET status = 'expired'
    WHERE id = v_shared_model.id;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Share has expired'
    );
  END IF;
  
  -- Check view limit
  IF v_shared_model.max_views IS NOT NULL AND v_shared_model.view_count >= v_shared_model.max_views THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Share view limit exceeded'
    );
  END IF;
  
  -- Check password
  IF v_shared_model.password_hash IS NOT NULL THEN
    IF p_password IS NULL OR NOT (v_shared_model.password_hash = crypt(p_password, v_shared_model.password_hash)) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Password required'
      );
    END IF;
  END IF;
  
  -- Get figurine data
  SELECT * INTO v_figurine
  FROM public.figurines
  WHERE id = v_shared_model.figurine_id;
  
  -- Update access tracking
  UPDATE public.shared_models
  SET 
    view_count = view_count + 1,
    last_accessed_at = now(),
    updated_at = now()
  WHERE id = v_shared_model.id;
  
  -- Return success with figurine data
  RETURN jsonb_build_object(
    'success', true,
    'figurine', to_jsonb(v_figurine),
    'share_info', jsonb_build_object(
      'expires_at', v_shared_model.expires_at,
      'view_count', v_shared_model.view_count + 1,
      'max_views', v_shared_model.max_views
    )
  );
END;
$$;

-- Function to revoke a share
CREATE OR REPLACE FUNCTION public.revoke_share(p_share_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := get_current_user_id();
  
  UPDATE public.shared_models
  SET status = 'revoked', updated_at = now()
  WHERE share_token = p_share_token AND user_id = v_user_id;
  
  RETURN FOUND;
END;
$$;
