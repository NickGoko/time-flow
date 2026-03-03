
-- ============================================================
-- Phase 3.1b: RBAC tables, seeds, functions, RLS policy updates
-- ============================================================

-- 1. Permissions table
CREATE TABLE public.permissions (
  id text PRIMARY KEY,
  description text NOT NULL
);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 2. Role-permission mapping
CREATE TABLE public.role_permissions (
  role public.app_role NOT NULL,
  permission_id text NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 3. User department scope
CREATE TABLE public.user_department_scope (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  department_id text NOT NULL,
  UNIQUE (user_id, department_id)
);
ALTER TABLE public.user_department_scope ENABLE ROW LEVEL SECURITY;

-- 4. Audit log
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX idx_audit_log_actor ON public.audit_log (actor_id);

-- 5. Seed permissions
INSERT INTO public.permissions (id, description) VALUES
  ('time:write_own',          'Create/edit own time entries'),
  ('time:read_own',           'View own time entries'),
  ('time:read_department',    'View time entries for scoped departments'),
  ('time:read_all',           'View all time entries'),
  ('week:submit_own',         'Submit own weekly timesheet'),
  ('week:unlock_department',  'Unlock week for scoped departments'),
  ('week:unlock_all',         'Unlock any week'),
  ('taxonomy:read',           'View reference data'),
  ('taxonomy:write',          'Create/edit reference data'),
  ('users:read',              'View user list'),
  ('users:write',             'Create/edit users'),
  ('roles:manage',            'Assign roles and scopes'),
  ('reports:read_department', 'View reports for scoped departments'),
  ('reports:read_all',        'View all reports'),
  ('audit:read',              'View audit log'),
  ('export:data',             'Export data');

-- 6. Seed role_permissions
INSERT INTO public.role_permissions (role, permission_id) VALUES
  ('employee', 'time:write_own'),
  ('employee', 'time:read_own'),
  ('employee', 'week:submit_own'),
  ('employee', 'taxonomy:read'),
  ('hod', 'time:write_own'),
  ('hod', 'time:read_own'),
  ('hod', 'time:read_department'),
  ('hod', 'week:submit_own'),
  ('hod', 'week:unlock_department'),
  ('hod', 'taxonomy:read'),
  ('hod', 'reports:read_department'),
  ('leadership', 'time:write_own'),
  ('leadership', 'time:read_own'),
  ('leadership', 'time:read_all'),
  ('leadership', 'week:submit_own'),
  ('leadership', 'taxonomy:read'),
  ('leadership', 'taxonomy:write'),
  ('leadership', 'users:read'),
  ('leadership', 'reports:read_all'),
  ('leadership', 'export:data'),
  ('admin', 'time:write_own'),
  ('admin', 'time:read_own'),
  ('admin', 'time:read_department'),
  ('admin', 'time:read_all'),
  ('admin', 'week:submit_own'),
  ('admin', 'week:unlock_all'),
  ('admin', 'taxonomy:read'),
  ('admin', 'taxonomy:write'),
  ('admin', 'users:read'),
  ('admin', 'users:write'),
  ('admin', 'roles:manage'),
  ('admin', 'reports:read_all'),
  ('admin', 'audit:read'),
  ('admin', 'export:data');

-- 7. has_permission function (super_admin gets everything)
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        ur.role = 'super_admin'
        OR EXISTS (
          SELECT 1 FROM public.role_permissions rp
          WHERE rp.role = ur.role AND rp.permission_id = _permission
        )
      )
  )
$$;

-- 8. is_department_scoped function
CREATE OR REPLACE FUNCTION public.is_department_scoped(_user_id uuid, _department_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_department_scope
    WHERE user_id = _user_id AND department_id = _department_id
  )
$$;

