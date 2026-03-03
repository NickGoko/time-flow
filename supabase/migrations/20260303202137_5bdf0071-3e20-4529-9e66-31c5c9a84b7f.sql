-- Add unique constraint on profiles.email for safe CSV upserts
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Add unique index on user_roles.user_id (one role per user) for upsert
-- First, check if any user has multiple roles and keep only one
-- Since user_roles_user_id_role_key already exists on (user_id, role),
-- we need a simple unique on user_id alone for ON CONFLICT (user_id)
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_unique ON public.user_roles (user_id);