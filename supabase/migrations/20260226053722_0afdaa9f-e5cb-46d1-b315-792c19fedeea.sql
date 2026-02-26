
-- A3. Update has_role so super_admin inherits admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role
        OR (role = 'super_admin' AND _role = 'admin')
      )
  )
$$;

-- A4. Fix ALL RESTRICTIVE policies → PERMISSIVE

-- activity_types
DROP POLICY IF EXISTS "Anyone can read activity_types" ON public.activity_types;
CREATE POLICY "Anyone can read activity_types" ON public.activity_types FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert activity_types" ON public.activity_types;
CREATE POLICY "Admins can insert activity_types" ON public.activity_types FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update activity_types" ON public.activity_types;
CREATE POLICY "Admins can update activity_types" ON public.activity_types FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete activity_types" ON public.activity_types;
CREATE POLICY "Admins can delete activity_types" ON public.activity_types FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- deliverable_types
DROP POLICY IF EXISTS "Anyone can read deliverable_types" ON public.deliverable_types;
CREATE POLICY "Anyone can read deliverable_types" ON public.deliverable_types FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert deliverable_types" ON public.deliverable_types;
CREATE POLICY "Admins can insert deliverable_types" ON public.deliverable_types FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update deliverable_types" ON public.deliverable_types;
CREATE POLICY "Admins can update deliverable_types" ON public.deliverable_types FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete deliverable_types" ON public.deliverable_types;
CREATE POLICY "Admins can delete deliverable_types" ON public.deliverable_types FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- departments
DROP POLICY IF EXISTS "Anyone can read departments" ON public.departments;
CREATE POLICY "Anyone can read departments" ON public.departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- internal_work_areas
DROP POLICY IF EXISTS "Anyone can read internal_work_areas" ON public.internal_work_areas;
CREATE POLICY "Anyone can read internal_work_areas" ON public.internal_work_areas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert internal_work_areas" ON public.internal_work_areas;
CREATE POLICY "Admins can insert internal_work_areas" ON public.internal_work_areas FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update internal_work_areas" ON public.internal_work_areas;
CREATE POLICY "Admins can update internal_work_areas" ON public.internal_work_areas FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete internal_work_areas" ON public.internal_work_areas;
CREATE POLICY "Admins can delete internal_work_areas" ON public.internal_work_areas FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- phases
DROP POLICY IF EXISTS "Anyone can read phases" ON public.phases;
CREATE POLICY "Anyone can read phases" ON public.phases FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert phases" ON public.phases;
CREATE POLICY "Admins can insert phases" ON public.phases FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update phases" ON public.phases;
CREATE POLICY "Admins can update phases" ON public.phases FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete phases" ON public.phases;
CREATE POLICY "Admins can delete phases" ON public.phases FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- projects
DROP POLICY IF EXISTS "Anyone can read projects" ON public.projects;
CREATE POLICY "Anyone can read projects" ON public.projects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
CREATE POLICY "Admins can insert projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- project_department_access
DROP POLICY IF EXISTS "Anyone can read project_department_access" ON public.project_department_access;
CREATE POLICY "Anyone can read project_department_access" ON public.project_department_access FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert project_department_access" ON public.project_department_access;
CREATE POLICY "Admins can insert project_department_access" ON public.project_department_access FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete project_department_access" ON public.project_department_access;
CREATE POLICY "Admins can delete project_department_access" ON public.project_department_access FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- time_entries
DROP POLICY IF EXISTS "Users can read own entries or admin reads all" ON public.time_entries;
CREATE POLICY "Users can read own entries or admin reads all" ON public.time_entries FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can insert own entries" ON public.time_entries;
CREATE POLICY "Users can insert own entries" ON public.time_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own entries" ON public.time_entries;
CREATE POLICY "Users can update own entries" ON public.time_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own entries" ON public.time_entries;
CREATE POLICY "Users can delete own entries" ON public.time_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- week_statuses
DROP POLICY IF EXISTS "Users can read own week statuses or admin reads all" ON public.week_statuses;
CREATE POLICY "Users can read own week statuses or admin reads all" ON public.week_statuses FOR SELECT TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can insert own week statuses" ON public.week_statuses;
CREATE POLICY "Users can insert own week statuses" ON public.week_statuses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users or admin can update week statuses" ON public.week_statuses;
CREATE POLICY "Users or admin can update week statuses" ON public.week_statuses FOR UPDATE TO authenticated USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- profiles
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
CREATE POLICY "Admins can insert user_roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
CREATE POLICY "Admins can update user_roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
CREATE POLICY "Admins can delete user_roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
