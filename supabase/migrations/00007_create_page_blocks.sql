-- Page blocks: typed content units within sections
CREATE TYPE public.block_type AS ENUM (
  'link_button',
  'social_link',
  'project_highlight',
  'text_section',
  'image_card',
  'divider',
  'cta_card',
  'availability_card',
  'external_resource'
);

CREATE TABLE IF NOT EXISTS public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_id UUID REFERENCES public.page_sections(id) ON DELETE SET NULL,
  block_type public.block_type NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT page_blocks_title_length CHECK (char_length(title) <= 120),
  CONSTRAINT page_blocks_config_size CHECK (octet_length(config::text) <= 4096)
);

CREATE INDEX idx_page_blocks_profile_position
  ON public.page_blocks(profile_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_page_blocks_section
  ON public.page_blocks(section_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_page_blocks_type
  ON public.page_blocks(profile_id, block_type) WHERE deleted_at IS NULL;

ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

-- Public: visible blocks on published profiles
CREATE POLICY "Public can view visible blocks on published profiles"
  ON public.page_blocks FOR SELECT
  USING (
    deleted_at IS NULL AND is_visible = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = page_blocks.profile_id
        AND profiles.is_published = true AND profiles.deleted_at IS NULL
    )
  );

-- Owner read
CREATE POLICY "Owners can view own blocks"
  ON public.page_blocks FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_blocks.profile_id AND profiles.user_id = auth.uid()
  ));

-- Owner insert
CREATE POLICY "Owners can insert own blocks"
  ON public.page_blocks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_blocks.profile_id AND profiles.user_id = auth.uid()
  ));

-- Owner update
CREATE POLICY "Owners can update own blocks"
  ON public.page_blocks FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_blocks.profile_id AND profiles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_blocks.profile_id AND profiles.user_id = auth.uid()
  ));

-- Owner delete
CREATE POLICY "Owners can delete own blocks"
  ON public.page_blocks FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = page_blocks.profile_id AND profiles.user_id = auth.uid()
  ));

-- Auto updated_at
CREATE TRIGGER page_blocks_updated_at
  BEFORE UPDATE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Audit trail
CREATE TRIGGER page_blocks_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER page_sections_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
