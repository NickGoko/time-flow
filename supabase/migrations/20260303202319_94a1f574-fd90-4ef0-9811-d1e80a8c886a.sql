-- Drop FK from profiles.id -> auth.users so we can create profiles without auth accounts (demo mode)
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;