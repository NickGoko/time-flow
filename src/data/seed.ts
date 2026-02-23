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

// ── Real team members (26) ───────────────────────────────────────────

export const users: User[] = [
  // Operations (Admin/Leadership) — 3 admins
  { id: 'user-ilo', name: 'Ian Lorenzen', email: 'ilo@growthafrica.com', departmentId: 'dept-operations', role: 'Executive Director & Partner', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-jkj', name: 'Johnni Kjelsgaard', email: 'jkj@growthafrica.com', departmentId: 'dept-operations', role: 'Founder & Executive Chairman', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-pju', name: 'Patricia Jumi', email: 'pju@growthafrica.com', departmentId: 'dept-operations', role: 'Managing Director', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },

  // Project Delivery (Impact) — 12 employees (2 inactive)
  { id: 'user-bmu', name: 'Brian Muvea', email: 'bmu@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-das', name: 'Duncan Asila', email: 'das@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: false },
  { id: 'user-eel', name: 'Eugene Eluerkeh', email: 'eel@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-hmu', name: 'Hilda Mugambi', email: 'hmu@growthafrica.com', departmentId: 'dept-consulting', role: 'Senior Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-isk', name: 'Ida Sarup Kjelsgaard', email: 'isk@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-jba', name: 'Jesse Baddoo', email: 'jba@growthafrica.com', departmentId: 'dept-consulting', role: 'Senior Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-lma', name: 'Linda Mathenge', email: 'lma@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-mwa', name: 'Maureen Wachira', email: 'mwa@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: false },
  { id: 'user-man', name: 'Meselu Andargie', email: 'man@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-mot', name: 'Michael Otoo', email: 'mot@growthafrica.com', departmentId: 'dept-consulting', role: 'Senior Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-mny', name: 'Modechai Nyerere', email: 'mny@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-msu', name: 'Mohammed Sultan', email: 'msu@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-pmu', name: 'Patrick Mulumba', email: 'pmu@growthafrica.com', departmentId: 'dept-consulting', role: 'Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-rwi', name: 'Richard Wiafe', email: 'rwi@growthafrica.com', departmentId: 'dept-consulting', role: 'Senior Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },

  // Finance & Admin — 2 employees
  { id: 'user-anm', name: 'Alex Njoroge', email: 'anm@growthafrica.com', departmentId: 'dept-finance', role: 'Finance & Admin Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-cne', name: 'Connie Nekesa', email: 'cne@growthafrica.com', departmentId: 'dept-finance', role: 'Finance & Admin Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },

  // Communications — 4 employees
  { id: 'user-ean', name: 'Edward Angyinaa', email: 'ean@growthafrica.com', departmentId: 'dept-comms', role: 'Communications Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-jny', name: 'Joyce Nyoro', email: 'jny@growthafrica.com', departmentId: 'dept-comms', role: 'Communications Intern', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-sga', name: 'Sheila Gacheru', email: 'sga@growthafrica.com', departmentId: 'dept-comms', role: 'Communications Lead', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
  { id: 'user-tna', name: 'Trudy Natabona', email: 'tna@growthafrica.com', departmentId: 'dept-comms', role: 'Communications Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },

  // Business Development — 1 employee
  { id: 'user-mmu', name: 'Michelle Murugi', email: 'mmu@growthafrica.com', departmentId: 'dept-bd', role: 'Business Development Lead', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },

  // Productivity & IT — 1 employee
  { id: 'user-ngo', name: 'Nicholas Goko', email: 'ngo@growthafrica.com', departmentId: 'dept-it', role: 'IT & Productivity Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },

  // HR — 1 employee
  { id: 'user-wte', name: 'Winnie Teresia', email: 'wte@growthafrica.com', departmentId: 'dept-hr', role: 'HR Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS, isActive: true },
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

// ── Seed data (cleared — no demo entries) ──────────────────────────


function generateTimeEntries(): TimeEntry[] {
  return [];
}

export const timeEntries: TimeEntry[] = generateTimeEntries();

// ── Week statuses (~60% submitted for past weeks) ──────────────────

function generateWeekStatuses(): WeekStatus[] {
  return [];
}

export const weekStatuses: WeekStatus[] = generateWeekStatuses();
