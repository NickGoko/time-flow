import { User, Project, Phase, ActivityType, TimeEntry, WeekStatus, BillableStatus, DeliverableType, WEEKLY_EXPECTED_HOURS, Department, ProjectDepartmentAccess, InternalWorkArea, GroupedWorkstreams } from '@/types';

// ── Departments ─────────────────────────────────────────────────────

export const departments: Department[] = [
  { id: 'dept-consulting', name: 'Consulting' },
  { id: 'dept-operations', name: 'Operations' },
  { id: 'dept-bd', name: 'Business Development' },
  { id: 'dept-finance', name: 'Finance' },
  { id: 'dept-it', name: 'IT' },
  { id: 'dept-hr', name: 'HR' },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}

// ── Demo users (14 across 6 departments) ────────────────────────────

export const users: User[] = [
  // Consulting
  { id: 'user-1', name: 'Sarah Mitchell', email: 'sarah.mitchell@company.co.uk', departmentId: 'dept-consulting', role: 'Senior Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-2', name: 'James Chen', email: 'james.chen@company.co.uk', departmentId: 'dept-consulting', role: 'Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-4', name: 'Amara Osei', email: 'amara.osei@company.co.uk', departmentId: 'dept-consulting', role: 'Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-5', name: 'David Mwangi', email: 'david.mwangi@company.co.uk', departmentId: 'dept-consulting', role: 'Junior Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Operations
  { id: 'user-3', name: 'Emily Thompson', email: 'emily.thompson@company.co.uk', departmentId: 'dept-operations', role: 'Programme Manager', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-6', name: 'Fatima Al-Hassan', email: 'fatima.alhassan@company.co.uk', departmentId: 'dept-operations', role: 'Operations Lead', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Business Development
  { id: 'user-7', name: 'Liam O\'Brien', email: 'liam.obrien@company.co.uk', departmentId: 'dept-bd', role: 'BD Manager', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-8', name: 'Priya Sharma', email: 'priya.sharma@company.co.uk', departmentId: 'dept-bd', role: 'BD Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-9', name: 'Grace Kimani', email: 'grace.kimani@company.co.uk', departmentId: 'dept-bd', role: 'BD Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Finance
  { id: 'user-10', name: 'Raj Patel', email: 'raj.patel@company.co.uk', departmentId: 'dept-finance', role: 'Financial Analyst', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-11', name: 'Nneka Chukwu', email: 'nneka.chukwu@company.co.uk', departmentId: 'dept-finance', role: 'Finance Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // IT
  { id: 'user-12', name: 'Tom Baker', email: 'tom.baker@company.co.uk', departmentId: 'dept-it', role: 'IT Manager', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // HR
  { id: 'user-13', name: 'Sofia Martinez', email: 'sofia.martinez@company.co.uk', departmentId: 'dept-hr', role: 'HR Specialist', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-14', name: 'Aisha Banda', email: 'aisha.banda@company.co.uk', departmentId: 'dept-hr', role: 'HR Coordinator', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
];

// ── Projects (External) ─────────────────────────────────────────────

export const projects: Project[] = [
  { id: 'proj-flagship', name: 'Flagship', code: 'FLAGSHIP', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-jica-gbv', name: 'JICA GBV', code: 'JICA-GBV', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-ceic', name: 'CEIC', code: 'CEIC', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-risa', name: 'RISA', code: 'RISA', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-disrupt-for-her', name: 'Disrupt_for_Her', code: 'D4H', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-orange-corners', name: 'Orange Corners', code: 'OC', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-leave', name: 'Leave / Absence', code: 'LEAVE', isActive: true, defaultBillableStatus: 'not_billable', type: 'external_project' },
  // Internal department workstreams
  { id: 'proj-internal-consulting', name: 'Consulting — Internal', code: 'INT-CON', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-consulting' },
  { id: 'proj-internal-operations', name: 'Operations — Internal', code: 'INT-OPS', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-operations' },
  { id: 'proj-internal-bd', name: 'Business Development — Internal', code: 'INT-BD', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-bd' },
  { id: 'proj-internal-finance', name: 'Finance — Internal', code: 'INT-FIN', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-finance' },
  { id: 'proj-internal-it', name: 'IT — Internal', code: 'INT-IT', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-it' },
  { id: 'proj-internal-hr', name: 'HR — Internal', code: 'INT-HR', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-hr' },
];

// ── External Project Department Access ──────────────────────────────

export const projectDepartmentAccess: ProjectDepartmentAccess[] = [
  // Flagship → Consulting, Operations, BD
  { workstreamId: 'proj-flagship', departmentId: 'dept-consulting' },
  { workstreamId: 'proj-flagship', departmentId: 'dept-operations' },
  { workstreamId: 'proj-flagship', departmentId: 'dept-bd' },
  // JICA GBV → Consulting, Operations
  { workstreamId: 'proj-jica-gbv', departmentId: 'dept-consulting' },
  { workstreamId: 'proj-jica-gbv', departmentId: 'dept-operations' },
  // CEIC → Consulting, Operations, BD
  { workstreamId: 'proj-ceic', departmentId: 'dept-consulting' },
  { workstreamId: 'proj-ceic', departmentId: 'dept-operations' },
  { workstreamId: 'proj-ceic', departmentId: 'dept-bd' },
  // RISA → Consulting, Operations
  { workstreamId: 'proj-risa', departmentId: 'dept-consulting' },
  { workstreamId: 'proj-risa', departmentId: 'dept-operations' },
  // Disrupt_for_Her → BD, Operations
  { workstreamId: 'proj-disrupt-for-her', departmentId: 'dept-bd' },
  { workstreamId: 'proj-disrupt-for-her', departmentId: 'dept-operations' },
  // Orange Corners → BD, Operations
  { workstreamId: 'proj-orange-corners', departmentId: 'dept-bd' },
  { workstreamId: 'proj-orange-corners', departmentId: 'dept-operations' },
  // Leave / Absence → All departments
  { workstreamId: 'proj-leave', departmentId: 'dept-consulting' },
  { workstreamId: 'proj-leave', departmentId: 'dept-operations' },
  { workstreamId: 'proj-leave', departmentId: 'dept-bd' },
  { workstreamId: 'proj-leave', departmentId: 'dept-finance' },
  { workstreamId: 'proj-leave', departmentId: 'dept-it' },
  { workstreamId: 'proj-leave', departmentId: 'dept-hr' },
];

// ── Standard Phases (for external projects) ─────────────────────────

export const phases: Phase[] = [
  { id: 'phase-inception', name: 'Inception' },
  { id: 'phase-recruitment', name: 'Recruitment' },
  { id: 'phase-workshops', name: 'Workshops' },
  { id: 'phase-entrepreneur-support', name: 'Entrepreneur Support' },
  { id: 'phase-growthlabs', name: 'GrowthLabs' },
  { id: 'phase-master-classes', name: 'Master Classes' },
  { id: 'phase-reporting', name: 'Reporting' },
  { id: 'phase-general-admin', name: 'General Administrative' },
  { id: 'phase-absence', name: 'Absence' },
  // ── Internal work area phases (Consulting) ──
  { id: 'phase-con-strategy', name: 'Strategy Development' },
  { id: 'phase-con-crm', name: 'Client Relationship Management' },
  { id: 'phase-con-km', name: 'Knowledge Management' },
  { id: 'phase-con-other', name: 'Other' },
  // ── Internal work area phases (Operations) ──
  { id: 'phase-ops-coordination', name: 'Programme Coordination' },
  { id: 'phase-ops-procurement', name: 'Procurement' },
  { id: 'phase-ops-logistics', name: 'Logistics' },
  { id: 'phase-ops-other', name: 'Other' },
  // ── Internal work area phases (BD) ──
  { id: 'phase-bd-proposals', name: 'Proposal Writing' },
  { id: 'phase-bd-partnerships', name: 'Partnership Development' },
  { id: 'phase-bd-research', name: 'Market Research' },
  { id: 'phase-bd-other', name: 'Other' },
  // ── Internal work area phases (Finance) ──
  { id: 'phase-fin-budgeting', name: 'Budgeting' },
  { id: 'phase-fin-reporting', name: 'Financial Reporting' },
  { id: 'phase-fin-audit', name: 'Audit Preparation' },
  { id: 'phase-fin-other', name: 'Other' },
  // ── Internal work area phases (IT) ──
  { id: 'phase-it-sysadmin', name: 'Systems Administration' },
  { id: 'phase-it-dev', name: 'Development' },
  { id: 'phase-it-support', name: 'User Support' },
  { id: 'phase-it-other', name: 'Other' },
  // ── Internal work area phases (HR) ──
  { id: 'phase-hr-recruitment', name: 'Recruitment and Onboarding' },
  { id: 'phase-hr-training', name: 'Training and Development' },
  { id: 'phase-hr-policy', name: 'Policy and Compliance' },
  { id: 'phase-hr-other', name: 'Other' },
];

// ── Internal Work Areas ─────────────────────────────────────────────

export const internalWorkAreas: InternalWorkArea[] = [
  // Consulting
  { id: 'iwa-con-strategy', name: 'Strategy Development', departmentId: 'dept-consulting', phaseId: 'phase-con-strategy' },
  { id: 'iwa-con-crm', name: 'Client Relationship Management', departmentId: 'dept-consulting', phaseId: 'phase-con-crm' },
  { id: 'iwa-con-km', name: 'Knowledge Management', departmentId: 'dept-consulting', phaseId: 'phase-con-km' },
  { id: 'iwa-con-other', name: 'Other', departmentId: 'dept-consulting', phaseId: 'phase-con-other' },
  // Operations
  { id: 'iwa-ops-coordination', name: 'Programme Coordination', departmentId: 'dept-operations', phaseId: 'phase-ops-coordination' },
  { id: 'iwa-ops-procurement', name: 'Procurement', departmentId: 'dept-operations', phaseId: 'phase-ops-procurement' },
  { id: 'iwa-ops-logistics', name: 'Logistics', departmentId: 'dept-operations', phaseId: 'phase-ops-logistics' },
  { id: 'iwa-ops-other', name: 'Other', departmentId: 'dept-operations', phaseId: 'phase-ops-other' },
  // BD
  { id: 'iwa-bd-proposals', name: 'Proposal Writing', departmentId: 'dept-bd', phaseId: 'phase-bd-proposals' },
  { id: 'iwa-bd-partnerships', name: 'Partnership Development', departmentId: 'dept-bd', phaseId: 'phase-bd-partnerships' },
  { id: 'iwa-bd-research', name: 'Market Research', departmentId: 'dept-bd', phaseId: 'phase-bd-research' },
  { id: 'iwa-bd-other', name: 'Other', departmentId: 'dept-bd', phaseId: 'phase-bd-other' },
  // Finance
  { id: 'iwa-fin-budgeting', name: 'Budgeting', departmentId: 'dept-finance', phaseId: 'phase-fin-budgeting' },
  { id: 'iwa-fin-reporting', name: 'Financial Reporting', departmentId: 'dept-finance', phaseId: 'phase-fin-reporting' },
  { id: 'iwa-fin-audit', name: 'Audit Preparation', departmentId: 'dept-finance', phaseId: 'phase-fin-audit' },
  { id: 'iwa-fin-other', name: 'Other', departmentId: 'dept-finance', phaseId: 'phase-fin-other' },
  // IT
  { id: 'iwa-it-sysadmin', name: 'Systems Administration', departmentId: 'dept-it', phaseId: 'phase-it-sysadmin' },
  { id: 'iwa-it-dev', name: 'Development', departmentId: 'dept-it', phaseId: 'phase-it-dev' },
  { id: 'iwa-it-support', name: 'User Support', departmentId: 'dept-it', phaseId: 'phase-it-support' },
  { id: 'iwa-it-other', name: 'Other', departmentId: 'dept-it', phaseId: 'phase-it-other' },
  // HR
  { id: 'iwa-hr-recruitment', name: 'Recruitment and Onboarding', departmentId: 'dept-hr', phaseId: 'phase-hr-recruitment' },
  { id: 'iwa-hr-training', name: 'Training and Development', departmentId: 'dept-hr', phaseId: 'phase-hr-training' },
  { id: 'iwa-hr-policy', name: 'Policy and Compliance', departmentId: 'dept-hr', phaseId: 'phase-hr-policy' },
  { id: 'iwa-hr-other', name: 'Other', departmentId: 'dept-hr', phaseId: 'phase-hr-other' },
];

// ── Activity types ──────────────────────────────────────────────────

export const activityTypes: ActivityType[] = [
  // ── Standard external project activities ──
  // Inception
  { id: 'act-inception-prep', name: 'Inception/kickoff preparations', phaseId: 'phase-inception' },
  { id: 'act-inception-meeting', name: 'Inception meeting/kickoff', phaseId: 'phase-inception' },
  { id: 'act-inception-report', name: 'Inception report', phaseId: 'phase-inception' },
  { id: 'act-inception-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-inception' },
  { id: 'act-inception-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-inception' },
  // Recruitment
  { id: 'act-recruitment-outreach', name: 'Outreach (potential cohort)', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-selection', name: 'Selection activities (new cohorts)', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-onboarding', name: 'Onboarding (new cohorts)', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-events', name: 'External events participation', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-recruitment' },
  // Workshops
  { id: 'act-workshop-prep', name: 'Workshop/bootcamp prep', phaseId: 'phase-workshops' },
  { id: 'act-workshop-execution', name: 'Workshop/bootcamp execution', phaseId: 'phase-workshops' },
  { id: 'act-workshop-followup', name: 'Workshop/bootcamp follow-up', phaseId: 'phase-workshops' },
  { id: 'act-workshop-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-workshops' },
  { id: 'act-workshop-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-workshops' },
  // Entrepreneur Support
  { id: 'act-es-research', name: 'Entrepreneur research & prep', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-support-aa', name: 'Entrepreneur support (A&A)', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-support-sprint', name: 'Entrepreneur support (Sprint)', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-support-other', name: 'Entrepreneur support (Other)', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-sprint-research', name: 'Sprint research & prep', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-transport', name: 'Transport to/from engagements', phaseId: 'phase-entrepreneur-support' },
  // GrowthLabs
  { id: 'act-gl-planning', name: 'GrowthLab planning', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-execution', name: 'GrowthLab execution', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-followup', name: 'GrowthLab follow-up', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-growthlabs' },
  // Master Classes
  { id: 'act-mc-planning', name: 'Master class planning', phaseId: 'phase-master-classes' },
  { id: 'act-mc-mobilization', name: 'Mentor/resource mobilisation', phaseId: 'phase-master-classes' },
  { id: 'act-mc-execution', name: 'Master class execution', phaseId: 'phase-master-classes' },
  { id: 'act-mc-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-master-classes' },
  { id: 'act-mc-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-master-classes' },
  // Reporting
  { id: 'act-rpt-followups', name: 'Entrepreneur follow-ups', phaseId: 'phase-reporting' },
  { id: 'act-rpt-data', name: 'Data collection & processing', phaseId: 'phase-reporting' },
  { id: 'act-rpt-reporting', name: 'Reporting (time, journey track, etc.)', phaseId: 'phase-reporting' },
  { id: 'act-rpt-case-study', name: 'Case study development', phaseId: 'phase-reporting' },
  // General Administrative
  { id: 'act-admin-team-meetings', name: 'Team meetings', phaseId: 'phase-general-admin' },
  { id: 'act-admin-transport', name: 'Transport to/from engagements', phaseId: 'phase-general-admin' },
  { id: 'act-admin-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-general-admin' },
  { id: 'act-admin-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-general-admin' },
  { id: 'act-admin-event', name: 'Attending an event', phaseId: 'phase-general-admin' },
  // Absence
  { id: 'act-leave-day', name: 'Leave day', phaseId: 'phase-absence' },
  { id: 'act-public-holiday', name: 'Public holiday', phaseId: 'phase-absence' },

  // ── Internal work area activities ──
  // Consulting — Strategy Development
  { id: 'act-con-strategy-planning', name: 'Planning/Preparation', phaseId: 'phase-con-strategy' },
  { id: 'act-con-strategy-execution', name: 'Execution/Delivery', phaseId: 'phase-con-strategy' },
  { id: 'act-con-strategy-review', name: 'Review/Follow-up', phaseId: 'phase-con-strategy' },
  { id: 'act-con-strategy-other', name: 'Other (specify)', phaseId: 'phase-con-strategy' },
  // Consulting — CRM
  { id: 'act-con-crm-planning', name: 'Planning/Preparation', phaseId: 'phase-con-crm' },
  { id: 'act-con-crm-execution', name: 'Execution/Delivery', phaseId: 'phase-con-crm' },
  { id: 'act-con-crm-review', name: 'Review/Follow-up', phaseId: 'phase-con-crm' },
  { id: 'act-con-crm-other', name: 'Other (specify)', phaseId: 'phase-con-crm' },
  // Consulting — KM
  { id: 'act-con-km-planning', name: 'Planning/Preparation', phaseId: 'phase-con-km' },
  { id: 'act-con-km-execution', name: 'Execution/Delivery', phaseId: 'phase-con-km' },
  { id: 'act-con-km-review', name: 'Review/Follow-up', phaseId: 'phase-con-km' },
  { id: 'act-con-km-other', name: 'Other (specify)', phaseId: 'phase-con-km' },
  // Consulting — Other
  { id: 'act-con-other-planning', name: 'Planning/Preparation', phaseId: 'phase-con-other' },
  { id: 'act-con-other-execution', name: 'Execution/Delivery', phaseId: 'phase-con-other' },
  { id: 'act-con-other-other', name: 'Other (specify)', phaseId: 'phase-con-other' },

  // Operations — Programme Coordination
  { id: 'act-ops-coord-planning', name: 'Planning/Preparation', phaseId: 'phase-ops-coordination' },
  { id: 'act-ops-coord-execution', name: 'Execution/Delivery', phaseId: 'phase-ops-coordination' },
  { id: 'act-ops-coord-review', name: 'Review/Follow-up', phaseId: 'phase-ops-coordination' },
  { id: 'act-ops-coord-other', name: 'Other (specify)', phaseId: 'phase-ops-coordination' },
  // Operations — Procurement
  { id: 'act-ops-proc-planning', name: 'Planning/Preparation', phaseId: 'phase-ops-procurement' },
  { id: 'act-ops-proc-execution', name: 'Execution/Delivery', phaseId: 'phase-ops-procurement' },
  { id: 'act-ops-proc-review', name: 'Review/Follow-up', phaseId: 'phase-ops-procurement' },
  { id: 'act-ops-proc-other', name: 'Other (specify)', phaseId: 'phase-ops-procurement' },
  // Operations — Logistics
  { id: 'act-ops-log-planning', name: 'Planning/Preparation', phaseId: 'phase-ops-logistics' },
  { id: 'act-ops-log-execution', name: 'Execution/Delivery', phaseId: 'phase-ops-logistics' },
  { id: 'act-ops-log-review', name: 'Review/Follow-up', phaseId: 'phase-ops-logistics' },
  { id: 'act-ops-log-other', name: 'Other (specify)', phaseId: 'phase-ops-logistics' },
  // Operations — Other
  { id: 'act-ops-other-planning', name: 'Planning/Preparation', phaseId: 'phase-ops-other' },
  { id: 'act-ops-other-execution', name: 'Execution/Delivery', phaseId: 'phase-ops-other' },
  { id: 'act-ops-other-other', name: 'Other (specify)', phaseId: 'phase-ops-other' },

  // BD — Proposal Writing
  { id: 'act-bd-prop-planning', name: 'Planning/Preparation', phaseId: 'phase-bd-proposals' },
  { id: 'act-bd-prop-execution', name: 'Execution/Delivery', phaseId: 'phase-bd-proposals' },
  { id: 'act-bd-prop-review', name: 'Review/Follow-up', phaseId: 'phase-bd-proposals' },
  { id: 'act-bd-prop-other', name: 'Other (specify)', phaseId: 'phase-bd-proposals' },
  // BD — Partnership Development
  { id: 'act-bd-part-planning', name: 'Planning/Preparation', phaseId: 'phase-bd-partnerships' },
  { id: 'act-bd-part-execution', name: 'Execution/Delivery', phaseId: 'phase-bd-partnerships' },
  { id: 'act-bd-part-review', name: 'Review/Follow-up', phaseId: 'phase-bd-partnerships' },
  { id: 'act-bd-part-other', name: 'Other (specify)', phaseId: 'phase-bd-partnerships' },
  // BD — Market Research
  { id: 'act-bd-res-planning', name: 'Planning/Preparation', phaseId: 'phase-bd-research' },
  { id: 'act-bd-res-execution', name: 'Execution/Delivery', phaseId: 'phase-bd-research' },
  { id: 'act-bd-res-review', name: 'Review/Follow-up', phaseId: 'phase-bd-research' },
  { id: 'act-bd-res-other', name: 'Other (specify)', phaseId: 'phase-bd-research' },
  // BD — Other
  { id: 'act-bd-other-planning', name: 'Planning/Preparation', phaseId: 'phase-bd-other' },
  { id: 'act-bd-other-execution', name: 'Execution/Delivery', phaseId: 'phase-bd-other' },
  { id: 'act-bd-other-other', name: 'Other (specify)', phaseId: 'phase-bd-other' },

  // Finance — Budgeting
  { id: 'act-fin-budget-planning', name: 'Planning/Preparation', phaseId: 'phase-fin-budgeting' },
  { id: 'act-fin-budget-execution', name: 'Execution/Delivery', phaseId: 'phase-fin-budgeting' },
  { id: 'act-fin-budget-review', name: 'Review/Follow-up', phaseId: 'phase-fin-budgeting' },
  { id: 'act-fin-budget-other', name: 'Other (specify)', phaseId: 'phase-fin-budgeting' },
  // Finance — Financial Reporting
  { id: 'act-fin-rpt-planning', name: 'Planning/Preparation', phaseId: 'phase-fin-reporting' },
  { id: 'act-fin-rpt-execution', name: 'Execution/Delivery', phaseId: 'phase-fin-reporting' },
  { id: 'act-fin-rpt-review', name: 'Review/Follow-up', phaseId: 'phase-fin-reporting' },
  { id: 'act-fin-rpt-other', name: 'Other (specify)', phaseId: 'phase-fin-reporting' },
  // Finance — Audit Preparation
  { id: 'act-fin-audit-planning', name: 'Planning/Preparation', phaseId: 'phase-fin-audit' },
  { id: 'act-fin-audit-execution', name: 'Execution/Delivery', phaseId: 'phase-fin-audit' },
  { id: 'act-fin-audit-review', name: 'Review/Follow-up', phaseId: 'phase-fin-audit' },
  { id: 'act-fin-audit-other', name: 'Other (specify)', phaseId: 'phase-fin-audit' },
  // Finance — Other
  { id: 'act-fin-other-planning', name: 'Planning/Preparation', phaseId: 'phase-fin-other' },
  { id: 'act-fin-other-execution', name: 'Execution/Delivery', phaseId: 'phase-fin-other' },
  { id: 'act-fin-other-other', name: 'Other (specify)', phaseId: 'phase-fin-other' },

  // IT — Systems Administration
  { id: 'act-it-sys-planning', name: 'Planning/Preparation', phaseId: 'phase-it-sysadmin' },
  { id: 'act-it-sys-execution', name: 'Execution/Delivery', phaseId: 'phase-it-sysadmin' },
  { id: 'act-it-sys-review', name: 'Review/Follow-up', phaseId: 'phase-it-sysadmin' },
  { id: 'act-it-sys-other', name: 'Other (specify)', phaseId: 'phase-it-sysadmin' },
  // IT — Development
  { id: 'act-it-dev-planning', name: 'Planning/Preparation', phaseId: 'phase-it-dev' },
  { id: 'act-it-dev-execution', name: 'Execution/Delivery', phaseId: 'phase-it-dev' },
  { id: 'act-it-dev-review', name: 'Review/Follow-up', phaseId: 'phase-it-dev' },
  { id: 'act-it-dev-other', name: 'Other (specify)', phaseId: 'phase-it-dev' },
  // IT — User Support
  { id: 'act-it-sup-planning', name: 'Planning/Preparation', phaseId: 'phase-it-support' },
  { id: 'act-it-sup-execution', name: 'Execution/Delivery', phaseId: 'phase-it-support' },
  { id: 'act-it-sup-review', name: 'Review/Follow-up', phaseId: 'phase-it-support' },
  { id: 'act-it-sup-other', name: 'Other (specify)', phaseId: 'phase-it-support' },
  // IT — Other
  { id: 'act-it-other-planning', name: 'Planning/Preparation', phaseId: 'phase-it-other' },
  { id: 'act-it-other-execution', name: 'Execution/Delivery', phaseId: 'phase-it-other' },
  { id: 'act-it-other-other', name: 'Other (specify)', phaseId: 'phase-it-other' },

  // HR — Recruitment and Onboarding
  { id: 'act-hr-rec-planning', name: 'Planning/Preparation', phaseId: 'phase-hr-recruitment' },
  { id: 'act-hr-rec-execution', name: 'Execution/Delivery', phaseId: 'phase-hr-recruitment' },
  { id: 'act-hr-rec-review', name: 'Review/Follow-up', phaseId: 'phase-hr-recruitment' },
  { id: 'act-hr-rec-other', name: 'Other (specify)', phaseId: 'phase-hr-recruitment' },
  // HR — Training and Development
  { id: 'act-hr-train-planning', name: 'Planning/Preparation', phaseId: 'phase-hr-training' },
  { id: 'act-hr-train-execution', name: 'Execution/Delivery', phaseId: 'phase-hr-training' },
  { id: 'act-hr-train-review', name: 'Review/Follow-up', phaseId: 'phase-hr-training' },
  { id: 'act-hr-train-other', name: 'Other (specify)', phaseId: 'phase-hr-training' },
  // HR — Policy and Compliance
  { id: 'act-hr-pol-planning', name: 'Planning/Preparation', phaseId: 'phase-hr-policy' },
  { id: 'act-hr-pol-execution', name: 'Execution/Delivery', phaseId: 'phase-hr-policy' },
  { id: 'act-hr-pol-review', name: 'Review/Follow-up', phaseId: 'phase-hr-policy' },
  { id: 'act-hr-pol-other', name: 'Other (specify)', phaseId: 'phase-hr-policy' },
  // HR — Other
  { id: 'act-hr-other-planning', name: 'Planning/Preparation', phaseId: 'phase-hr-other' },
  { id: 'act-hr-other-execution', name: 'Execution/Delivery', phaseId: 'phase-hr-other' },
  { id: 'act-hr-other-other', name: 'Other (specify)', phaseId: 'phase-hr-other' },
];

export function getActivitiesForPhase(phaseId: string): ActivityType[] {
  return activityTypes.filter(a => a.phaseId === phaseId);
}

// ── Standard phase IDs (for external projects) ─────────────────────

const standardPhaseIds = new Set([
  'phase-inception', 'phase-recruitment', 'phase-workshops',
  'phase-entrepreneur-support', 'phase-growthlabs', 'phase-master-classes',
  'phase-reporting', 'phase-general-admin', 'phase-absence',
]);

/** Get phases appropriate for a given project */
export function getPhasesForProject(projectId: string): Phase[] {
  const project = projects.find(p => p.id === projectId);
  if (!project) return [];

  if (project.type === 'internal_department' && project.owningDepartmentId) {
    // Return only the internal work area phases for this department
    const deptWorkAreas = internalWorkAreas.filter(
      wa => wa.departmentId === project.owningDepartmentId
    );
    return deptWorkAreas
      .map(wa => phases.find(p => p.id === wa.phaseId))
      .filter((p): p is Phase => !!p);
  }

  // External project or leave: return standard phases
  return phases.filter(p => standardPhaseIds.has(p.id));
}

/** Get available workstreams for a department */
export function getAvailableWorkstreams(departmentId: string): Project[] {
  // 1. Internal workstreams owned by this department
  const internal = projects.filter(
    p => p.isActive && p.type === 'internal_department' && p.owningDepartmentId === departmentId
  );

  // 2. External projects accessible by this department
  const accessibleIds = new Set(
    projectDepartmentAccess
      .filter(a => a.departmentId === departmentId)
      .map(a => a.workstreamId)
  );
  const external = projects.filter(
    p => p.isActive && p.type === 'external_project' && p.id !== 'proj-leave' && accessibleIds.has(p.id)
  );

  // 3. Leave is always available
  const leave = projects.filter(p => p.id === 'proj-leave');

  return [...internal, ...external, ...leave];
}

/** Get last N distinct workstreams used by a user, ordered by most recent */
export function getRecentWorkstreams(userId: string, entries: TimeEntry[], limit = 5): Project[] {
  const sorted = [...entries]
    .filter(e => e.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const seen = new Set<string>();
  const result: Project[] = [];
  for (const entry of sorted) {
    if (seen.has(entry.projectId)) continue;
    seen.add(entry.projectId);
    const project = projects.find(p => p.id === entry.projectId);
    if (project) result.push(project);
    if (result.length >= limit) break;
  }
  return result;
}

/** Get workstreams grouped by category for dropdown */
export function getGroupedWorkstreams(departmentId: string, userId: string, entries: TimeEntry[]): GroupedWorkstreams {
  const internal = projects.filter(
    p => p.isActive && p.type === 'internal_department' && p.owningDepartmentId === departmentId
  );

  const accessibleIds = new Set(
    projectDepartmentAccess
      .filter(a => a.departmentId === departmentId)
      .map(a => a.workstreamId)
  );
  const external = projects.filter(
    p => p.isActive && p.type === 'external_project' && p.id !== 'proj-leave' && accessibleIds.has(p.id)
  );

  const leave = projects.filter(p => p.id === 'proj-leave');
  const recent = getRecentWorkstreams(userId, entries);

  return { recent, external, internal, leave };
}

// ── Date helpers ────────────────────────────────────────────────────

export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return toLocalDateString(d);
}

export function getWeekDate(weekStart: string, dayOffset: number): string {
  const d = parseLocalDate(weekStart);
  d.setDate(d.getDate() + dayOffset);
  return toLocalDateString(d);
}

// ── Lookup helpers ──────────────────────────────────────────────────

export function getProjectById(projectId: string): Project | undefined {
  return projects.find(p => p.id === projectId);
}

export function getPhaseById(phaseId: string): Phase | undefined {
  return phases.find(p => p.id === phaseId);
}

export function getActivityTypeById(activityTypeId: string): ActivityType | undefined {
  return activityTypes.find(a => a.id === activityTypeId);
}

export function getEntryWithDetails(entry: TimeEntry) {
  const project = getProjectById(entry.projectId);
  const phase = getPhaseById(entry.phaseId);
  const activityType = getActivityTypeById(entry.activityTypeId);
  if (!project || !phase || !activityType) return null;
  return { ...entry, project, phase, activityType };
}

// ── Deterministic seed data generator ───────────────────────────────

const currentWeekStart = getWeekStart();

// Per-user project affinity: maps user index to preferred project ids
const userProjectMap: Record<number, string[]> = {
  0: ['proj-flagship', 'proj-ceic', 'proj-risa'],           // Sarah - Consulting
  1: ['proj-flagship', 'proj-jica-gbv', 'proj-risa'],       // James - Consulting
  2: ['proj-ceic', 'proj-risa', 'proj-flagship'],            // Amara - Consulting
  3: ['proj-jica-gbv', 'proj-ceic', 'proj-flagship'],        // David - Consulting
  4: ['proj-flagship', 'proj-jica-gbv', 'proj-ceic', 'proj-risa'], // Emily - Ops/admin
  5: ['proj-risa', 'proj-flagship', 'proj-ceic'],            // Fatima - Ops/admin
  6: ['proj-orange-corners', 'proj-disrupt-for-her', 'proj-flagship'], // Liam - BD
  7: ['proj-disrupt-for-her', 'proj-orange-corners', 'proj-ceic'],     // Priya - BD
  8: ['proj-orange-corners', 'proj-disrupt-for-her', 'proj-jica-gbv'], // Grace - BD
  9: ['proj-flagship', 'proj-risa', 'proj-ceic'],            // Raj - Finance
  10: ['proj-jica-gbv', 'proj-flagship', 'proj-risa'],       // Nneka - Finance
  11: ['proj-flagship', 'proj-ceic', 'proj-risa'],           // Tom - IT/admin
  12: ['proj-flagship', 'proj-jica-gbv'],                     // Sofia - HR
  13: ['proj-ceic', 'proj-flagship'],                         // Aisha - HR
};

// Phase+activity combos per project for variety
const projectPhaseActivity: Record<string, Array<{ phaseId: string; activityTypeId: string; desc: string; deliverable: DeliverableType }>> = {
  'proj-flagship': [
    { phaseId: 'phase-inception', activityTypeId: 'act-inception-meeting', desc: 'Stakeholder alignment session', deliverable: 'workshop' },
    { phaseId: 'phase-inception', activityTypeId: 'act-inception-report', desc: 'Drafted inception report', deliverable: 'reporting' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-workshop-execution', desc: 'Business model canvas workshop', deliverable: 'workshop' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-support-aa', desc: 'Advisory sessions with entrepreneurs', deliverable: 'training' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-data', desc: 'Progress tracking data entry', deliverable: 'reporting' },
    { phaseId: 'phase-general-admin', activityTypeId: 'act-admin-team-meetings', desc: 'Team sync', deliverable: 'other' },
  ],
  'proj-jica-gbv': [
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruitment-outreach', desc: 'Outreach to potential cohort members', deliverable: 'other' },
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruitment-selection', desc: 'Cohort selection interviews', deliverable: 'other' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-workshop-prep', desc: 'Workshop content preparation', deliverable: 'workshop' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-reporting', desc: 'Quarterly report compilation', deliverable: 'reporting' },
    { phaseId: 'phase-general-admin', activityTypeId: 'act-admin-team-meetings', desc: 'Weekly planning call', deliverable: 'other' },
  ],
  'proj-ceic': [
    { phaseId: 'phase-workshops', activityTypeId: 'act-workshop-execution', desc: 'Financial literacy bootcamp', deliverable: 'workshop' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-workshop-followup', desc: 'Post-workshop follow-up calls', deliverable: 'reporting' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-support-sprint', desc: 'Sprint coaching sessions', deliverable: 'training' },
    { phaseId: 'phase-growthlabs', activityTypeId: 'act-gl-execution', desc: 'GrowthLab delivery', deliverable: 'workshop' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-case-study', desc: 'Case study development', deliverable: 'case_study' },
  ],
  'proj-risa': [
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-support-aa', desc: 'One-on-one advisory', deliverable: 'training' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-research', desc: 'Entrepreneur research', deliverable: 'reporting' },
    { phaseId: 'phase-master-classes', activityTypeId: 'act-mc-execution', desc: 'Master class delivery', deliverable: 'training' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-data', desc: 'Data collection and processing', deliverable: 'reporting' },
  ],
  'proj-disrupt-for-her': [
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruitment-outreach', desc: 'Community outreach for D4H', deliverable: 'event' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-workshop-execution', desc: 'D4H bootcamp delivery', deliverable: 'workshop' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-support-other', desc: 'Mentorship coordination', deliverable: 'training' },
    { phaseId: 'phase-growthlabs', activityTypeId: 'act-gl-planning', desc: 'GrowthLab planning for D4H', deliverable: 'other' },
  ],
  'proj-orange-corners': [
    { phaseId: 'phase-inception', activityTypeId: 'act-inception-client-meeting', desc: 'Client alignment meeting', deliverable: 'other' },
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruitment-events', desc: 'Networking event for OC', deliverable: 'event' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-workshop-prep', desc: 'Workshop preparation', deliverable: 'workshop' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-support-sprint', desc: 'Sprint sessions', deliverable: 'training' },
  ],
  'proj-leave': [
    { phaseId: 'phase-absence', activityTypeId: 'act-leave-day', desc: 'Leave day', deliverable: 'other' },
    { phaseId: 'phase-absence', activityTypeId: 'act-public-holiday', desc: 'Public holiday', deliverable: 'other' },
  ],
};

// Simple deterministic hash
function seedVal(a: number, b: number, c: number): number {
  return ((a * 7 + b * 13 + c * 31) % 97);
}

function generateTimeEntries(): TimeEntry[] {
  const entries: TimeEntry[] = [];
  let entryId = 1;

  // 6 weeks: offsets -5 to 0 (current week)
  for (let weekOffset = -5; weekOffset <= 0; weekOffset++) {
    const wsDate = parseLocalDate(currentWeekStart);
    wsDate.setDate(wsDate.getDate() + weekOffset * 7);
    const ws = toLocalDateString(wsDate);

    for (let u = 0; u < users.length; u++) {
      const user = users[u];
      const sv = seedVal(u, weekOffset + 5, 0);

      // Some users have incomplete weeks (low hours)
      const isIncompleteWeek = (u === 3 && weekOffset === -2) || (u === 8 && weekOffset === -4) || (u === 13 && weekOffset === -1);

      // Leave days: user-10 week -3 Mon, user-13 week -1 Fri
      const isLeaveWeek = (u === 9 && weekOffset === -3) || (u === 12 && weekOffset === -1);

      const userProjects = userProjectMap[u] || ['proj-flagship'];
      const targetHours = isIncompleteWeek ? 20 + (sv % 8) : 36 + (sv % 6); // 20-27 or 36-41
      let remainingMinutes = targetHours * 60;

      // Distribute across 5 weekdays
      const dayEntries: number[] = [0, 1, 2, 3, 4]; // Mon-Fri

      // Add a leave entry if applicable
      if (isLeaveWeek) {
        const leaveDay = u === 9 ? 0 : 4;
        entries.push({
          id: `entry-${entryId++}`,
          userId: user.id,
          projectId: 'proj-leave',
          phaseId: 'phase-absence',
          activityTypeId: 'act-leave-day',
          taskDescription: 'Leave day',
          deliverableType: 'other',
          date: getWeekDate(ws, leaveDay),
          hours: 8,
          minutes: 0,
          billableStatus: 'not_billable',
          createdAt: getWeekDate(ws, leaveDay) + 'T09:00:00.000Z',
          updatedAt: getWeekDate(ws, leaveDay) + 'T09:00:00.000Z',
        });
        remainingMinutes -= 480;
        dayEntries.splice(dayEntries.indexOf(leaveDay), 1);
      }

      // Generate 3-6 entries per week across remaining days
      const numEntries = isIncompleteWeek ? 3 : 4 + (sv % 3); // 3 or 4-6
      const minutePerEntry = Math.floor(remainingMinutes / numEntries);

      for (let e = 0; e < numEntries; e++) {
        const day = dayEntries[e % dayEntries.length];
        const projIdx = e % userProjects.length;
        const projId = userProjects[projIdx];
        const activities = projectPhaseActivity[projId] || projectPhaseActivity['proj-flagship'];
        const actIdx = seedVal(u, weekOffset + 5, e) % activities.length;
        const act = activities[actIdx];

        // Vary duration: base from division, adjust with seed
        let mins = minutePerEntry + (seedVal(u, e, weekOffset + 5) % 4 - 2) * 15;
        mins = Math.max(60, Math.min(mins, 480)); // clamp 1h-8h
        mins = Math.round(mins / 15) * 15; // snap to 15min

        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;

        // Billable status: mostly follows project default, with some variance
        let billableStatus: BillableStatus = projects.find(p => p.id === projId)?.defaultBillableStatus || 'billable';
        const bv = seedVal(u, e, weekOffset + 10);
        if (billableStatus === 'billable' && bv < 15) billableStatus = 'maybe_billable';
        if (billableStatus === 'billable' && bv >= 15 && bv < 20) billableStatus = 'not_billable';

        // Backdated entries: ~8-10 entries created 3+ days after the date
        const entryDate = getWeekDate(ws, day);
        const isBackdated = (entryId % 19 === 0) && weekOffset < -1;
        const createdDate = isBackdated
          ? getWeekDate(ws, day + 4) + 'T14:30:00.000Z'
          : entryDate + 'T' + String(8 + (sv % 3)).padStart(2, '0') + ':00:00.000Z';

        entries.push({
          id: `entry-${entryId++}`,
          userId: user.id,
          projectId: projId,
          phaseId: act.phaseId,
          activityTypeId: act.activityTypeId,
          taskDescription: act.desc,
          deliverableType: act.deliverable,
          date: entryDate,
          hours,
          minutes,
          billableStatus,
          createdAt: createdDate,
          updatedAt: createdDate,
        });
      }
    }
  }

  return entries;
}

export const timeEntries: TimeEntry[] = generateTimeEntries();

// ── Week statuses (~60% submitted for past weeks) ──────────────────

function generateWeekStatuses(): WeekStatus[] {
  const statuses: WeekStatus[] = [];

  for (let weekOffset = -5; weekOffset <= 0; weekOffset++) {
    const wsDate = parseLocalDate(currentWeekStart);
    wsDate.setDate(wsDate.getDate() + weekOffset * 7);
    const ws = toLocalDateString(wsDate);

    if (weekOffset === 0) continue; // Current week: no one submitted

    for (let u = 0; u < users.length; u++) {
      const submitted = seedVal(u, weekOffset + 5, 42) > 38; // ~60% submit
      if (submitted) {
        statuses.push({
          userId: users[u].id,
          weekStartDate: ws,
          isSubmitted: true,
          submittedAt: getWeekDate(ws, 5) + 'T17:00:00.000Z',
          isLocked: false,
        });
      }
    }
  }

  return statuses;
}

export const weekStatuses: WeekStatus[] = generateWeekStatuses();
