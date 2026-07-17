-- Function to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to profiles
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Attach to profile_links
CREATE TRIGGER profile_links_updated_at
  BEFORE UPDATE ON public.profile_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Attach to public_profile_settings
CREATE TRIGGER public_profile_settings_updated_at
  BEFORE UPDATE ON public.public_profile_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to block reserved handles
CREATE OR REPLACE FUNCTION public.check_reserved_handle()
RETURNS TRIGGER AS $$
DECLARE
  reserved_handles TEXT[] := ARRAY[
    'admin', 'api', 'login', 'signup', 'settings', 'support',
    'assets', 'u', 'dashboard', 'profile', 'profiles', 'help',
    'about', 'contact', 'blog', 'docs', 'pricing', 'terms',
    'privacy', 'status', 'app', 'www', 'mail', 'ftp', 'static',
    'public', 'system', 'root', 'null', 'undefined'
  ];
BEGIN
  IF NEW.handle = ANY(reserved_handles) THEN
    RAISE EXCEPTION 'Handle "%" is reserved', NEW.handle;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach reserved handle check to profiles
CREATE TRIGGER profiles_check_reserved_handle
  BEFORE INSERT OR UPDATE OF handle ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_reserved_handle();
