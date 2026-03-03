
-- Update handle_new_user trigger to handle existing profiles (from CSV import)
-- ON CONFLICT (email) DO UPDATE SET id = NEW.id syncs profile UUID to auth user UUID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (email) DO UPDATE SET id = NEW.id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
