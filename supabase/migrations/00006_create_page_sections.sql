-- Page sections: groupable content areas
CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_collapsed_in_editor BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT page_sections_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 80),
  CONSTRAINT page_sections_slug_format CHECK (slug ~ '^[a-z][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT page_sections_slug_length CHECK (char_length(slug) >= 2 AND char_length(slug) <= 40)
);

CREATE UNIQUE INDEX idx_page_sections_profile_slug
  ON public.page_sections(profile_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_page_sections_profile_position
  ON public.page_sections(profile_id, position) WHERE deleted_at IS NULL;

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Public: visible sections on published profiles
CREATE POLICY "Public can view visible sections on published profiles"
  ON public.page_sections FOR SELECT
  USING (
    deleted_at IS NULL AND is_visible = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = page_sections.profile_id
        AND profiles.is_published = true AND profiles.deleted_at IS NULL
    )
  );

-- Owner read
CREATE POLICY "Owners can view own sections"
  ON public.page_sections FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_sections.profile_id AND profiles.user_id = auth.uid()
  ));

-- Owner insert
CREATE POLICY "Owners can insert own sections"
  ON public.page_sections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_sections.profile_id AND profiles.user_id = auth.uid()
  ));

-- Owner update
CREATE POLICY "Owners can update own sections"
  ON public.page_sections FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_sections.profile_id AND profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_sections.profile_id AND profiles.user_id = auth.uid()
  ));

-- Owner delete
CREATE POLICY "Owners can delete own sections"
  ON public.page_sections FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_sections.profile_id AND profiles.user_id = auth.uid()
  ));

-- Auto updated_at
CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
