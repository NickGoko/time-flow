
-- ═══════════════════════════════════════════════════════════
-- Brick 4: Admin write RLS policies for reference data + user management
-- ═══════════════════════════════════════════════════════════

-- departments
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- projects
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- project_department_access
CREATE POLICY "Admins can insert project_department_access" ON public.project_department_access FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete project_department_access" ON public.project_department_access FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- phases
CREATE POLICY "Admins can insert phases" ON public.phases FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update phases" ON public.phases FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete phases" ON public.phases FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- activity_types
CREATE POLICY "Admins can insert activity_types" ON public.activity_types FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update activity_types" ON public.activity_types FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete activity_types" ON public.activity_types FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- internal_work_areas
CREATE POLICY "Admins can insert internal_work_areas" ON public.internal_work_areas FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update internal_work_areas" ON public.internal_work_areas FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete internal_work_areas" ON public.internal_work_areas FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- deliverable_types
CREATE POLICY "Admins can insert deliverable_types" ON public.deliverable_types FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update deliverable_types" ON public.deliverable_types FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete deliverable_types" ON public.deliverable_types FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles: admin can insert and update all profiles
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- user_roles: admin can insert, update, delete
CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user_roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
