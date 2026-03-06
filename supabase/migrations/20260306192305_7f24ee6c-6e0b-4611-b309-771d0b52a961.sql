-- Drop the plain UNIQUE constraint, replace with partial unique index
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth_user_id_unique
  ON public.profiles(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Replace handle_new_user: link-only, no profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Link existing roster profile by email; do NOT create new profiles
  UPDATE public.profiles
    SET auth_user_id = NEW.id
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL;

  -- Ensure employee role exists for linked profile
  INSERT INTO public.user_roles (user_id, role)
  SELECT p.id, 'employee'
  FROM public.profiles p
  WHERE p.auth_user_id = NEW.id
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;