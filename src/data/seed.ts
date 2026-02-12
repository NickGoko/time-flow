import { User, Project, Phase, ActivityType, TimeEntry, WeekStatus, WEEKLY_EXPECTED_HOURS } from '@/types';

// Demo users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.co.uk',
    department: 'Consulting',
    role: 'Senior Consultant',
    appRole: 'employee',
    weeklyExpectedHours: WEEKLY_EXPECTED_HOURS,
  },
  {
    id: 'user-2',
    name: 'James Chen',
    email: 'james.chen@company.co.uk',
    department: 'Consulting',
    role: 'Consultant',
    appRole: 'employee',
    weeklyExpectedHours: WEEKLY_EXPECTED_HOURS,
  },
  {
    id: 'user-3',
    name: 'Emily Thompson',
    email: 'emily.thompson@company.co.uk',
    department: 'Operations',
    role: 'Programme Manager',
    appRole: 'admin',
    weeklyExpectedHours: WEEKLY_EXPECTED_HOURS,
  },
];

// Projects
export const projects: Project[] = [
  {
    id: 'proj-flagship',
    name: 'Flagship',
    code: 'FLAGSHIP',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-jica-gbv',
    name: 'JICA GBV',
    code: 'JICA-GBV',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-ceic',
    name: 'CEIC',
    code: 'CEIC',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-risa',
    name: 'RISA',
    code: 'RISA',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-disrupt-for-her',
    name: 'Disrupt_for_Her',
    code: 'D4H',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-orange-corners',
    name: 'Orange Corners',
    code: 'OC',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-leave',
    name: 'Leave / Absence',
    code: 'LEAVE',
    isActive: true,
    defaultBillableStatus: 'not_billable',
  },
];

// Phases (previously called "Phase of project")
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
];

