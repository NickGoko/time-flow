
-- =============================================
-- Brick 1: Convert all RESTRICTIVE policies to PERMISSIVE
-- and add open-access policies for demo mode
-- =============================================

-- ── activity_types ──
DROP POLICY IF EXISTS "Anyone can read activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Admins can insert activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Admins can update activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Admins can delete activity_types" ON public.activity_types;

CREATE POLICY "Anyone can read activity_types" ON public.activity_types FOR SELECT USING (true);
CREATE POLICY "Admins can insert activity_types" ON public.activity_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update activity_types" ON public.activity_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete activity_types" ON public.activity_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── deliverable_types ──
DROP POLICY IF EXISTS "Anyone can read deliverable_types" ON public.deliverable_types;
DROP POLICY IF EXISTS "Admins can insert deliverable_types" ON public.deliverable_types;
DROP POLICY IF EXISTS "Admins can update deliverable_types" ON public.deliverable_types;
DROP POLICY IF EXISTS "Admins can delete deliverable_types" ON public.deliverable_types;

CREATE POLICY "Anyone can read deliverable_types" ON public.deliverable_types FOR SELECT USING (true);
CREATE POLICY "Admins can insert deliverable_types" ON public.deliverable_types FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update deliverable_types" ON public.deliverable_types FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete deliverable_types" ON public.deliverable_types FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── departments ──
DROP POLICY IF EXISTS "Anyone can read departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;

CREATE POLICY "Anyone can read departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── internal_work_areas ──
DROP POLICY IF EXISTS "Anyone can read internal_work_areas" ON public.internal_work_areas;
DROP POLICY IF EXISTS "Admins can insert internal_work_areas" ON public.internal_work_areas;
DROP POLICY IF EXISTS "Admins can update internal_work_areas" ON public.internal_work_areas;
DROP POLICY IF EXISTS "Admins can delete internal_work_areas" ON public.internal_work_areas;

CREATE POLICY "Anyone can read internal_work_areas" ON public.internal_work_areas FOR SELECT USING (true);
CREATE POLICY "Admins can insert internal_work_areas" ON public.internal_work_areas FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update internal_work_areas" ON public.internal_work_areas FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete internal_work_areas" ON public.internal_work_areas FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── phases ──
DROP POLICY IF EXISTS "Anyone can read phases" ON public.phases;
DROP POLICY IF EXISTS "Admins can insert phases" ON public.phases;
DROP POLICY IF EXISTS "Admins can update phases" ON public.phases;
DROP POLICY IF EXISTS "Admins can delete phases" ON public.phases;

CREATE POLICY "Anyone can read phases" ON public.phases FOR SELECT USING (true);
CREATE POLICY "Admins can insert phases" ON public.phases FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update phases" ON public.phases FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete phases" ON public.phases FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── profiles ──
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ── project_department_access ──
DROP POLICY IF EXISTS "Anyone can read project_department_access" ON public.project_department_access;
DROP POLICY IF EXISTS "Admins can insert project_department_access" ON public.project_department_access;
DROP POLICY IF EXISTS "Admins can delete project_department_access" ON public.project_department_access;

CREATE POLICY "Anyone can read project_department_access" ON public.project_department_access FOR SELECT USING (true);
CREATE POLICY "Admins can insert project_department_access" ON public.project_department_access FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete project_department_access" ON public.project_department_access FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── projects ──
DROP POLICY IF EXISTS "Anyone can read projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

CREATE POLICY "Anyone can read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── user_roles ──
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;

CREATE POLICY "Anyone can read user_roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user_roles" ON public.user_roles FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- ── time_entries ──
DROP POLICY IF EXISTS "Users can read own entries or admin reads all" ON public.time_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON public.time_entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON public.time_entries;

CREATE POLICY "Anyone can read time_entries" ON public.time_entries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert time_entries" ON public.time_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update time_entries" ON public.time_entries FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete time_entries" ON public.time_entries FOR DELETE USING (true);

-- ── week_statuses ──
DROP POLICY IF EXISTS "Users can read own week statuses or admin reads all" ON public.week_statuses;
DROP POLICY IF EXISTS "Users can insert own week statuses" ON public.week_statuses;
DROP POLICY IF EXISTS "Users or admin can update week statuses" ON public.week_statuses;

CREATE POLICY "Anyone can read week_statuses" ON public.week_statuses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert week_statuses" ON public.week_statuses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update week_statuses" ON public.week_statuses FOR UPDATE USING (true);
