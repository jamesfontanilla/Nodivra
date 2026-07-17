-- Project case-study module

CREATE TYPE public.project_status AS ENUM (
  'draft',
  'in_progress',
  'shipped',
  'archived'
);

CREATE TYPE public.project_type AS ENUM (
  'web_app',
  'mobile_app',
  'library',
  'tool',
  'design_system',
  'open_source',
  'experiment',
  'other'
);

CREATE TYPE public.project_link_kind AS ENUM (
  'live',
  'repository',
  'demo'
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  case_study_md TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  project_type public.project_type NOT NULL DEFAULT 'other',
  status public.project_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  cover_image_url TEXT,
  cover_image_alt TEXT,
  cover_image_caption TEXT,
  lessons_learned TEXT,
  search_text TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT projects_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 120),
  CONSTRAINT projects_slug_format CHECK (slug ~ '^[a-z][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT projects_slug_length CHECK (char_length(slug) >= 2 AND char_length(slug) <= 60),
  CONSTRAINT projects_summary_length CHECK (char_length(summary) <= 280),
  CONSTRAINT projects_role_length CHECK (char_length(role) <= 120),
  CONSTRAINT projects_case_study_length CHECK (char_length(case_study_md) <= 12000),
  CONSTRAINT projects_cover_alt_length CHECK (cover_image_alt IS NULL OR char_length(cover_image_alt) <= 200),
  CONSTRAINT projects_cover_caption_length CHECK (cover_image_caption IS NULL OR char_length(cover_image_caption) <= 240),
  CONSTRAINT projects_lessons_length CHECK (lessons_learned IS NULL OR char_length(lessons_learned) <= 1000),
  CONSTRAINT projects_search_text_length CHECK (char_length(search_text) <= 12000),
  CONSTRAINT projects_date_order CHECK (
    start_date IS NULL OR end_date IS NULL OR start_date <= end_date
  ),
  CONSTRAINT projects_cover_url_format CHECK (
    cover_image_url IS NULL OR cover_image_url ~ '^https?://'
  )
);

CREATE UNIQUE INDEX idx_projects_profile_slug
  ON public.projects(profile_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_profile_position
  ON public.projects(profile_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_profile_featured
  ON public.projects(profile_id, is_featured, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_public_visibility
  ON public.projects(profile_id, is_visible, is_published, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_search_text
  ON public.projects USING GIN (to_tsvector('english', coalesce(search_text, '')));

CREATE TABLE IF NOT EXISTS public.project_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT project_technologies_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 60)
);

CREATE UNIQUE INDEX idx_project_technologies_project_name
  ON public.project_technologies(project_id, lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_technologies_project_position
  ON public.project_technologies(project_id, position) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT project_tags_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 60)
);

CREATE UNIQUE INDEX idx_project_tags_project_name
  ON public.project_tags(project_id, lower(name)) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_tags_project_position
  ON public.project_tags(project_id, position) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind public.project_link_kind NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT project_links_url_format CHECK (url ~ '^https?://'),
  CONSTRAINT project_links_url_length CHECK (char_length(url) <= 2048)
);

CREATE UNIQUE INDEX idx_project_links_project_kind
  ON public.project_links(project_id, kind) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_links_project_position
  ON public.project_links(project_id, position) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_links_project_visible
  ON public.project_links(project_id, is_visible, position) WHERE deleted_at IS NULL;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.projects_featured_limit()
RETURNS TRIGGER AS $$
DECLARE
  featured_count INTEGER;
BEGIN
  IF NEW.is_featured IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND COALESCE(OLD.is_featured, false) = true AND OLD.profile_id = NEW.profile_id THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*)
    INTO featured_count
  FROM public.projects
  WHERE profile_id = NEW.profile_id
    AND is_featured = true
    AND deleted_at IS NULL
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF featured_count >= 3 THEN
    RAISE EXCEPTION 'Only % featured projects are allowed per profile', 3;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.build_project_search_text(
  project_uuid uuid,
  project_title text,
  project_summary text,
  project_case_study_md text,
  project_role text,
  project_type_value public.project_type,
  project_status_value public.project_status,
  project_lessons_learned text,
  project_cover_image_alt text,
  project_cover_image_caption text
)
RETURNS text AS $$
DECLARE
  technologies_text text;
  tags_text text;
  links_text text;
