
-- ============================================================
-- Brick 1: Reference Data Tables + Seed
-- ============================================================

-- ── 1. departments ──────────────────────────────────────────
CREATE TABLE public.departments (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read departments" ON public.departments FOR SELECT USING (true);

-- ── 2. projects (workstreams) ───────────────────────────────
CREATE TABLE public.projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  default_billable_status text NOT NULL DEFAULT 'not_billable',
  type text NOT NULL DEFAULT 'external_project',
  owning_department_id text REFERENCES public.departments(id)
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read projects" ON public.projects FOR SELECT USING (true);

-- ── 3. project_department_access ────────────────────────────
CREATE TABLE public.project_department_access (
  workstream_id text NOT NULL REFERENCES public.projects(id),
  department_id text NOT NULL REFERENCES public.departments(id),
  PRIMARY KEY (workstream_id, department_id)
);
ALTER TABLE public.project_department_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read project_department_access" ON public.project_department_access FOR SELECT USING (true);

-- ── 4. phases ───────────────────────────────────────────────
CREATE TABLE public.phases (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read phases" ON public.phases FOR SELECT USING (true);

-- ── 5. activity_types ───────────────────────────────────────
CREATE TABLE public.activity_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  phase_id text NOT NULL REFERENCES public.phases(id),
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read activity_types" ON public.activity_types FOR SELECT USING (true);

-- ── 6. internal_work_areas ──────────────────────────────────
CREATE TABLE public.internal_work_areas (
  id text PRIMARY KEY,
  name text NOT NULL,
  department_id text NOT NULL REFERENCES public.departments(id),
  phase_id text NOT NULL REFERENCES public.phases(id),
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.internal_work_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read internal_work_areas" ON public.internal_work_areas FOR SELECT USING (true);

-- ── 7. deliverable_types ────────────────────────────────────
CREATE TABLE public.deliverable_types (
  id text PRIMARY KEY,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);
ALTER TABLE public.deliverable_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read deliverable_types" ON public.deliverable_types FOR SELECT USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Departments (8)
INSERT INTO public.departments (id, name, is_active) VALUES
  ('dept-consulting', 'Project Delivery (Impact)', true),
  ('dept-operations', 'Operations', true),
  ('dept-bd', 'Business Development', true),
  ('dept-finance', 'Finance, Legal and Administration', true),
  ('dept-it', 'IT, AI and Productivity', true),
  ('dept-hr', 'Human Resources', true),
  ('dept-comms', 'Communications', true),
  ('dept-mel', 'Data, Insights and Learning (MEL)', true);

-- Projects (13)
INSERT INTO public.projects (id, name, code, is_active, default_billable_status, type, owning_department_id) VALUES
  ('proj-flagship', 'Flagship', 'FLAGSHIP', true, 'billable', 'external_project', NULL),
  ('proj-jica-gbv', 'JICA GBV', 'JICA-GBV', true, 'billable', 'external_project', NULL),
  ('proj-ceic', 'CEIC', 'CEIC', true, 'billable', 'external_project', NULL),
  ('proj-risa', 'RISA', 'RISA', true, 'billable', 'external_project', NULL),
  ('proj-disrupt-for-her', 'Disrupt_for_Her', 'D4H', true, 'billable', 'external_project', NULL),
  ('proj-orange-corners', 'Orange Corners', 'OC', true, 'billable', 'external_project', NULL),
  ('proj-leave', 'Leave / Absence', 'LEAVE', true, 'not_billable', 'external_project', NULL),
  ('proj-internal-finance', 'Finance, Legal and Administration', 'INT-FIN', true, 'not_billable', 'internal_department', 'dept-finance'),
  ('proj-internal-hr', 'Human Resources', 'INT-HR', true, 'not_billable', 'internal_department', 'dept-hr'),
  ('proj-internal-comms', 'Communications', 'INT-COM', true, 'not_billable', 'internal_department', 'dept-comms'),
  ('proj-internal-mel', 'Data, Insights and Learning (MEL)', 'INT-MEL', true, 'not_billable', 'internal_department', 'dept-mel'),
  ('proj-internal-bd', 'Business Development', 'INT-BD', true, 'not_billable', 'internal_department', 'dept-bd'),
  ('proj-internal-it', 'IT, AI and Productivity', 'INT-IT', true, 'not_billable', 'internal_department', 'dept-it');

-- Project Department Access (22 rows)
INSERT INTO public.project_department_access (workstream_id, department_id) VALUES
  ('proj-flagship', 'dept-consulting'),
  ('proj-flagship', 'dept-operations'),
  ('proj-flagship', 'dept-bd'),
  ('proj-jica-gbv', 'dept-consulting'),
  ('proj-jica-gbv', 'dept-operations'),
  ('proj-ceic', 'dept-consulting'),
  ('proj-ceic', 'dept-operations'),
  ('proj-ceic', 'dept-bd'),
  ('proj-risa', 'dept-consulting'),
  ('proj-risa', 'dept-operations'),
  ('proj-disrupt-for-her', 'dept-bd'),
  ('proj-disrupt-for-her', 'dept-operations'),
  ('proj-orange-corners', 'dept-bd'),
  ('proj-orange-corners', 'dept-operations'),
  ('proj-leave', 'dept-consulting'),
  ('proj-leave', 'dept-operations'),
  ('proj-leave', 'dept-bd'),
  ('proj-leave', 'dept-finance'),
  ('proj-leave', 'dept-it'),
  ('proj-leave', 'dept-hr'),
  ('proj-leave', 'dept-comms'),
  ('proj-leave', 'dept-mel');

-- Phases: External (9)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-inception', 'Inception', true),
  ('phase-recruitment', 'Recruitment', true),
  ('phase-workshops', 'Workshops / bootcamps', true),
  ('phase-entrepreneur-support', 'Entrepreneur support', true),
  ('phase-growthlabs', 'Growthlabs', true),
  ('phase-master-classes', 'Master classes', true),
  ('phase-reporting', 'Reporting', true),
  ('phase-general-admin', 'General administrative', true),
  ('phase-absence', 'Absence', true);

-- Phases: Internal Finance (9 work areas → phase-fin-0..8)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-fin-0', 'Management accounts', true),
  ('phase-fin-1', 'Cashflow reports', true),
  ('phase-fin-2', 'Statutory returns (KE/HQ + subsidiaries)', true),
  ('phase-fin-3', 'Bookkeeping (general & projects)', true),
  ('phase-fin-4', 'Bank reconciliations', true),
  ('phase-fin-5', 'Risk assessment', true),
  ('phase-fin-6', 'Audit (external/internal)', true),
  ('phase-fin-7', 'Policies (training/enforcement/review)', true),
  ('phase-fin-8', 'Internal project audit / compliance', true);

-- Phases: Internal HR (10)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-hr-0', 'Staff welfare checks/events', true),
  ('phase-hr-1', 'L&D progress management', true),
  ('phase-hr-2', 'HR policy & handbook review', true),
  ('phase-hr-3', 'Culture & engagement', true),
  ('phase-hr-4', 'Payroll management', true),
  ('phase-hr-5', 'Performance management', true),
  ('phase-hr-6', 'Leave & absenteeism', true),
  ('phase-hr-7', 'Onboarding / offboarding', true),
  ('phase-hr-8', 'Probation / retention / attrition', true),
  ('phase-hr-9', 'Appraisals', true);

-- Phases: Internal Comms (9)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-comms-0', 'Social media posts & engagement', true),
  ('phase-comms-1', 'Online traffic / website updates', true),
  ('phase-comms-2', 'Media engagements / journalist engagements', true),
  ('phase-comms-3', 'Speaking engagements', true),
  ('phase-comms-4', 'Knowledge/expert pieces / learning-impact pieces', true),
  ('phase-comms-5', 'Storytelling pieces / case narratives', true),
  ('phase-comms-6', 'Newsletter (external)', true),
  ('phase-comms-7', 'Annual report', true),
  ('phase-comms-8', 'Internal comms training', true);

-- Phases: Internal MEL (8)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-mel-0', 'Data/system availability', true),
  ('phase-mel-1', 'Capacity development / team training', true),
  ('phase-mel-2', 'Data quality/integrity', true),
  ('phase-mel-3', 'Data insights/analysis', true),
  ('phase-mel-4', 'Insight pieces for comms', true),
  ('phase-mel-5', 'M&E resources up to date', true),
  ('phase-mel-6', 'Data collection audits / project results audits', true),
  ('phase-mel-7', 'Impact assumptions deep dive', true);

-- Phases: Internal BD (7)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-bd-0', 'Industry engagements / external events', true),
  ('phase-bd-1', 'New funder/client conversations', true),
  ('phase-bd-2', 'Concept notes (first full draft)', true),
  ('phase-bd-3', 'Leads (existing/new)', true),
  ('phase-bd-4', 'Proposals submitted', true),
  ('phase-bd-5', 'Contracts signed / key account management', true),
  ('phase-bd-6', 'Databases (clients/partners)', true);

-- Phases: Internal IT (8)
INSERT INTO public.phases (id, name, is_active) VALUES
  ('phase-it-0', 'User support & troubleshooting', true),
  ('phase-it-1', 'Laptop servicing & maintenance', true),
  ('phase-it-2', 'Connectivity status / network maintenance', true),
  ('phase-it-3', 'IT report', true),
  ('phase-it-4', 'On/offboarding', true),
  ('phase-it-5', 'Asset inventory management', true),
  ('phase-it-6', 'Training (basic / AI)', true),
  ('phase-it-7', 'Systems & knowledge documentation', true);

-- Internal Work Areas: Finance (9)
INSERT INTO public.internal_work_areas (id, name, department_id, phase_id, is_active) VALUES
  ('iwa-fin-0', 'Management accounts', 'dept-finance', 'phase-fin-0', true),
  ('iwa-fin-1', 'Cashflow reports', 'dept-finance', 'phase-fin-1', true),
  ('iwa-fin-2', 'Statutory returns (KE/HQ + subsidiaries)', 'dept-finance', 'phase-fin-2', true),
  ('iwa-fin-3', 'Bookkeeping (general & projects)', 'dept-finance', 'phase-fin-3', true),
  ('iwa-fin-4', 'Bank reconciliations', 'dept-finance', 'phase-fin-4', true),
  ('iwa-fin-5', 'Risk assessment', 'dept-finance', 'phase-fin-5', true),
  ('iwa-fin-6', 'Audit (external/internal)', 'dept-finance', 'phase-fin-6', true),
  ('iwa-fin-7', 'Policies (training/enforcement/review)', 'dept-finance', 'phase-fin-7', true),
  ('iwa-fin-8', 'Internal project audit / compliance', 'dept-finance', 'phase-fin-8', true);

-- Internal Work Areas: HR (10)
INSERT INTO public.internal_work_areas (id, name, department_id, phase_id, is_active) VALUES
  ('iwa-hr-0', 'Staff welfare checks/events', 'dept-hr', 'phase-hr-0', true),
  ('iwa-hr-1', 'L&D progress management', 'dept-hr', 'phase-hr-1', true),
  ('iwa-hr-2', 'HR policy & handbook review', 'dept-hr', 'phase-hr-2', true),
  ('iwa-hr-3', 'Culture & engagement', 'dept-hr', 'phase-hr-3', true),
  ('iwa-hr-4', 'Payroll management', 'dept-hr', 'phase-hr-4', true),
  ('iwa-hr-5', 'Performance management', 'dept-hr', 'phase-hr-5', true),
  ('iwa-hr-6', 'Leave & absenteeism', 'dept-hr', 'phase-hr-6', true),
  ('iwa-hr-7', 'Onboarding / offboarding', 'dept-hr', 'phase-hr-7', true),
  ('iwa-hr-8', 'Probation / retention / attrition', 'dept-hr', 'phase-hr-8', true),
  ('iwa-hr-9', 'Appraisals', 'dept-hr', 'phase-hr-9', true);

-- Internal Work Areas: Comms (9)
INSERT INTO public.internal_work_areas (id, name, department_id, phase_id, is_active) VALUES
  ('iwa-comms-0', 'Social media posts & engagement', 'dept-comms', 'phase-comms-0', true),
  ('iwa-comms-1', 'Online traffic / website updates', 'dept-comms', 'phase-comms-1', true),
  ('iwa-comms-2', 'Media engagements / journalist engagements', 'dept-comms', 'phase-comms-2', true),
  ('iwa-comms-3', 'Speaking engagements', 'dept-comms', 'phase-comms-3', true),
  ('iwa-comms-4', 'Knowledge/expert pieces / learning-impact pieces', 'dept-comms', 'phase-comms-4', true),
  ('iwa-comms-5', 'Storytelling pieces / case narratives', 'dept-comms', 'phase-comms-5', true),
  ('iwa-comms-6', 'Newsletter (external)', 'dept-comms', 'phase-comms-6', true),
  ('iwa-comms-7', 'Annual report', 'dept-comms', 'phase-comms-7', true),
  ('iwa-comms-8', 'Internal comms training', 'dept-comms', 'phase-comms-8', true);

-- Internal Work Areas: MEL (8)
INSERT INTO public.internal_work_areas (id, name, department_id, phase_id, is_active) VALUES
  ('iwa-mel-0', 'Data/system availability', 'dept-mel', 'phase-mel-0', true),
  ('iwa-mel-1', 'Capacity development / team training', 'dept-mel', 'phase-mel-1', true),
  ('iwa-mel-2', 'Data quality/integrity', 'dept-mel', 'phase-mel-2', true),
  ('iwa-mel-3', 'Data insights/analysis', 'dept-mel', 'phase-mel-3', true),
  ('iwa-mel-4', 'Insight pieces for comms', 'dept-mel', 'phase-mel-4', true),
  ('iwa-mel-5', 'M&E resources up to date', 'dept-mel', 'phase-mel-5', true),
  ('iwa-mel-6', 'Data collection audits / project results audits', 'dept-mel', 'phase-mel-6', true),
  ('iwa-mel-7', 'Impact assumptions deep dive', 'dept-mel', 'phase-mel-7', true);

-- Internal Work Areas: BD (7)
INSERT INTO public.internal_work_areas (id, name, department_id, phase_id, is_active) VALUES
  ('iwa-bd-0', 'Industry engagements / external events', 'dept-bd', 'phase-bd-0', true),
  ('iwa-bd-1', 'New funder/client conversations', 'dept-bd', 'phase-bd-1', true),
  ('iwa-bd-2', 'Concept notes (first full draft)', 'dept-bd', 'phase-bd-2', true),
  ('iwa-bd-3', 'Leads (existing/new)', 'dept-bd', 'phase-bd-3', true),
  ('iwa-bd-4', 'Proposals submitted', 'dept-bd', 'phase-bd-4', true),
  ('iwa-bd-5', 'Contracts signed / key account management', 'dept-bd', 'phase-bd-5', true),
  ('iwa-bd-6', 'Databases (clients/partners)', 'dept-bd', 'phase-bd-6', true);

-- Internal Work Areas: IT (8)
INSERT INTO public.internal_work_areas (id, name, department_id, phase_id, is_active) VALUES
  ('iwa-it-0', 'User support & troubleshooting', 'dept-it', 'phase-it-0', true),
  ('iwa-it-1', 'Laptop servicing & maintenance', 'dept-it', 'phase-it-1', true),
  ('iwa-it-2', 'Connectivity status / network maintenance', 'dept-it', 'phase-it-2', true),
  ('iwa-it-3', 'IT report', 'dept-it', 'phase-it-3', true),
  ('iwa-it-4', 'On/offboarding', 'dept-it', 'phase-it-4', true),
  ('iwa-it-5', 'Asset inventory management', 'dept-it', 'phase-it-5', true),
  ('iwa-it-6', 'Training (basic / AI)', 'dept-it', 'phase-it-6', true),
  ('iwa-it-7', 'Systems & knowledge documentation', 'dept-it', 'phase-it-7', true);

-- Activity Types: External phases
-- Inception (8)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-inception-prep', 'Kickoff preparation', 'phase-inception', true),
  ('act-inception-meeting', 'Kickoff meeting', 'phase-inception', true),
  ('act-inception-report', 'Inception report drafting', 'phase-inception', true),
  ('act-inception-client', 'Client meeting', 'phase-inception', true),
  ('act-inception-partner', 'Partner meeting', 'phase-inception', true),
  ('act-inception-workplan', 'Workplan finalisation', 'phase-inception', true),
  ('act-inception-stakeholder', 'Stakeholder mapping', 'phase-inception', true),
  ('act-inception-other', 'Other (specify)', 'phase-inception', true);

-- Recruitment (9)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-recruit-outreach', 'Outreach', 'phase-recruitment', true),
  ('act-recruit-screening', 'Candidate screening', 'phase-recruitment', true),
  ('act-recruit-panel', 'Selection panel prep', 'phase-recruitment', true),
  ('act-recruit-interviews', 'Interviews/selection', 'phase-recruitment', true),
  ('act-recruit-onboarding', 'Onboarding', 'phase-recruitment', true),
  ('act-recruit-events', 'External event participation', 'phase-recruitment', true),
  ('act-recruit-client', 'Client meeting', 'phase-recruitment', true),
  ('act-recruit-partner', 'Partner meeting', 'phase-recruitment', true),
  ('act-recruit-other', 'Other (specify)', 'phase-recruitment', true);

-- Workshops (9)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-ws-curriculum', 'Curriculum design', 'phase-workshops', true),
  ('act-ws-speakers', 'Speaker sourcing', 'phase-workshops', true),
  ('act-ws-logistics', 'Logistics planning', 'phase-workshops', true),
  ('act-ws-delivery', 'Workshop delivery', 'phase-workshops', true),
  ('act-ws-followup', 'Attendance follow-up', 'phase-workshops', true),
  ('act-ws-evaluation', 'Post-workshop evaluation', 'phase-workshops', true),
  ('act-ws-client', 'Client meeting', 'phase-workshops', true),
  ('act-ws-partner', 'Partner meeting', 'phase-workshops', true),
  ('act-ws-other', 'Other (specify)', 'phase-workshops', true);

-- Entrepreneur support (9)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-es-prep', '1:1 prep', 'phase-entrepreneur-support', true),
  ('act-es-session', '1:1 support session', 'phase-entrepreneur-support', true),
  ('act-es-sprint', 'Sprint support', 'phase-entrepreneur-support', true),
  ('act-es-research', 'Market research', 'phase-entrepreneur-support', true),
  ('act-es-diagnostics', 'Business diagnostics', 'phase-entrepreneur-support', true),
  ('act-es-followups', 'Follow-ups', 'phase-entrepreneur-support', true),
  ('act-es-transport', 'Transport', 'phase-entrepreneur-support', true),
  ('act-es-meeting', 'Client/partner meeting', 'phase-entrepreneur-support', true),
  ('act-es-other', 'Other (specify)', 'phase-entrepreneur-support', true);

-- Growthlabs (7)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-gl-planning', 'Planning', 'phase-growthlabs', true),
  ('act-gl-coordination', 'Participant coordination', 'phase-growthlabs', true),
  ('act-gl-facilitation', 'Facilitation', 'phase-growthlabs', true),
  ('act-gl-followup', 'Follow-up', 'phase-growthlabs', true),
  ('act-gl-outcomes', 'Outcome capture', 'phase-growthlabs', true),
  ('act-gl-partner', 'Partner meeting', 'phase-growthlabs', true),
  ('act-gl-other', 'Other (specify)', 'phase-growthlabs', true);

-- Master classes (6)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-mc-planning', 'Planning', 'phase-master-classes', true),
  ('act-mc-mobilisation', 'Mentor/resource mobilisation', 'phase-master-classes', true),
  ('act-mc-delivery', 'Delivery', 'phase-master-classes', true),
  ('act-mc-followup', 'Learner follow-up', 'phase-master-classes', true),
  ('act-mc-meeting', 'Partner/client meeting', 'phase-master-classes', true),
  ('act-mc-other', 'Other (specify)', 'phase-master-classes', true);

-- Reporting (8)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-rpt-collection', 'Data collection', 'phase-reporting', true),
  ('act-rpt-cleaning', 'Data cleaning', 'phase-reporting', true),
  ('act-rpt-narrative', 'Narrative drafting', 'phase-reporting', true),
  ('act-rpt-donor', 'Donor reporting', 'phase-reporting', true),
  ('act-rpt-casestudy', 'Case study development', 'phase-reporting', true),
  ('act-rpt-review', 'Internal review', 'phase-reporting', true),
  ('act-rpt-submission', 'Submission', 'phase-reporting', true),
  ('act-rpt-other', 'Other (specify)', 'phase-reporting', true);

-- General administrative (7)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-admin-team', 'Team meeting', 'phase-general-admin', true),
  ('act-admin-coordination', 'Internal coordination', 'phase-general-admin', true),
  ('act-admin-travel', 'Travel/logistics', 'phase-general-admin', true),
  ('act-admin-event', 'Event attendance', 'phase-general-admin', true),
  ('act-admin-meeting', 'Client/partner meeting', 'phase-general-admin', true),
  ('act-admin-filing', 'Filing/documentation', 'phase-general-admin', true),
  ('act-admin-other', 'Other (specify)', 'phase-general-admin', true);

-- Absence (2)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-leave-day', 'Leave day', 'phase-absence', true),
  ('act-public-holiday', 'Public holiday', 'phase-absence', true);

-- Activity Types: Internal Finance (9 work areas)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-fin-0-0', 'GL review', 'phase-fin-0', true),
  ('act-fin-0-1', 'Journals & accruals', 'phase-fin-0', true),
  ('act-fin-0-2', 'Cost centre review', 'phase-fin-0', true),
  ('act-fin-0-3', 'Variance analysis', 'phase-fin-0', true),
  ('act-fin-0-4', 'Management pack drafting', 'phase-fin-0', true),
  ('act-fin-0-5', 'Review meeting', 'phase-fin-0', true),
  ('act-fin-0-6', 'Other (specify)', 'phase-fin-0', true),
  ('act-fin-1-0', 'Bank position update', 'phase-fin-1', true),
  ('act-fin-1-1', 'Cashflow forecast update', 'phase-fin-1', true),
  ('act-fin-1-2', 'Payables scheduling', 'phase-fin-1', true),
  ('act-fin-1-3', 'Receivables follow-up', 'phase-fin-1', true),
  ('act-fin-1-4', 'Treasury review', 'phase-fin-1', true),
  ('act-fin-1-5', 'Other (specify)', 'phase-fin-1', true),
  ('act-fin-2-0', 'Tax computations', 'phase-fin-2', true),
  ('act-fin-2-1', 'Filing preparation', 'phase-fin-2', true),
  ('act-fin-2-2', 'Payment processing', 'phase-fin-2', true),
  ('act-fin-2-3', 'Statutory reconciliations', 'phase-fin-2', true),
  ('act-fin-2-4', 'Queries & follow-ups', 'phase-fin-2', true),
  ('act-fin-2-5', 'Other (specify)', 'phase-fin-2', true),
  ('act-fin-3-0', 'Posting transactions', 'phase-fin-3', true),
  ('act-fin-3-1', 'Coding review', 'phase-fin-3', true),
  ('act-fin-3-2', 'Supporting docs follow-up', 'phase-fin-3', true),
  ('act-fin-3-3', 'Expense verification', 'phase-fin-3', true),
  ('act-fin-3-4', 'Project cost tagging', 'phase-fin-3', true),
  ('act-fin-3-5', 'Other (specify)', 'phase-fin-3', true),
  ('act-fin-4-0', 'Statement download', 'phase-fin-4', true),
  ('act-fin-4-1', 'Matching & clearing', 'phase-fin-4', true),
  ('act-fin-4-2', 'Exception investigation', 'phase-fin-4', true),
  ('act-fin-4-3', 'Adjustments/journals', 'phase-fin-4', true),
  ('act-fin-4-4', 'Sign-off', 'phase-fin-4', true),
  ('act-fin-4-5', 'Other (specify)', 'phase-fin-4', true),
  ('act-fin-5-0', 'Risk register update', 'phase-fin-5', true),
  ('act-fin-5-1', 'Controls testing', 'phase-fin-5', true),
  ('act-fin-5-2', 'Incident review', 'phase-fin-5', true),
  ('act-fin-5-3', 'Mitigation planning', 'phase-fin-5', true),
  ('act-fin-5-4', 'Reporting', 'phase-fin-5', true),
  ('act-fin-5-5', 'Other (specify)', 'phase-fin-5', true),
  ('act-fin-6-0', 'PBC preparation', 'phase-fin-6', true),
  ('act-fin-6-1', 'Schedule preparation', 'phase-fin-6', true),
  ('act-fin-6-2', 'Auditor support', 'phase-fin-6', true),
  ('act-fin-6-3', 'Query responses', 'phase-fin-6', true),
  ('act-fin-6-4', 'Evidence collation', 'phase-fin-6', true),
  ('act-fin-6-5', 'Close-out actions', 'phase-fin-6', true),
  ('act-fin-6-6', 'Other (specify)', 'phase-fin-6', true),
  ('act-fin-7-0', 'Policy drafting', 'phase-fin-7', true),
  ('act-fin-7-1', 'Stakeholder review', 'phase-fin-7', true),
  ('act-fin-7-2', 'Training session delivery', 'phase-fin-7', true),
  ('act-fin-7-3', 'Compliance follow-up', 'phase-fin-7', true),
  ('act-fin-7-4', 'Updates/versioning', 'phase-fin-7', true),
  ('act-fin-7-5', 'Other (specify)', 'phase-fin-7', true),
  ('act-fin-8-0', 'Spot checks', 'phase-fin-8', true),
  ('act-fin-8-1', 'Document review', 'phase-fin-8', true),
  ('act-fin-8-2', 'Issue log', 'phase-fin-8', true),
  ('act-fin-8-3', 'Remediation follow-up', 'phase-fin-8', true),
  ('act-fin-8-4', 'Reporting', 'phase-fin-8', true),
  ('act-fin-8-5', 'Other (specify)', 'phase-fin-8', true);

-- Activity Types: Internal HR (10 work areas)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-hr-0-0', 'Check-in calls', 'phase-hr-0', true),
  ('act-hr-0-1', 'Welfare assessment', 'phase-hr-0', true),
  ('act-hr-0-2', 'Event planning', 'phase-hr-0', true),
  ('act-hr-0-3', 'Event delivery', 'phase-hr-0', true),
  ('act-hr-0-4', 'Feedback capture', 'phase-hr-0', true),
  ('act-hr-0-5', 'Other (specify)', 'phase-hr-0', true),
  ('act-hr-1-0', 'Training needs assessment', 'phase-hr-1', true),
  ('act-hr-1-1', 'Scheduling', 'phase-hr-1', true),
  ('act-hr-1-2', 'Tracking completion', 'phase-hr-1', true),
  ('act-hr-1-3', 'Vendor coordination', 'phase-hr-1', true),
  ('act-hr-1-4', 'Learning report', 'phase-hr-1', true),
  ('act-hr-1-5', 'Other (specify)', 'phase-hr-1', true),
  ('act-hr-2-0', 'Policy drafting', 'phase-hr-2', true),
  ('act-hr-2-1', 'Review cycle', 'phase-hr-2', true),
  ('act-hr-2-2', 'Stakeholder consultation', 'phase-hr-2', true),
  ('act-hr-2-3', 'Finalisation', 'phase-hr-2', true),
  ('act-hr-2-4', 'Communication rollout', 'phase-hr-2', true),
  ('act-hr-2-5', 'Other (specify)', 'phase-hr-2', true),
  ('act-hr-3-0', 'Pulse survey', 'phase-hr-3', true),
  ('act-hr-3-1', 'Engagement initiatives', 'phase-hr-3', true),
  ('act-hr-3-2', 'Facilitation', 'phase-hr-3', true),
  ('act-hr-3-3', 'Issue resolution', 'phase-hr-3', true),
  ('act-hr-3-4', 'Reporting', 'phase-hr-3', true),
  ('act-hr-3-5', 'Other (specify)', 'phase-hr-3', true),
  ('act-hr-4-0', 'Payroll inputs collection', 'phase-hr-4', true),
  ('act-hr-4-1', 'Review & approvals', 'phase-hr-4', true),
  ('act-hr-4-2', 'Payroll processing support', 'phase-hr-4', true),
  ('act-hr-4-3', 'Deductions/reconciliations', 'phase-hr-4', true),
  ('act-hr-4-4', 'Payslip distribution', 'phase-hr-4', true),
  ('act-hr-4-5', 'Other (specify)', 'phase-hr-4', true),
  ('act-hr-5-0', 'Goal-setting cycle support', 'phase-hr-5', true),
  ('act-hr-5-1', 'Check-in reminders', 'phase-hr-5', true),
  ('act-hr-5-2', 'Review facilitation', 'phase-hr-5', true),
  ('act-hr-5-3', 'Documentation', 'phase-hr-5', true),
  ('act-hr-5-4', 'Performance improvement support', 'phase-hr-5', true),
  ('act-hr-5-5', 'Other (specify)', 'phase-hr-5', true),
  ('act-hr-6-0', 'Leave approvals support', 'phase-hr-6', true),
  ('act-hr-6-1', 'Leave balance audit', 'phase-hr-6', true),
  ('act-hr-6-2', 'Absenteeism follow-up', 'phase-hr-6', true),
  ('act-hr-6-3', 'Reporting', 'phase-hr-6', true),
  ('act-hr-6-4', 'Other (specify)', 'phase-hr-6', true),
  ('act-hr-7-0', 'Offer & contract admin', 'phase-hr-7', true),
  ('act-hr-7-1', 'Onboarding checklist', 'phase-hr-7', true),
  ('act-hr-7-2', 'Orientation', 'phase-hr-7', true),
  ('act-hr-7-3', 'Access provisioning coordination', 'phase-hr-7', true),
  ('act-hr-7-4', 'Exit process coordination', 'phase-hr-7', true),
  ('act-hr-7-5', 'Other (specify)', 'phase-hr-7', true),
  ('act-hr-8-0', 'Probation check-ins', 'phase-hr-8', true),
  ('act-hr-8-1', 'Retention actions', 'phase-hr-8', true),
  ('act-hr-8-2', 'Exit interviews', 'phase-hr-8', true),
  ('act-hr-8-3', 'Data capture', 'phase-hr-8', true),
  ('act-hr-8-4', 'Reporting', 'phase-hr-8', true),
  ('act-hr-8-5', 'Other (specify)', 'phase-hr-8', true),
  ('act-hr-9-0', 'Appraisal scheduling', 'phase-hr-9', true),
  ('act-hr-9-1', 'Evidence gathering', 'phase-hr-9', true),
  ('act-hr-9-2', 'Panel support', 'phase-hr-9', true),
  ('act-hr-9-3', 'Results communication', 'phase-hr-9', true),
  ('act-hr-9-4', 'Filing', 'phase-hr-9', true),
  ('act-hr-9-5', 'Other (specify)', 'phase-hr-9', true);

-- Activity Types: Internal Comms (9 work areas)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-comms-0-0', 'Content planning', 'phase-comms-0', true),
  ('act-comms-0-1', 'Copywriting', 'phase-comms-0', true),
  ('act-comms-0-2', 'Design brief', 'phase-comms-0', true),
  ('act-comms-0-3', 'Publishing', 'phase-comms-0', true),
  ('act-comms-0-4', 'Community management', 'phase-comms-0', true),
  ('act-comms-0-5', 'Performance review', 'phase-comms-0', true),
  ('act-comms-0-6', 'Other (specify)', 'phase-comms-0', true),
  ('act-comms-1-0', 'Website edits', 'phase-comms-1', true),
  ('act-comms-1-1', 'SEO updates', 'phase-comms-1', true),
  ('act-comms-1-2', 'Analytics review', 'phase-comms-1', true),
  ('act-comms-1-3', 'Landing page build', 'phase-comms-1', true),
  ('act-comms-1-4', 'Uploads & publishing', 'phase-comms-1', true),
  ('act-comms-1-5', 'Other (specify)', 'phase-comms-1', true),
  ('act-comms-2-0', 'Media list update', 'phase-comms-2', true),
  ('act-comms-2-1', 'Pitching', 'phase-comms-2', true),
  ('act-comms-2-2', 'Interview coordination', 'phase-comms-2', true),
  ('act-comms-2-3', 'Press release drafting', 'phase-comms-2', true),
  ('act-comms-2-4', 'Follow-ups', 'phase-comms-2', true),
  ('act-comms-2-5', 'Other (specify)', 'phase-comms-2', true),
  ('act-comms-3-0', 'Speaker prep', 'phase-comms-3', true),
  ('act-comms-3-1', 'Slide support', 'phase-comms-3', true),
  ('act-comms-3-2', 'Event coordination', 'phase-comms-3', true),
  ('act-comms-3-3', 'Post-event comms', 'phase-comms-3', true),
  ('act-comms-3-4', 'Other (specify)', 'phase-comms-3', true),
  ('act-comms-4-0', 'Topic research', 'phase-comms-4', true),
  ('act-comms-4-1', 'Interviews', 'phase-comms-4', true),
  ('act-comms-4-2', 'Draft writing', 'phase-comms-4', true),
  ('act-comms-4-3', 'Editing', 'phase-comms-4', true),
  ('act-comms-4-4', 'Publishing', 'phase-comms-4', true),
  ('act-comms-4-5', 'Other (specify)', 'phase-comms-4', true),
  ('act-comms-5-0', 'Story sourcing', 'phase-comms-5', true),
  ('act-comms-5-1', 'Field interviews', 'phase-comms-5', true),
  ('act-comms-5-2', 'Drafting', 'phase-comms-5', true),
  ('act-comms-5-3', 'Editing', 'phase-comms-5', true),
  ('act-comms-5-4', 'Approval cycle', 'phase-comms-5', true),
  ('act-comms-5-5', 'Other (specify)', 'phase-comms-5', true),
  ('act-comms-6-0', 'Content collection', 'phase-comms-6', true),
  ('act-comms-6-1', 'Drafting', 'phase-comms-6', true),
  ('act-comms-6-2', 'Design', 'phase-comms-6', true),
  ('act-comms-6-3', 'Mailing list management', 'phase-comms-6', true),
  ('act-comms-6-4', 'Send & performance review', 'phase-comms-6', true),
  ('act-comms-6-5', 'Other (specify)', 'phase-comms-6', true),
  ('act-comms-7-0', 'Data requests', 'phase-comms-7', true),
  ('act-comms-7-1', 'Narrative drafting', 'phase-comms-7', true),
  ('act-comms-7-2', 'Design coordination', 'phase-comms-7', true),
  ('act-comms-7-3', 'Proofing', 'phase-comms-7', true),
  ('act-comms-7-4', 'Final approval', 'phase-comms-7', true),
  ('act-comms-7-5', 'Other (specify)', 'phase-comms-7', true),
  ('act-comms-8-0', 'Training prep', 'phase-comms-8', true),
  ('act-comms-8-1', 'Training delivery', 'phase-comms-8', true),
  ('act-comms-8-2', 'Materials update', 'phase-comms-8', true),
  ('act-comms-8-3', 'Feedback capture', 'phase-comms-8', true),
  ('act-comms-8-4', 'Other (specify)', 'phase-comms-8', true);

-- Activity Types: Internal MEL (8 work areas)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-mel-0-0', 'Tool checks', 'phase-mel-0', true),
  ('act-mel-0-1', 'Access troubleshooting', 'phase-mel-0', true),
  ('act-mel-0-2', 'Data pipeline monitoring', 'phase-mel-0', true),
  ('act-mel-0-3', 'Issue escalation', 'phase-mel-0', true),
  ('act-mel-0-4', 'Other (specify)', 'phase-mel-0', true),
  ('act-mel-1-0', 'Training design', 'phase-mel-1', true),
  ('act-mel-1-1', 'Training delivery', 'phase-mel-1', true),
  ('act-mel-1-2', 'Coaching', 'phase-mel-1', true),
  ('act-mel-1-3', 'Materials update', 'phase-mel-1', true),
  ('act-mel-1-4', 'Other (specify)', 'phase-mel-1', true),
  ('act-mel-2-0', 'Data validation', 'phase-mel-2', true),
  ('act-mel-2-1', 'Cleaning', 'phase-mel-2', true),
  ('act-mel-2-2', 'Data audits', 'phase-mel-2', true),
  ('act-mel-2-3', 'Fix recommendations', 'phase-mel-2', true),
  ('act-mel-2-4', 'Other (specify)', 'phase-mel-2', true),
  ('act-mel-3-0', 'Analysis design', 'phase-mel-3', true),
  ('act-mel-3-1', 'Data extraction', 'phase-mel-3', true),
  ('act-mel-3-2', 'Modelling', 'phase-mel-3', true),
  ('act-mel-3-3', 'Insight write-up', 'phase-mel-3', true),
  ('act-mel-3-4', 'Presentation', 'phase-mel-3', true),
  ('act-mel-3-5', 'Other (specify)', 'phase-mel-3', true),
  ('act-mel-4-0', 'Insight drafting', 'phase-mel-4', true),
  ('act-mel-4-1', 'Fact checking', 'phase-mel-4', true),
  ('act-mel-4-2', 'Visuals coordination', 'phase-mel-4', true),
  ('act-mel-4-3', 'Review & sign-off', 'phase-mel-4', true),
  ('act-mel-4-4', 'Other (specify)', 'phase-mel-4', true),
  ('act-mel-5-0', 'Indicator review', 'phase-mel-5', true),
  ('act-mel-5-1', 'Tools/templates update', 'phase-mel-5', true),
  ('act-mel-5-2', 'Documentation', 'phase-mel-5', true),
  ('act-mel-5-3', 'Stakeholder alignment', 'phase-mel-5', true),
  ('act-mel-5-4', 'Other (specify)', 'phase-mel-5', true),
  ('act-mel-6-0', 'Sampling plan', 'phase-mel-6', true),
  ('act-mel-6-1', 'Evidence review', 'phase-mel-6', true),
  ('act-mel-6-2', 'Field coordination', 'phase-mel-6', true),
  ('act-mel-6-3', 'Findings log', 'phase-mel-6', true),
  ('act-mel-6-4', 'Reporting', 'phase-mel-6', true),
  ('act-mel-6-5', 'Other (specify)', 'phase-mel-6', true),
  ('act-mel-7-0', 'Theory-of-change review', 'phase-mel-7', true),
  ('act-mel-7-1', 'Assumption testing', 'phase-mel-7', true),
  ('act-mel-7-2', 'Evidence gathering', 'phase-mel-7', true),
  ('act-mel-7-3', 'Learning brief', 'phase-mel-7', true),
  ('act-mel-7-4', 'Other (specify)', 'phase-mel-7', true);

-- Activity Types: Internal BD (7 work areas)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-bd-0-0', 'Outreach', 'phase-bd-0', true),
  ('act-bd-0-1', 'Scheduling', 'phase-bd-0', true),
  ('act-bd-0-2', 'Attendance', 'phase-bd-0', true),
  ('act-bd-0-3', 'Follow-ups', 'phase-bd-0', true),
  ('act-bd-0-4', 'Notes & CRM updates', 'phase-bd-0', true),
  ('act-bd-0-5', 'Other (specify)', 'phase-bd-0', true),
  ('act-bd-1-0', 'Intro call', 'phase-bd-1', true),
  ('act-bd-1-1', 'Discovery', 'phase-bd-1', true),
  ('act-bd-1-2', 'Needs capture', 'phase-bd-1', true),
  ('act-bd-1-3', 'Follow-up emails', 'phase-bd-1', true),
  ('act-bd-1-4', 'Pipeline update', 'phase-bd-1', true),
  ('act-bd-1-5', 'Other (specify)', 'phase-bd-1', true),
  ('act-bd-2-0', 'Research', 'phase-bd-2', true),
  ('act-bd-2-1', 'Draft writing', 'phase-bd-2', true),
  ('act-bd-2-2', 'Review cycle', 'phase-bd-2', true),
  ('act-bd-2-3', 'Revision', 'phase-bd-2', true),
  ('act-bd-2-4', 'Submission', 'phase-bd-2', true),
  ('act-bd-2-5', 'Other (specify)', 'phase-bd-2', true),
  ('act-bd-3-0', 'Lead sourcing', 'phase-bd-3', true),
  ('act-bd-3-1', 'Qualification', 'phase-bd-3', true),
  ('act-bd-3-2', 'Proposal planning', 'phase-bd-3', true),
  ('act-bd-3-3', 'Handover', 'phase-bd-3', true),
  ('act-bd-3-4', 'Pipeline hygiene', 'phase-bd-3', true),
  ('act-bd-3-5', 'Other (specify)', 'phase-bd-3', true),
  ('act-bd-4-0', 'Proposal drafting', 'phase-bd-4', true),
  ('act-bd-4-1', 'Budgeting inputs', 'phase-bd-4', true),
  ('act-bd-4-2', 'Partner coordination', 'phase-bd-4', true),
  ('act-bd-4-3', 'Compliance checks', 'phase-bd-4', true),
  ('act-bd-4-4', 'Submission admin', 'phase-bd-4', true),
  ('act-bd-4-5', 'Other (specify)', 'phase-bd-4', true),
  ('act-bd-5-0', 'Negotiation support', 'phase-bd-5', true),
  ('act-bd-5-1', 'Contract review coordination', 'phase-bd-5', true),
  ('act-bd-5-2', 'Account check-ins', 'phase-bd-5', true),
  ('act-bd-5-3', 'Reporting to client', 'phase-bd-5', true),
  ('act-bd-5-4', 'Upsell/cross-sell', 'phase-bd-5', true),
  ('act-bd-5-5', 'Other (specify)', 'phase-bd-5', true),
  ('act-bd-6-0', 'Data entry', 'phase-bd-6', true),
  ('act-bd-6-1', 'Data cleaning', 'phase-bd-6', true),
  ('act-bd-6-2', 'Segmentation', 'phase-bd-6', true),
  ('act-bd-6-3', 'Outreach list build', 'phase-bd-6', true),
  ('act-bd-6-4', 'Other (specify)', 'phase-bd-6', true);

-- Activity Types: Internal IT (8 work areas)
INSERT INTO public.activity_types (id, name, phase_id, is_active) VALUES
  ('act-it-0-0', 'Ticket triage', 'phase-it-0', true),
  ('act-it-0-1', 'Remote support', 'phase-it-0', true),
  ('act-it-0-2', 'Hardware diagnostics', 'phase-it-0', true),
  ('act-it-0-3', 'Software install/config', 'phase-it-0', true),
  ('act-it-0-4', 'Access support', 'phase-it-0', true),
  ('act-it-0-5', 'Follow-up', 'phase-it-0', true),
  ('act-it-0-6', 'Other (specify)', 'phase-it-0', true),
  ('act-it-1-0', 'Preventive maintenance', 'phase-it-1', true),
  ('act-it-1-1', 'Repairs coordination', 'phase-it-1', true),
  ('act-it-1-2', 'Imaging/rebuilds', 'phase-it-1', true),
  ('act-it-1-3', 'Warranty/vendor follow-up', 'phase-it-1', true),
  ('act-it-1-4', 'Asset tagging', 'phase-it-1', true),
  ('act-it-1-5', 'Other (specify)', 'phase-it-1', true),
  ('act-it-2-0', 'ISP troubleshooting', 'phase-it-2', true),
  ('act-it-2-1', 'Router/AP checks', 'phase-it-2', true),
  ('act-it-2-2', 'Performance monitoring', 'phase-it-2', true),
  ('act-it-2-3', 'Changes/config updates', 'phase-it-2', true),
  ('act-it-2-4', 'Documentation', 'phase-it-2', true),
  ('act-it-2-5', 'Other (specify)', 'phase-it-2', true),
  ('act-it-3-0', 'Metrics capture', 'phase-it-3', true),
  ('act-it-3-1', 'Incident summary', 'phase-it-3', true),
  ('act-it-3-2', 'Asset updates', 'phase-it-3', true),
  ('act-it-3-3', 'Risk/issues log', 'phase-it-3', true),
  ('act-it-3-4', 'Report drafting', 'phase-it-3', true),
  ('act-it-3-5', 'Other (specify)', 'phase-it-3', true),
  ('act-it-4-0', 'Account setup', 'phase-it-4', true),
  ('act-it-4-1', 'Permissions', 'phase-it-4', true),
  ('act-it-4-2', 'Device allocation', 'phase-it-4', true),
  ('act-it-4-3', 'Security baseline', 'phase-it-4', true),
  ('act-it-4-4', 'Exit wipe/return', 'phase-it-4', true),
  ('act-it-4-5', 'Other (specify)', 'phase-it-4', true),
  ('act-it-5-0', 'Asset register updates', 'phase-it-5', true),
  ('act-it-5-1', 'Audit checks', 'phase-it-5', true),
  ('act-it-5-2', 'Procurement requests', 'phase-it-5', true),
  ('act-it-5-3', 'Disposal processes', 'phase-it-5', true),
  ('act-it-5-4', 'Other (specify)', 'phase-it-5', true),
  ('act-it-6-0', 'Training prep', 'phase-it-6', true),
  ('act-it-6-1', 'Training delivery', 'phase-it-6', true),
  ('act-it-6-2', 'Office hours', 'phase-it-6', true),
  ('act-it-6-3', 'Materials update', 'phase-it-6', true),
  ('act-it-6-4', 'Other (specify)', 'phase-it-6', true),
  ('act-it-7-0', 'SOP drafting', 'phase-it-7', true),
  ('act-it-7-1', 'Process mapping', 'phase-it-7', true),
  ('act-it-7-2', 'How-to guides', 'phase-it-7', true),
  ('act-it-7-3', 'Architecture notes', 'phase-it-7', true),
  ('act-it-7-4', 'Updates/versioning', 'phase-it-7', true),
  ('act-it-7-5', 'Other (specify)', 'phase-it-7', true);

-- Deliverable Types (6)
INSERT INTO public.deliverable_types (id, name, is_active) VALUES
  ('del-workshop', 'Workshop', true),
  ('del-reporting', 'Reporting', true),
  ('del-training', 'Training', true),
  ('del-event', 'Event', true),
  ('del-case_study', 'Case study', true),
  ('del-other', 'Other', true);
