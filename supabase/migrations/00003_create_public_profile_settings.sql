-- Create public_profile_settings table
CREATE TABLE IF NOT EXISTS public.public_profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  show_location BOOLEAN NOT NULL DEFAULT true,
  show_timezone BOOLEAN NOT NULL DEFAULT true,
  show_availability BOOLEAN NOT NULL DEFAULT true,
  theme TEXT NOT NULL DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT public_profile_settings_profile_unique UNIQUE (profile_id)
);

-- Indexes
CREATE INDEX idx_public_profile_settings_profile_id ON public.public_profile_settings(profile_id);

-- RLS
ALTER TABLE public.public_profile_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings for published profiles
CREATE POLICY "Public can view settings for published profiles"
  ON public.public_profile_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = public_profile_settings.profile_id
        AND profiles.is_published = true
        AND profiles.deleted_at IS NULL
    )
  );

-- Owners can read their own settings
CREATE POLICY "Owners can view own settings"
  ON public.public_profile_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = public_profile_settings.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Owners can insert their own settings
CREATE POLICY "Owners can insert own settings"
  ON public.public_profile_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = public_profile_settings.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Owners can update their own settings
CREATE POLICY "Owners can update own settings"
  ON public.public_profile_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = public_profile_settings.profile_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = public_profile_settings.profile_id
        AND profiles.user_id = auth.uid()
    )
  );
