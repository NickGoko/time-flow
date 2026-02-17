import { User, Project, Phase, ActivityType, TimeEntry, WeekStatus, BillableStatus, DeliverableType, WEEKLY_EXPECTED_HOURS, Department, ProjectDepartmentAccess, InternalWorkArea, GroupedWorkstreams, TimeEntryWithDetails } from '@/types';

// ── Departments (8) ─────────────────────────────────────────────────

export const departments: Department[] = [
  { id: 'dept-consulting', name: 'Project Delivery (Impact)' },
  { id: 'dept-operations', name: 'Operations' },
  { id: 'dept-bd', name: 'Business Development' },
  { id: 'dept-finance', name: 'Finance, Legal and Administration' },
  { id: 'dept-it', name: 'IT, AI and Productivity' },
  { id: 'dept-hr', name: 'Human Resources' },
  { id: 'dept-comms', name: 'Communications' },
  { id: 'dept-mel', name: 'Data, Insights and Learning (MEL)' },
];

export function getDepartmentById(id: string): Department | undefined {
  return departments.find(d => d.id === id);
}

// ── Demo users (18 across 8 departments) ────────────────────────────

export const users: User[] = [
  // Project Delivery (Impact)
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
  // Finance, Legal and Administration
  { id: 'user-10', name: 'Raj Patel', email: 'raj.patel@company.co.uk', departmentId: 'dept-finance', role: 'Financial Analyst', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-11', name: 'Nneka Chukwu', email: 'nneka.chukwu@company.co.uk', departmentId: 'dept-finance', role: 'Finance Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // IT, AI and Productivity
  { id: 'user-12', name: 'Tom Baker', email: 'tom.baker@company.co.uk', departmentId: 'dept-it', role: 'IT Manager', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Human Resources
  { id: 'user-13', name: 'Sofia Martinez', email: 'sofia.martinez@company.co.uk', departmentId: 'dept-hr', role: 'HR Specialist', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-14', name: 'Aisha Banda', email: 'aisha.banda@company.co.uk', departmentId: 'dept-hr', role: 'HR Coordinator', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Communications
  { id: 'user-15', name: 'Zara Ndlovu', email: 'zara.ndlovu@company.co.uk', departmentId: 'dept-comms', role: 'Communications Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-16', name: 'Marcus Odhiambo', email: 'marcus.odhiambo@company.co.uk', departmentId: 'dept-comms', role: 'Content Specialist', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Data, Insights and Learning (MEL)
  { id: 'user-17', name: 'Chioma Eze', email: 'chioma.eze@company.co.uk', departmentId: 'dept-mel', role: 'MEL Lead', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-18', name: 'Daniel Karanja', email: 'daniel.karanja@company.co.uk', departmentId: 'dept-mel', role: 'Data Analyst', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
];

// ── Projects ────────────────────────────────────────────────────────

export const projects: Project[] = [
  // External projects
  { id: 'proj-flagship', name: 'Flagship', code: 'FLAGSHIP', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-jica-gbv', name: 'JICA GBV', code: 'JICA-GBV', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-ceic', name: 'CEIC', code: 'CEIC', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-risa', name: 'RISA', code: 'RISA', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-disrupt-for-her', name: 'Disrupt_for_Her', code: 'D4H', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-orange-corners', name: 'Orange Corners', code: 'OC', isActive: true, defaultBillableStatus: 'billable', type: 'external_project' },
  { id: 'proj-leave', name: 'Leave / Absence', code: 'LEAVE', isActive: true, defaultBillableStatus: 'not_billable', type: 'external_project' },
  // Internal department workstreams (6 — no Consulting/Operations internal)
  { id: 'proj-internal-finance', name: 'Finance, Legal and Administration', code: 'INT-FIN', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-finance' },
  { id: 'proj-internal-hr', name: 'Human Resources', code: 'INT-HR', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-hr' },
  { id: 'proj-internal-comms', name: 'Communications', code: 'INT-COM', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-comms' },
  { id: 'proj-internal-mel', name: 'Data, Insights and Learning (MEL)', code: 'INT-MEL', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-mel' },
  { id: 'proj-internal-bd', name: 'Business Development', code: 'INT-BD', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-bd' },
  { id: 'proj-internal-it', name: 'IT, AI and Productivity', code: 'INT-IT', isActive: true, defaultBillableStatus: 'not_billable', type: 'internal_department', owningDepartmentId: 'dept-it' },
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
  { workstreamId: 'proj-leave', departmentId: 'dept-comms' },
  { workstreamId: 'proj-leave', departmentId: 'dept-mel' },
];

// ══════════════════════════════════════════════════════════════════════
// TAXONOMY — data-driven generation of phases, work areas, activities
// ══════════════════════════════════════════════════════════════════════

// ── External project phases + activity types (Section 1 of taxonomy)

interface PhaseDef { id: string; name: string; activities: Array<{ id: string; name: string }> }

const externalPhaseDefs: PhaseDef[] = [
  {
    id: 'phase-inception', name: 'Inception',
    activities: [
      { id: 'act-inception-prep', name: 'Kickoff preparation' },
      { id: 'act-inception-meeting', name: 'Kickoff meeting' },
      { id: 'act-inception-report', name: 'Inception report drafting' },
      { id: 'act-inception-client', name: 'Client meeting' },
      { id: 'act-inception-partner', name: 'Partner meeting' },
      { id: 'act-inception-workplan', name: 'Workplan finalisation' },
      { id: 'act-inception-stakeholder', name: 'Stakeholder mapping' },
      { id: 'act-inception-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-recruitment', name: 'Recruitment',
    activities: [
      { id: 'act-recruit-outreach', name: 'Outreach' },
      { id: 'act-recruit-screening', name: 'Candidate screening' },
      { id: 'act-recruit-panel', name: 'Selection panel prep' },
      { id: 'act-recruit-interviews', name: 'Interviews/selection' },
      { id: 'act-recruit-onboarding', name: 'Onboarding' },
      { id: 'act-recruit-events', name: 'External event participation' },
      { id: 'act-recruit-client', name: 'Client meeting' },
      { id: 'act-recruit-partner', name: 'Partner meeting' },
      { id: 'act-recruit-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-workshops', name: 'Workshops / bootcamps',
    activities: [
      { id: 'act-ws-curriculum', name: 'Curriculum design' },
      { id: 'act-ws-speakers', name: 'Speaker sourcing' },
      { id: 'act-ws-logistics', name: 'Logistics planning' },
      { id: 'act-ws-delivery', name: 'Workshop delivery' },
      { id: 'act-ws-followup', name: 'Attendance follow-up' },
      { id: 'act-ws-evaluation', name: 'Post-workshop evaluation' },
      { id: 'act-ws-client', name: 'Client meeting' },
      { id: 'act-ws-partner', name: 'Partner meeting' },
      { id: 'act-ws-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-entrepreneur-support', name: 'Entrepreneur support',
    activities: [
      { id: 'act-es-prep', name: '1:1 prep' },
      { id: 'act-es-session', name: '1:1 support session' },
      { id: 'act-es-sprint', name: 'Sprint support' },
      { id: 'act-es-research', name: 'Market research' },
      { id: 'act-es-diagnostics', name: 'Business diagnostics' },
      { id: 'act-es-followups', name: 'Follow-ups' },
      { id: 'act-es-transport', name: 'Transport' },
      { id: 'act-es-meeting', name: 'Client/partner meeting' },
      { id: 'act-es-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-growthlabs', name: 'Growthlabs',
    activities: [
      { id: 'act-gl-planning', name: 'Planning' },
      { id: 'act-gl-coordination', name: 'Participant coordination' },
      { id: 'act-gl-facilitation', name: 'Facilitation' },
      { id: 'act-gl-followup', name: 'Follow-up' },
      { id: 'act-gl-outcomes', name: 'Outcome capture' },
      { id: 'act-gl-partner', name: 'Partner meeting' },
      { id: 'act-gl-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-master-classes', name: 'Master classes',
    activities: [
      { id: 'act-mc-planning', name: 'Planning' },
      { id: 'act-mc-mobilisation', name: 'Mentor/resource mobilisation' },
      { id: 'act-mc-delivery', name: 'Delivery' },
      { id: 'act-mc-followup', name: 'Learner follow-up' },
      { id: 'act-mc-meeting', name: 'Partner/client meeting' },
      { id: 'act-mc-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-reporting', name: 'Reporting',
    activities: [
      { id: 'act-rpt-collection', name: 'Data collection' },
      { id: 'act-rpt-cleaning', name: 'Data cleaning' },
      { id: 'act-rpt-narrative', name: 'Narrative drafting' },
      { id: 'act-rpt-donor', name: 'Donor reporting' },
      { id: 'act-rpt-casestudy', name: 'Case study development' },
      { id: 'act-rpt-review', name: 'Internal review' },
      { id: 'act-rpt-submission', name: 'Submission' },
      { id: 'act-rpt-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-general-admin', name: 'General administrative',
    activities: [
      { id: 'act-admin-team', name: 'Team meeting' },
      { id: 'act-admin-coordination', name: 'Internal coordination' },
      { id: 'act-admin-travel', name: 'Travel/logistics' },
      { id: 'act-admin-event', name: 'Event attendance' },
      { id: 'act-admin-meeting', name: 'Client/partner meeting' },
      { id: 'act-admin-filing', name: 'Filing/documentation' },
      { id: 'act-admin-other', name: 'Other (specify)' },
    ],
  },
  {
    id: 'phase-absence', name: 'Absence',
    activities: [
      { id: 'act-leave-day', name: 'Leave day' },
      { id: 'act-public-holiday', name: 'Public holiday' },
    ],
  },
];

// ── Internal department taxonomy (Sections 2-7)

interface InternalDeptDef {
  deptId: string;
  projId: string;
  prefix: string; // short prefix for IDs
  workAreas: Array<{ name: string; activities: string[] }>;
}

const internalDeptDefs: InternalDeptDef[] = [
  {
    deptId: 'dept-finance', projId: 'proj-internal-finance', prefix: 'fin',
    workAreas: [
      { name: 'Management accounts', activities: ['GL review', 'Journals & accruals', 'Cost centre review', 'Variance analysis', 'Management pack drafting', 'Review meeting', 'Other (specify)'] },
      { name: 'Cashflow reports', activities: ['Bank position update', 'Cashflow forecast update', 'Payables scheduling', 'Receivables follow-up', 'Treasury review', 'Other (specify)'] },
      { name: 'Statutory returns (KE/HQ + subsidiaries)', activities: ['Tax computations', 'Filing preparation', 'Payment processing', 'Statutory reconciliations', 'Queries & follow-ups', 'Other (specify)'] },
      { name: 'Bookkeeping (general & projects)', activities: ['Posting transactions', 'Coding review', 'Supporting docs follow-up', 'Expense verification', 'Project cost tagging', 'Other (specify)'] },
      { name: 'Bank reconciliations', activities: ['Statement download', 'Matching & clearing', 'Exception investigation', 'Adjustments/journals', 'Sign-off', 'Other (specify)'] },
      { name: 'Risk assessment', activities: ['Risk register update', 'Controls testing', 'Incident review', 'Mitigation planning', 'Reporting', 'Other (specify)'] },
      { name: 'Audit (external/internal)', activities: ['PBC preparation', 'Schedule preparation', 'Auditor support', 'Query responses', 'Evidence collation', 'Close-out actions', 'Other (specify)'] },
      { name: 'Policies (training/enforcement/review)', activities: ['Policy drafting', 'Stakeholder review', 'Training session delivery', 'Compliance follow-up', 'Updates/versioning', 'Other (specify)'] },
      { name: 'Internal project audit / compliance', activities: ['Spot checks', 'Document review', 'Issue log', 'Remediation follow-up', 'Reporting', 'Other (specify)'] },
    ],
  },
  {
    deptId: 'dept-hr', projId: 'proj-internal-hr', prefix: 'hr',
    workAreas: [
      { name: 'Staff welfare checks/events', activities: ['Check-in calls', 'Welfare assessment', 'Event planning', 'Event delivery', 'Feedback capture', 'Other (specify)'] },
      { name: 'L&D progress management', activities: ['Training needs assessment', 'Scheduling', 'Tracking completion', 'Vendor coordination', 'Learning report', 'Other (specify)'] },
      { name: 'HR policy & handbook review', activities: ['Policy drafting', 'Review cycle', 'Stakeholder consultation', 'Finalisation', 'Communication rollout', 'Other (specify)'] },
      { name: 'Culture & engagement', activities: ['Pulse survey', 'Engagement initiatives', 'Facilitation', 'Issue resolution', 'Reporting', 'Other (specify)'] },
      { name: 'Payroll management', activities: ['Payroll inputs collection', 'Review & approvals', 'Payroll processing support', 'Deductions/reconciliations', 'Payslip distribution', 'Other (specify)'] },
      { name: 'Performance management', activities: ['Goal-setting cycle support', 'Check-in reminders', 'Review facilitation', 'Documentation', 'Performance improvement support', 'Other (specify)'] },
      { name: 'Leave & absenteeism', activities: ['Leave approvals support', 'Leave balance audit', 'Absenteeism follow-up', 'Reporting', 'Other (specify)'] },
      { name: 'Onboarding / offboarding', activities: ['Offer & contract admin', 'Onboarding checklist', 'Orientation', 'Access provisioning coordination', 'Exit process coordination', 'Other (specify)'] },
      { name: 'Probation / retention / attrition', activities: ['Probation check-ins', 'Retention actions', 'Exit interviews', 'Data capture', 'Reporting', 'Other (specify)'] },
      { name: 'Appraisals', activities: ['Appraisal scheduling', 'Evidence gathering', 'Panel support', 'Results communication', 'Filing', 'Other (specify)'] },
    ],
  },
  {
    deptId: 'dept-comms', projId: 'proj-internal-comms', prefix: 'comms',
    workAreas: [
      { name: 'Social media posts & engagement', activities: ['Content planning', 'Copywriting', 'Design brief', 'Publishing', 'Community management', 'Performance review', 'Other (specify)'] },
      { name: 'Online traffic / website updates', activities: ['Website edits', 'SEO updates', 'Analytics review', 'Landing page build', 'Uploads & publishing', 'Other (specify)'] },
      { name: 'Media engagements / journalist engagements', activities: ['Media list update', 'Pitching', 'Interview coordination', 'Press release drafting', 'Follow-ups', 'Other (specify)'] },
      { name: 'Speaking engagements', activities: ['Speaker prep', 'Slide support', 'Event coordination', 'Post-event comms', 'Other (specify)'] },
      { name: 'Knowledge/expert pieces / learning-impact pieces', activities: ['Topic research', 'Interviews', 'Draft writing', 'Editing', 'Publishing', 'Other (specify)'] },
      { name: 'Storytelling pieces / case narratives', activities: ['Story sourcing', 'Field interviews', 'Drafting', 'Editing', 'Approval cycle', 'Other (specify)'] },
      { name: 'Newsletter (external)', activities: ['Content collection', 'Drafting', 'Design', 'Mailing list management', 'Send & performance review', 'Other (specify)'] },
      { name: 'Annual report', activities: ['Data requests', 'Narrative drafting', 'Design coordination', 'Proofing', 'Final approval', 'Other (specify)'] },
      { name: 'Internal comms training', activities: ['Training prep', 'Training delivery', 'Materials update', 'Feedback capture', 'Other (specify)'] },
    ],
  },
  {
    deptId: 'dept-mel', projId: 'proj-internal-mel', prefix: 'mel',
    workAreas: [
      { name: 'Data/system availability', activities: ['Tool checks', 'Access troubleshooting', 'Data pipeline monitoring', 'Issue escalation', 'Other (specify)'] },
      { name: 'Capacity development / team training', activities: ['Training design', 'Training delivery', 'Coaching', 'Materials update', 'Other (specify)'] },
      { name: 'Data quality/integrity', activities: ['Data validation', 'Cleaning', 'Data audits', 'Fix recommendations', 'Other (specify)'] },
      { name: 'Data insights/analysis', activities: ['Analysis design', 'Data extraction', 'Modelling', 'Insight write-up', 'Presentation', 'Other (specify)'] },
      { name: 'Insight pieces for comms', activities: ['Insight drafting', 'Fact checking', 'Visuals coordination', 'Review & sign-off', 'Other (specify)'] },
      { name: 'M&E resources up to date', activities: ['Indicator review', 'Tools/templates update', 'Documentation', 'Stakeholder alignment', 'Other (specify)'] },
      { name: 'Data collection audits / project results audits', activities: ['Sampling plan', 'Evidence review', 'Field coordination', 'Findings log', 'Reporting', 'Other (specify)'] },
      { name: 'Impact assumptions deep dive', activities: ['Theory-of-change review', 'Assumption testing', 'Evidence gathering', 'Learning brief', 'Other (specify)'] },
    ],
  },
  {
    deptId: 'dept-bd', projId: 'proj-internal-bd', prefix: 'bd',
    workAreas: [
      { name: 'Industry engagements / external events', activities: ['Outreach', 'Scheduling', 'Attendance', 'Follow-ups', 'Notes & CRM updates', 'Other (specify)'] },
      { name: 'New funder/client conversations', activities: ['Intro call', 'Discovery', 'Needs capture', 'Follow-up emails', 'Pipeline update', 'Other (specify)'] },
      { name: 'Concept notes (first full draft)', activities: ['Research', 'Draft writing', 'Review cycle', 'Revision', 'Submission', 'Other (specify)'] },
      { name: 'Leads (existing/new)', activities: ['Lead sourcing', 'Qualification', 'Proposal planning', 'Handover', 'Pipeline hygiene', 'Other (specify)'] },
      { name: 'Proposals submitted', activities: ['Proposal drafting', 'Budgeting inputs', 'Partner coordination', 'Compliance checks', 'Submission admin', 'Other (specify)'] },
      { name: 'Contracts signed / key account management', activities: ['Negotiation support', 'Contract review coordination', 'Account check-ins', 'Reporting to client', 'Upsell/cross-sell', 'Other (specify)'] },
      { name: 'Databases (clients/partners)', activities: ['Data entry', 'Data cleaning', 'Segmentation', 'Outreach list build', 'Other (specify)'] },
    ],
  },
  {
    deptId: 'dept-it', projId: 'proj-internal-it', prefix: 'it',
    workAreas: [
      { name: 'User support & troubleshooting', activities: ['Ticket triage', 'Remote support', 'Hardware diagnostics', 'Software install/config', 'Access support', 'Follow-up', 'Other (specify)'] },
      { name: 'Laptop servicing & maintenance', activities: ['Preventive maintenance', 'Repairs coordination', 'Imaging/rebuilds', 'Warranty/vendor follow-up', 'Asset tagging', 'Other (specify)'] },
      { name: 'Connectivity status / network maintenance', activities: ['ISP troubleshooting', 'Router/AP checks', 'Performance monitoring', 'Changes/config updates', 'Documentation', 'Other (specify)'] },
      { name: 'IT report', activities: ['Metrics capture', 'Incident summary', 'Asset updates', 'Risk/issues log', 'Report drafting', 'Other (specify)'] },
      { name: 'On/offboarding', activities: ['Account setup', 'Permissions', 'Device allocation', 'Security baseline', 'Exit wipe/return', 'Other (specify)'] },
      { name: 'Asset inventory management', activities: ['Asset register updates', 'Audit checks', 'Procurement requests', 'Disposal processes', 'Other (specify)'] },
      { name: 'Training (basic / AI)', activities: ['Training prep', 'Training delivery', 'Office hours', 'Materials update', 'Other (specify)'] },
      { name: 'Systems & knowledge documentation', activities: ['SOP drafting', 'Process mapping', 'How-to guides', 'Architecture notes', 'Updates/versioning', 'Other (specify)'] },
    ],
  },
];

// ── Generate phases, work areas, and activity types from taxonomy ───

function buildTaxonomy() {
  const allPhases: Phase[] = [];
  const allWorkAreas: InternalWorkArea[] = [];
  const allActivities: ActivityType[] = [];

  // External phases and activities
  for (const pd of externalPhaseDefs) {
    allPhases.push({ id: pd.id, name: pd.name });
    for (const act of pd.activities) {
      allActivities.push({ id: act.id, name: act.name, phaseId: pd.id });
    }
  }

  // Internal department work areas and activities
  for (const dept of internalDeptDefs) {
    for (let wi = 0; wi < dept.workAreas.length; wi++) {
      const wa = dept.workAreas[wi];
      const phaseId = `phase-${dept.prefix}-${wi}`;
      const iwaId = `iwa-${dept.prefix}-${wi}`;

      allPhases.push({ id: phaseId, name: wa.name });
      allWorkAreas.push({ id: iwaId, name: wa.name, departmentId: dept.deptId, phaseId });

      for (let ai = 0; ai < wa.activities.length; ai++) {
        allActivities.push({
          id: `act-${dept.prefix}-${wi}-${ai}`,
          name: wa.activities[ai],
          phaseId,
        });
      }
    }
  }

  return { phases: allPhases, internalWorkAreas: allWorkAreas, activityTypes: allActivities };
}

const taxonomy = buildTaxonomy();

export const phases: Phase[] = taxonomy.phases;
export const internalWorkAreas: InternalWorkArea[] = taxonomy.internalWorkAreas;
export const activityTypes: ActivityType[] = taxonomy.activityTypes;

// ── Lookup helpers ──────────────────────────────────────────────────

export function getActivitiesForPhase(phaseId: string): ActivityType[] {
  return activityTypes.filter(a => a.phaseId === phaseId);
}

const standardPhaseIds = new Set(externalPhaseDefs.map(p => p.id));

export function getPhasesForProject(projectId: string): Phase[] {
  const project = projects.find(p => p.id === projectId);
  if (!project) return [];

  if (project.type === 'internal_department' && project.owningDepartmentId) {
    const deptWorkAreas = internalWorkAreas.filter(
      wa => wa.departmentId === project.owningDepartmentId
    );
    return deptWorkAreas
      .map(wa => phases.find(p => p.id === wa.phaseId))
      .filter((p): p is Phase => !!p);
  }

  return phases.filter(p => standardPhaseIds.has(p.id));
}

export function getAvailableWorkstreams(departmentId: string): Project[] {
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
  return [...internal, ...external, ...leave];
}

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

// ── Entry detail resolvers ──────────────────────────────────────────

export function getProjectById(projectId: string): Project | undefined {
  return projects.find(p => p.id === projectId);
}

export function getPhaseById(phaseId: string): Phase | undefined {
  return phases.find(p => p.id === phaseId);
}

export function getActivityTypeById(activityTypeId: string): ActivityType | undefined {
  return activityTypes.find(a => a.id === activityTypeId);
}

export function getEntryWithDetails(entry: TimeEntry): TimeEntryWithDetails | null {
  const project = getProjectById(entry.projectId);
  if (!project) return null;

  // Internal entry (workAreaId populated)
  if (entry.workAreaId) {
    const workArea = getPhaseById(entry.workAreaId);
    const workAreaActivity = entry.workAreaActivityTypeId
      ? getActivityTypeById(entry.workAreaActivityTypeId)
      : undefined;
    return { ...entry, project, workArea, workAreaActivity };
  }

  // External entry (phaseId populated)
  if (entry.phaseId) {
    const phase = getPhaseById(entry.phaseId);
    const activityType = entry.activityTypeId
      ? getActivityTypeById(entry.activityTypeId)
      : undefined;
    if (!phase) return null;
    return { ...entry, project, phase, activityType };
  }

  // Fallback (should not happen)
  return { ...entry, project };
}

// ── Deterministic seed data generator ───────────────────────────────

const currentWeekStart = getWeekStart();

// Per-user project affinity
const userProjectMap: Record<number, string[]> = {
  // Consulting (external only)
  0: ['proj-flagship', 'proj-ceic', 'proj-risa'],
  1: ['proj-flagship', 'proj-jica-gbv', 'proj-risa'],
  2: ['proj-ceic', 'proj-risa', 'proj-flagship'],
  3: ['proj-jica-gbv', 'proj-ceic', 'proj-flagship'],
  // Operations (external only)
  4: ['proj-flagship', 'proj-jica-gbv', 'proj-ceic', 'proj-risa'],
  5: ['proj-risa', 'proj-flagship', 'proj-ceic'],
  // BD (mix of external + internal)
  6: ['proj-orange-corners', 'proj-disrupt-for-her', 'proj-flagship', 'proj-internal-bd'],
  7: ['proj-disrupt-for-her', 'proj-orange-corners', 'proj-ceic', 'proj-internal-bd'],
  8: ['proj-orange-corners', 'proj-disrupt-for-her', 'proj-internal-bd'],
  // Finance (internal + leave)
  9: ['proj-internal-finance'],
  10: ['proj-internal-finance'],
  // IT (internal + leave)
  11: ['proj-internal-it'],
  // HR (internal + leave)
  12: ['proj-internal-hr'],
  13: ['proj-internal-hr'],
  // Communications (internal + leave)
  14: ['proj-internal-comms'],
  15: ['proj-internal-comms'],
  // MEL (internal + leave)
  16: ['proj-internal-mel'],
  17: ['proj-internal-mel'],
};

// Helper to get internal work area phase+activity combos for a project
function getInternalCombos(projId: string): Array<{ workAreaId: string; activityId: string; desc: string; deliverable: DeliverableType }> {
  const project = projects.find(p => p.id === projId);
  if (!project || project.type !== 'internal_department' || !project.owningDepartmentId) return [];

  const deptWAs = internalWorkAreas.filter(wa => wa.departmentId === project.owningDepartmentId);
  const combos: Array<{ workAreaId: string; activityId: string; desc: string; deliverable: DeliverableType }> = [];

  for (const wa of deptWAs) {
    const acts = activityTypes.filter(a => a.phaseId === wa.phaseId && !a.name.startsWith('Other'));
    for (const act of acts.slice(0, 3)) { // limit to 3 per work area for seed variety
      combos.push({
        workAreaId: wa.phaseId,
        activityId: act.id,
        desc: `${wa.name} — ${act.name}`,
        deliverable: 'other',
      });
    }
  }
  return combos;
}

// External project phase+activity combos
const externalProjectCombos: Record<string, Array<{ phaseId: string; activityTypeId: string; desc: string; deliverable: DeliverableType }>> = {
  'proj-flagship': [
    { phaseId: 'phase-inception', activityTypeId: 'act-inception-meeting', desc: 'Stakeholder alignment session', deliverable: 'workshop' },
    { phaseId: 'phase-inception', activityTypeId: 'act-inception-report', desc: 'Drafted inception report', deliverable: 'reporting' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-ws-delivery', desc: 'Business model canvas workshop', deliverable: 'workshop' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-session', desc: 'Advisory sessions with entrepreneurs', deliverable: 'training' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-collection', desc: 'Progress tracking data entry', deliverable: 'reporting' },
    { phaseId: 'phase-general-admin', activityTypeId: 'act-admin-team', desc: 'Team sync', deliverable: 'other' },
  ],
  'proj-jica-gbv': [
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruit-outreach', desc: 'Outreach to potential cohort members', deliverable: 'other' },
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruit-interviews', desc: 'Cohort selection interviews', deliverable: 'other' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-ws-curriculum', desc: 'Workshop content preparation', deliverable: 'workshop' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-narrative', desc: 'Quarterly report compilation', deliverable: 'reporting' },
    { phaseId: 'phase-general-admin', activityTypeId: 'act-admin-team', desc: 'Weekly planning call', deliverable: 'other' },
  ],
  'proj-ceic': [
    { phaseId: 'phase-workshops', activityTypeId: 'act-ws-delivery', desc: 'Financial literacy bootcamp', deliverable: 'workshop' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-ws-followup', desc: 'Post-workshop follow-up calls', deliverable: 'reporting' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-sprint', desc: 'Sprint coaching sessions', deliverable: 'training' },
    { phaseId: 'phase-growthlabs', activityTypeId: 'act-gl-facilitation', desc: 'GrowthLab delivery', deliverable: 'workshop' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-casestudy', desc: 'Case study development', deliverable: 'case_study' },
  ],
  'proj-risa': [
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-session', desc: 'One-on-one advisory', deliverable: 'training' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-research', desc: 'Entrepreneur research', deliverable: 'reporting' },
    { phaseId: 'phase-master-classes', activityTypeId: 'act-mc-delivery', desc: 'Master class delivery', deliverable: 'training' },
    { phaseId: 'phase-reporting', activityTypeId: 'act-rpt-collection', desc: 'Data collection and processing', deliverable: 'reporting' },
  ],
  'proj-disrupt-for-her': [
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruit-outreach', desc: 'Community outreach for D4H', deliverable: 'event' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-ws-delivery', desc: 'D4H bootcamp delivery', deliverable: 'workshop' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-other', desc: 'Mentorship coordination', deliverable: 'training' },
    { phaseId: 'phase-growthlabs', activityTypeId: 'act-gl-planning', desc: 'GrowthLab planning for D4H', deliverable: 'other' },
  ],
  'proj-orange-corners': [
    { phaseId: 'phase-inception', activityTypeId: 'act-inception-client', desc: 'Client alignment meeting', deliverable: 'other' },
    { phaseId: 'phase-recruitment', activityTypeId: 'act-recruit-events', desc: 'Networking event for OC', deliverable: 'event' },
    { phaseId: 'phase-workshops', activityTypeId: 'act-ws-curriculum', desc: 'Workshop preparation', deliverable: 'workshop' },
    { phaseId: 'phase-entrepreneur-support', activityTypeId: 'act-es-sprint', desc: 'Sprint sessions', deliverable: 'training' },
  ],
  'proj-leave': [
    { phaseId: 'phase-absence', activityTypeId: 'act-leave-day', desc: 'Leave day', deliverable: 'other' },
    { phaseId: 'phase-absence', activityTypeId: 'act-public-holiday', desc: 'Public holiday', deliverable: 'other' },
  ],
};

// Cache internal combos
const internalCombosCache: Record<string, ReturnType<typeof getInternalCombos>> = {};
function getCachedInternalCombos(projId: string) {
  if (!internalCombosCache[projId]) {
    internalCombosCache[projId] = getInternalCombos(projId);
  }
  return internalCombosCache[projId];
}

function seedVal(a: number, b: number, c: number): number {
  return ((a * 7 + b * 13 + c * 31) % 97);
}

function generateTimeEntries(): TimeEntry[] {
  const entries: TimeEntry[] = [];
  let entryId = 1;

  for (let weekOffset = -5; weekOffset <= 0; weekOffset++) {
    const wsDate = parseLocalDate(currentWeekStart);
    wsDate.setDate(wsDate.getDate() + weekOffset * 7);
    const ws = toLocalDateString(wsDate);

    for (let u = 0; u < users.length; u++) {
      const user = users[u];
      const sv = seedVal(u, weekOffset + 5, 0);

      const isIncompleteWeek = (u === 3 && weekOffset === -2) || (u === 8 && weekOffset === -4) || (u === 13 && weekOffset === -1);
      const isLeaveWeek = (u === 9 && weekOffset === -3) || (u === 12 && weekOffset === -1);

      const userProjects = userProjectMap[u] || ['proj-flagship'];
      const targetHours = isIncompleteWeek ? 20 + (sv % 8) : 36 + (sv % 6);
      let remainingMinutes = targetHours * 60;

      const dayEntries: number[] = [0, 1, 2, 3, 4];

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

      const numEntries = isIncompleteWeek ? 3 : 4 + (sv % 3);
      const minutePerEntry = Math.floor(remainingMinutes / numEntries);

      for (let e = 0; e < numEntries; e++) {
        const day = dayEntries[e % dayEntries.length];
        const projIdx = e % userProjects.length;
        const projId = userProjects[projIdx];
        const project = projects.find(p => p.id === projId);
        const isInternalProject = project?.type === 'internal_department';

        let mins = minutePerEntry + (seedVal(u, e, weekOffset + 5) % 4 - 2) * 15;
        mins = Math.max(60, Math.min(mins, 480));
        mins = Math.round(mins / 15) * 15;

        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;

        let billableStatus: BillableStatus = project?.defaultBillableStatus || 'billable';
        const bv = seedVal(u, e, weekOffset + 10);
        if (billableStatus === 'billable' && bv < 15) billableStatus = 'maybe_billable';
        if (billableStatus === 'billable' && bv >= 15 && bv < 20) billableStatus = 'not_billable';

        const entryDate = getWeekDate(ws, day);
        const isBackdated = (entryId % 19 === 0) && weekOffset < -1;
        const createdDate = isBackdated
          ? getWeekDate(ws, day + 4) + 'T14:30:00.000Z'
          : entryDate + 'T' + String(8 + (sv % 3)).padStart(2, '0') + ':00:00.000Z';

        if (isInternalProject) {
          const combos = getCachedInternalCombos(projId);
          if (combos.length === 0) continue;
          const combo = combos[seedVal(u, weekOffset + 5, e) % combos.length];

          entries.push({
            id: `entry-${entryId++}`,
            userId: user.id,
            projectId: projId,
            workAreaId: combo.workAreaId,
            workAreaActivityTypeId: combo.activityId,
            taskDescription: combo.desc,
            deliverableType: combo.deliverable,
            date: entryDate,
            hours,
            minutes,
            billableStatus,
            createdAt: createdDate,
            updatedAt: createdDate,
          });
        } else {
          const combos = externalProjectCombos[projId] || externalProjectCombos['proj-flagship'];
          const actIdx = seedVal(u, weekOffset + 5, e) % combos.length;
          const act = combos[actIdx];

          entries.push({
            id: `entry-${entryId++}`,
            userId: user.id,
            projectId: projId,
            phaseId: act.phaseId,
            activityTypeId: act.activityTypeId,
            supportDepartmentId: user.departmentId,
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

    if (weekOffset === 0) continue;

    for (let u = 0; u < users.length; u++) {
      const submitted = seedVal(u, weekOffset + 5, 42) > 38;
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
