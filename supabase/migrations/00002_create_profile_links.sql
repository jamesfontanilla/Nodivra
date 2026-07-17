-- Create profile_links table
CREATE TABLE IF NOT EXISTS public.profile_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_label TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT profile_links_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  CONSTRAINT profile_links_url_format CHECK (url ~ '^https?://'),
  CONSTRAINT profile_links_icon_label_length CHECK (icon_label IS NULL OR char_length(icon_label) <= 30)
);

-- Indexes
CREATE INDEX idx_profile_links_profile_id ON public.profile_links(profile_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_profile_links_position ON public.profile_links(profile_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_profile_links_visible ON public.profile_links(profile_id, is_visible, is_enabled) WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.profile_links ENABLE ROW LEVEL SECURITY;

-- Public can view visible, enabled links on published profiles
CREATE POLICY "Public can view visible links on published profiles"
  ON public.profile_links FOR SELECT
  USING (
    deleted_at IS NULL
    AND is_visible = true
    AND is_enabled = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.is_published = true
        AND profiles.deleted_at IS NULL
    )
  );

-- Owners can view all their own links
CREATE POLICY "Owners can view own links"
  ON public.profile_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Owners can insert links on their own profile
CREATE POLICY "Owners can insert own links"
  ON public.profile_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Owners can update their own links
CREATE POLICY "Owners can update own links"
  ON public.profile_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Owners can delete (soft) their own links
CREATE POLICY "Owners can delete own links"
  ON public.profile_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_links.profile_id
        AND profiles.user_id = auth.uid()
    )
  );
