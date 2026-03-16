-- Slice 5: Upgrade operating + break-glass super-admins
UPDATE public.user_roles SET role = 'super_admin'
WHERE user_id = 'cca0759d-ebc9-4fa5-9fd0-e61e51c2ef65';

UPDATE public.user_roles SET role = 'super_admin'
WHERE user_id = 'd42a2ddb-05a4-4051-bbfe-8614e6da4d21';
