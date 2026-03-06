-- 1. Add auth_user_id column
ALTER TABLE public.profiles
  ADD COLUMN auth_user_id uuid UNIQUE;

-- 2. Backfill: for any profile whose id already matches an auth user, set auth_user_id = id
UPDATE public.profiles SET auth_user_id = id
WHERE id IN (SELECT id FROM auth.users);

-- 3. Replace handle_new_user trigger function to stop mutating profiles.id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If profile exists by email, link it via auth_user_id; otherwise create new
  UPDATE public.profiles
    SET auth_user_id = NEW.id
    WHERE email = NEW.email AND auth_user_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, name, auth_user_id)
    VALUES (gen_random_uuid(), NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            NEW.id)
    ON CONFLICT (email) DO UPDATE SET auth_user_id = NEW.id;
  END IF;

  -- Ensure employee role exists (keyed to profile.id, not auth id)
  INSERT INTO public.user_roles (user_id, role)
  SELECT p.id, 'employee'
  FROM public.profiles p
  WHERE p.auth_user_id = NEW.id
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;