BEGIN
  SELECT COALESCE(string_agg(name, ' '), '')
    INTO technologies_text
  FROM public.project_technologies
  WHERE project_id = project_uuid
    AND deleted_at IS NULL;

  SELECT COALESCE(string_agg(name, ' '), '')
    INTO tags_text
  FROM public.project_tags
  WHERE project_id = project_uuid
    AND deleted_at IS NULL;

  SELECT COALESCE(string_agg(kind::text || ' ' || url, ' '), '')
    INTO links_text
  FROM public.project_links
  WHERE project_id = project_uuid
    AND deleted_at IS NULL;

  RETURN trim(regexp_replace(
    lower(concat_ws(
      ' ',
      project_title,
      project_summary,
      project_case_study_md,
      project_role,
      project_type_value::text,
      project_status_value::text,
      project_lessons_learned,
      project_cover_image_alt,
      project_cover_image_caption,
      technologies_text,
      tags_text,
      links_text
    )),
    '\s+',
    ' ',
    'g'
  ));
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION public.projects_set_search_text()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_text := public.build_project_search_text(
    NEW.id,
    NEW.title,
    NEW.summary,
    NEW.case_study_md,
    NEW.role,
    NEW.project_type,
    NEW.status,
    NEW.lessons_learned,
    NEW.cover_image_alt,
    NEW.cover_image_caption
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.refresh_project_search_text(project_uuid uuid)
RETURNS VOID AS $$
DECLARE
  project_record public.projects%ROWTYPE;
BEGIN
  SELECT * INTO project_record
  FROM public.projects
  WHERE id = project_uuid;

  IF NOT FOUND OR project_record.deleted_at IS NOT NULL THEN
    RETURN;
  END IF;

  UPDATE public.projects
  SET search_text = public.build_project_search_text(
    project_record.id,
    project_record.title,
    project_record.summary,
    project_record.case_study_md,
    project_record.role,
    project_record.project_type,
    project_record.status,
    project_record.lessons_learned,
    project_record.cover_image_alt,
    project_record.cover_image_caption
  )
  WHERE id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.refresh_project_search_text_trigger()
RETURNS TRIGGER AS $$
DECLARE
  project_uuid uuid;
BEGIN
  project_uuid := COALESCE(NEW.project_id, OLD.project_id);
  PERFORM public.refresh_project_search_text(project_uuid);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.resolve_audit_user_id(row_data JSONB)
RETURNS UUID AS $$
DECLARE
  resolved_user_id UUID;
BEGIN
  IF row_data ? 'user_id' THEN
    resolved_user_id := NULLIF(row_data->>'user_id', '')::uuid;
  ELSIF row_data ? 'profile_id' THEN
    SELECT user_id
      INTO resolved_user_id
    FROM public.profiles
    WHERE id = NULLIF(row_data->>'profile_id', '')::uuid;
  END IF;

  RETURN COALESCE(auth.uid(), resolved_user_id);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  actor_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    actor_id := public.resolve_audit_user_id(to_jsonb(NEW));
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (
      actor_id,
      'INSERT',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    actor_id := public.resolve_audit_user_id(to_jsonb(NEW));
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
      actor_id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::text,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    actor_id := public.resolve_audit_user_id(to_jsonb(OLD));
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (
      actor_id,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::text,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public visibility policies
CREATE POLICY "Public can view published projects"
  ON public.projects FOR SELECT
  USING (
    deleted_at IS NULL
    AND is_visible = true
    AND is_published = true
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.is_published = true
        AND profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Owners can view own projects"
  ON public.projects FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own projects"
  ON public.projects FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own projects"
  ON public.projects FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own projects"
  ON public.projects FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view published project technologies"
  ON public.project_technologies FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_technologies.project_id
        AND projects.is_visible = true
        AND projects.is_published = true
        AND projects.deleted_at IS NULL
        AND profiles.is_published = true
        AND profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Owners can view own project technologies"
  ON public.project_technologies FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_technologies.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own project technologies"
  ON public.project_technologies FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_technologies.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own project technologies"
  ON public.project_technologies FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_technologies.project_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_technologies.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own project technologies"
  ON public.project_technologies FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_technologies.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view published project tags"
  ON public.project_tags FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_tags.project_id
        AND projects.is_visible = true
        AND projects.is_published = true
        AND projects.deleted_at IS NULL
        AND profiles.is_published = true
        AND profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Owners can view own project tags"
  ON public.project_tags FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_tags.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own project tags"
  ON public.project_tags FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_tags.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own project tags"
  ON public.project_tags FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_tags.project_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_tags.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own project tags"
  ON public.project_tags FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_tags.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view published project links"
  ON public.project_links FOR SELECT
  USING (
    deleted_at IS NULL
    AND is_visible = true
    AND EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_links.project_id
        AND projects.is_visible = true
        AND projects.is_published = true
        AND projects.deleted_at IS NULL
        AND profiles.is_published = true
        AND profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Owners can view own project links"
  ON public.project_links FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_links.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert own project links"
  ON public.project_links FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_links.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update own project links"
  ON public.project_links FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_links.project_id
        AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_links.project_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete own project links"
  ON public.project_links FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.profiles ON profiles.id = projects.profile_id
      WHERE projects.id = project_links.project_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Updated_at triggers
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER project_technologies_updated_at
  BEFORE UPDATE ON public.project_technologies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER project_tags_updated_at
  BEFORE UPDATE ON public.project_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER project_links_updated_at
  BEFORE UPDATE ON public.project_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Search text + featured limit
CREATE TRIGGER projects_featured_limit_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.projects_featured_limit();

CREATE TRIGGER projects_search_text_trigger
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.projects_set_search_text();

CREATE TRIGGER project_technologies_refresh_search_text_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_technologies
  FOR EACH ROW EXECUTE FUNCTION public.refresh_project_search_text_trigger();

CREATE TRIGGER project_tags_refresh_search_text_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_tags
  FOR EACH ROW EXECUTE FUNCTION public.refresh_project_search_text_trigger();

CREATE TRIGGER project_links_refresh_search_text_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_links
  FOR EACH ROW EXECUTE FUNCTION public.refresh_project_search_text_trigger();

-- Audit trail
CREATE TRIGGER projects_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER project_technologies_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_technologies
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER project_tags_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_tags
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER project_links_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.project_links
  FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();
