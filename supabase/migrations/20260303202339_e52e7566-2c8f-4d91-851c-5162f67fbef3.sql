-- Drop FK from user_roles.user_id -> auth.users so we can create roles without auth accounts (demo mode)
ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;