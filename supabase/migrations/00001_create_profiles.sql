-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  location TEXT,
  timezone TEXT,
  avatar_url TEXT,
  avatar_initials TEXT,
  primary_cta_label TEXT,
  primary_cta_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT profiles_handle_unique UNIQUE (handle),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id),
  CONSTRAINT profiles_handle_format CHECK (handle ~ '^[a-z][a-z0-9_-]*[a-z0-9]$'),
  CONSTRAINT profiles_handle_length CHECK (char_length(handle) >= 3 AND char_length(handle) <= 30),
  CONSTRAINT profiles_display_name_length CHECK (char_length(display_name) >= 1 AND char_length(display_name) <= 100),
  CONSTRAINT profiles_headline_length CHECK (headline IS NULL OR char_length(headline) <= 160),
  CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 500),
  CONSTRAINT profiles_cta_url_format CHECK (
    primary_cta_url IS NULL OR 
    primary_cta_url ~ '^https?://'
  )
);

-- Indexes
CREATE INDEX idx_profiles_handle ON public.profiles(handle) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_published ON public.profiles(is_published) WHERE deleted_at IS NULL AND is_published = true;
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public can read published profiles
CREATE POLICY "Public can view published profiles"
  ON public.profiles FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

-- Users can read their own profile (even unpublished)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
