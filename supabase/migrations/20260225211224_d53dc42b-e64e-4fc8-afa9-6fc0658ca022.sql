-- Allow admins to read all user_roles (needed for admin user management)
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));