-- ============================================================
-- 9. RLS for new tables
-- ============================================================
CREATE POLICY "Anyone can read permissions" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "Admin can manage permissions" ON public.permissions FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "Admin can update permissions" ON public.permissions FOR UPDATE USING (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "Admin can delete permissions" ON public.permissions FOR DELETE USING (public.has_permission(auth.uid(), 'roles:manage'));

CREATE POLICY "Anyone can read role_permissions" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "Admin can manage role_permissions" ON public.role_permissions FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "Admin can update role_permissions" ON public.role_permissions FOR UPDATE USING (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "Admin can delete role_permissions" ON public.role_permissions FOR DELETE USING (public.has_permission(auth.uid(), 'roles:manage'));

CREATE POLICY "Anyone can read user_department_scope" ON public.user_department_scope FOR SELECT USING (true);
CREATE POLICY "Admin can manage user_department_scope" ON public.user_department_scope FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "Admin can update user_department_scope" ON public.user_department_scope FOR UPDATE USING (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "Admin can delete user_department_scope" ON public.user_department_scope FOR DELETE USING (public.has_permission(auth.uid(), 'roles:manage'));

CREATE POLICY "Admin can read audit_log" ON public.audit_log FOR SELECT USING (public.has_permission(auth.uid(), 'audit:read'));

-- ============================================================
-- 10. Update taxonomy RLS: admin-only → taxonomy:write
-- ============================================================

-- departments
DROP POLICY IF EXISTS "Admins can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can update departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can delete departments" ON public.departments;
CREATE POLICY "taxonomy:write can insert departments" ON public.departments FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can update departments" ON public.departments FOR UPDATE USING (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete departments" ON public.departments FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- projects
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;
CREATE POLICY "taxonomy:write can insert projects" ON public.projects FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can update projects" ON public.projects FOR UPDATE USING (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete projects" ON public.projects FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- phases
DROP POLICY IF EXISTS "Admins can insert phases" ON public.phases;
DROP POLICY IF EXISTS "Admins can update phases" ON public.phases;
DROP POLICY IF EXISTS "Admins can delete phases" ON public.phases;
CREATE POLICY "taxonomy:write can insert phases" ON public.phases FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can update phases" ON public.phases FOR UPDATE USING (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete phases" ON public.phases FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- activity_types
DROP POLICY IF EXISTS "Admins can insert activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Admins can update activity_types" ON public.activity_types;
DROP POLICY IF EXISTS "Admins can delete activity_types" ON public.activity_types;
CREATE POLICY "taxonomy:write can insert activity_types" ON public.activity_types FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can update activity_types" ON public.activity_types FOR UPDATE USING (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete activity_types" ON public.activity_types FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- internal_work_areas
DROP POLICY IF EXISTS "Admins can insert internal_work_areas" ON public.internal_work_areas;
DROP POLICY IF EXISTS "Admins can update internal_work_areas" ON public.internal_work_areas;
DROP POLICY IF EXISTS "Admins can delete internal_work_areas" ON public.internal_work_areas;
CREATE POLICY "taxonomy:write can insert internal_work_areas" ON public.internal_work_areas FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can update internal_work_areas" ON public.internal_work_areas FOR UPDATE USING (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete internal_work_areas" ON public.internal_work_areas FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- deliverable_types
DROP POLICY IF EXISTS "Admins can insert deliverable_types" ON public.deliverable_types;
DROP POLICY IF EXISTS "Admins can update deliverable_types" ON public.deliverable_types;
DROP POLICY IF EXISTS "Admins can delete deliverable_types" ON public.deliverable_types;
CREATE POLICY "taxonomy:write can insert deliverable_types" ON public.deliverable_types FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can update deliverable_types" ON public.deliverable_types FOR UPDATE USING (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete deliverable_types" ON public.deliverable_types FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- project_department_access
DROP POLICY IF EXISTS "Admins can insert project_department_access" ON public.project_department_access;
DROP POLICY IF EXISTS "Admins can delete project_department_access" ON public.project_department_access;
CREATE POLICY "taxonomy:write can insert project_department_access" ON public.project_department_access FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'taxonomy:write'));
CREATE POLICY "taxonomy:write can delete project_department_access" ON public.project_department_access FOR DELETE USING (public.has_permission(auth.uid(), 'taxonomy:write'));

-- ============================================================
-- 11. Update user_roles RLS: admin-only → roles:manage
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user_roles" ON public.user_roles;
CREATE POLICY "roles:manage can insert user_roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "roles:manage can update user_roles" ON public.user_roles FOR UPDATE USING (public.has_permission(auth.uid(), 'roles:manage'));
CREATE POLICY "roles:manage can delete user_roles" ON public.user_roles FOR DELETE USING (public.has_permission(auth.uid(), 'roles:manage'));

-- ============================================================
-- 12. Update profiles RLS: use has_permission
-- ============================================================
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "users:write can update all profiles" ON public.profiles FOR UPDATE USING (public.has_permission(auth.uid(), 'users:write'));
CREATE POLICY "users:write can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_permission(auth.uid(), 'users:write'));

-- ============================================================
-- 13. Tighten time_entries RLS (replace demo-mode open policies)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Anyone can insert time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Anyone can update time_entries" ON public.time_entries;
DROP POLICY IF EXISTS "Anyone can delete time_entries" ON public.time_entries;

-- SELECT: own OR department-scoped OR read-all
CREATE POLICY "time_entries_select" ON public.time_entries FOR SELECT USING (
  user_id = auth.uid()
  OR public.has_permission(auth.uid(), 'time:read_all')
  OR (
    public.has_permission(auth.uid(), 'time:read_department')
    AND public.is_department_scoped(
      auth.uid(),
      (SELECT department_id FROM public.profiles WHERE id = time_entries.user_id)
    )
  )
);

-- INSERT: own only
CREATE POLICY "time_entries_insert" ON public.time_entries FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: own only
CREATE POLICY "time_entries_update" ON public.time_entries FOR UPDATE
  USING (user_id = auth.uid());

-- DELETE: own only
CREATE POLICY "time_entries_delete" ON public.time_entries FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 14. Tighten week_statuses RLS
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read week_statuses" ON public.week_statuses;
DROP POLICY IF EXISTS "Anyone can insert week_statuses" ON public.week_statuses;
DROP POLICY IF EXISTS "Anyone can update week_statuses" ON public.week_statuses;

-- SELECT: own OR department-scoped OR read-all
CREATE POLICY "week_statuses_select" ON public.week_statuses FOR SELECT USING (
  user_id = auth.uid()
  OR public.has_permission(auth.uid(), 'time:read_all')
  OR (
    public.has_permission(auth.uid(), 'time:read_department')
    AND public.is_department_scoped(
      auth.uid(),
      (SELECT department_id FROM public.profiles WHERE id = week_statuses.user_id)
    )
  )
);

-- INSERT: own
CREATE POLICY "week_statuses_insert" ON public.week_statuses FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: own OR department unlock OR admin unlock
CREATE POLICY "week_statuses_update" ON public.week_statuses FOR UPDATE USING (
  user_id = auth.uid()
  OR public.has_permission(auth.uid(), 'week:unlock_all')
  OR (
    public.has_permission(auth.uid(), 'week:unlock_department')
    AND public.is_department_scoped(
      auth.uid(),
      (SELECT department_id FROM public.profiles WHERE id = week_statuses.user_id)
    )
  )
);
