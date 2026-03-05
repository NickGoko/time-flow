-- Add department scoping columns
ALTER TABLE public.deliverable_types
  ADD COLUMN IF NOT EXISTS department_id text,
  ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deliverable_types_dept_active
  ON public.deliverable_types (department_id, is_active);
CREATE INDEX IF NOT EXISTS idx_deliverable_types_global_active
  ON public.deliverable_types (is_global, is_active);