// Activity types (previously called "Type of [phase] activity")
export const activityTypes: ActivityType[] = [
  // Inception activities
  { id: 'act-inception-prep', name: 'Inception/kickoff preparations', phaseId: 'phase-inception' },
  { id: 'act-inception-meeting', name: 'Inception meeting/kickoff', phaseId: 'phase-inception' },
  { id: 'act-inception-report', name: 'Inception report', phaseId: 'phase-inception' },
  { id: 'act-inception-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-inception' },
  { id: 'act-inception-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-inception' },

  // Recruitment activities
  { id: 'act-recruitment-outreach', name: 'Outreach (potential cohort)', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-selection', name: 'Selection activities (new cohorts)', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-onboarding', name: 'Onboarding (new cohorts)', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-events', name: 'External events participation', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-recruitment' },
  { id: 'act-recruitment-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-recruitment' },

  // Workshop activities
  { id: 'act-workshop-prep', name: 'Workshop/bootcamp prep', phaseId: 'phase-workshops' },
  { id: 'act-workshop-execution', name: 'Workshop/bootcamp execution', phaseId: 'phase-workshops' },
  { id: 'act-workshop-followup', name: 'Workshop/bootcamp follow-up', phaseId: 'phase-workshops' },
  { id: 'act-workshop-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-workshops' },
  { id: 'act-workshop-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-workshops' },

  // Entrepreneur Support activities
  { id: 'act-es-research', name: 'Entrepreneur research & prep', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-support-aa', name: 'Entrepreneur support (A&A)', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-support-sprint', name: 'Entrepreneur support (Sprint)', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-support-other', name: 'Entrepreneur support (Other)', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-sprint-research', name: 'Sprint research & prep', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-entrepreneur-support' },
  { id: 'act-es-transport', name: 'Transport to/from engagements', phaseId: 'phase-entrepreneur-support' },

  // GrowthLabs activities
  { id: 'act-gl-planning', name: 'GrowthLab planning', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-execution', name: 'GrowthLab execution', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-followup', name: 'GrowthLab follow-up', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-growthlabs' },
  { id: 'act-gl-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-growthlabs' },

  // Master Classes activities
  { id: 'act-mc-planning', name: 'Master class planning', phaseId: 'phase-master-classes' },
  { id: 'act-mc-mobilization', name: 'Mentor/resource mobilisation', phaseId: 'phase-master-classes' },
  { id: 'act-mc-execution', name: 'Master class execution', phaseId: 'phase-master-classes' },
  { id: 'act-mc-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-master-classes' },
  { id: 'act-mc-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-master-classes' },

  // Reporting activities
  { id: 'act-rpt-followups', name: 'Entrepreneur follow-ups', phaseId: 'phase-reporting' },
  { id: 'act-rpt-data', name: 'Data collection & processing', phaseId: 'phase-reporting' },
  { id: 'act-rpt-reporting', name: 'Reporting (time, journey track, etc.)', phaseId: 'phase-reporting' },
  { id: 'act-rpt-case-study', name: 'Case study development', phaseId: 'phase-reporting' },

  // General Administrative activities
  { id: 'act-admin-team-meetings', name: 'Team meetings', phaseId: 'phase-general-admin' },
  { id: 'act-admin-transport', name: 'Transport to/from engagements', phaseId: 'phase-general-admin' },
  { id: 'act-admin-client-meeting', name: 'Online/external meeting with the client', phaseId: 'phase-general-admin' },
  { id: 'act-admin-partner-meeting', name: 'Online/external meeting with a partner', phaseId: 'phase-general-admin' },
  { id: 'act-admin-event', name: 'Attending an event', phaseId: 'phase-general-admin' },

  // Absence activities
  { id: 'act-leave-day', name: 'Leave day', phaseId: 'phase-absence' },
  { id: 'act-public-holiday', name: 'Public holiday', phaseId: 'phase-absence' },
];

// Get activities for a specific phase
export function getActivitiesForPhase(phaseId: string): ActivityType[] {
  return activityTypes.filter(a => a.phaseId === phaseId);
}

// Format a Date as YYYY-MM-DD using local timezone (no UTC shift)
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parse a YYYY-MM-DD string as local midnight (not UTC)
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Helper to get current week's Monday
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return toLocalDateString(d);
}

// Helper to get date string for a day in the week
export function getWeekDate(weekStart: string, dayOffset: number): string {
  const d = parseLocalDate(weekStart);
  d.setDate(d.getDate() + dayOffset);
  return toLocalDateString(d);
}

// Generate sample time entries for current week
const currentWeekStart = getWeekStart();

export const timeEntries: TimeEntry[] = [
  // Sarah's entries - Monday
  {
    id: 'entry-1',
    userId: 'user-1',
    projectId: 'proj-flagship',
    phaseId: 'phase-inception',
    activityTypeId: 'act-inception-meeting',
    taskDescription: 'Facilitated kickoff session with programme stakeholders',
    deliverableType: 'workshop',
    deliverableDescription: 'Kickoff workshop materials',
    date: getWeekDate(currentWeekStart, 0),
    hours: 4,
    minutes: 0,
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-2',
    userId: 'user-1',
    projectId: 'proj-flagship',
    phaseId: 'phase-inception',
    activityTypeId: 'act-inception-report',
    taskDescription: 'Drafted inception report sections 1-3',
    deliverableType: 'reporting',
    date: getWeekDate(currentWeekStart, 0),
    hours: 3,
    minutes: 0,
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-3',
    userId: 'user-1',
    projectId: 'proj-jica-gbv',
    phaseId: 'phase-general-admin',
    activityTypeId: 'act-admin-team-meetings',
    taskDescription: 'Weekly team sync and planning session',
    deliverableType: 'other',
    date: getWeekDate(currentWeekStart, 0),
    hours: 1,
    minutes: 0,
    billableStatus: 'not_billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Sarah's entries - Tuesday
  {
    id: 'entry-4',
    userId: 'user-1',
    projectId: 'proj-ceic',
    phaseId: 'phase-workshops',
    activityTypeId: 'act-workshop-execution',
    taskDescription: 'Delivered business model canvas workshop to cohort 3',
    deliverableType: 'workshop',
    date: getWeekDate(currentWeekStart, 1),
    hours: 6,
    minutes: 0,
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-5',
    userId: 'user-1',
    projectId: 'proj-ceic',
    phaseId: 'phase-workshops',
    activityTypeId: 'act-workshop-followup',
    taskDescription: 'Compiled participant feedback and action items',
    deliverableType: 'reporting',
    date: getWeekDate(currentWeekStart, 1),
    hours: 2,
    minutes: 0,
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Sarah's entries - Wednesday
  {
    id: 'entry-6',
    userId: 'user-1',
    projectId: 'proj-risa',
    phaseId: 'phase-entrepreneur-support',
    activityTypeId: 'act-es-support-aa',
    taskDescription: 'One-on-one advisory sessions with 4 entrepreneurs',
    deliverableType: 'training',
    date: getWeekDate(currentWeekStart, 2),
    hours: 5,
    minutes: 0,
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-7',
    userId: 'user-1',
    projectId: 'proj-risa',
    phaseId: 'phase-reporting',
    activityTypeId: 'act-rpt-data',
    taskDescription: 'Updated entrepreneur progress tracking spreadsheet',
    deliverableType: 'reporting',
    date: getWeekDate(currentWeekStart, 2),
    hours: 3,
    minutes: 0,
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Week status
export const weekStatuses: WeekStatus[] = [];

// Get project by ID
export function getProjectById(projectId: string): Project | undefined {
  return projects.find(p => p.id === projectId);
}

// Get phase by ID
export function getPhaseById(phaseId: string): Phase | undefined {
  return phases.find(p => p.id === phaseId);
}

// Get activity type by ID
export function getActivityTypeById(activityTypeId: string): ActivityType | undefined {
  return activityTypes.find(a => a.id === activityTypeId);
}

// Get entry with full details
export function getEntryWithDetails(entry: TimeEntry) {
  const project = getProjectById(entry.projectId);
  const phase = getPhaseById(entry.phaseId);
  const activityType = getActivityTypeById(entry.activityTypeId);
  
  if (!project || !phase || !activityType) return null;
  
  return {
    ...entry,
    project,
    phase,
    activityType,
  };
}
