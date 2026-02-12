import { User, Project, Phase, ActivityType, TimeEntry, WeekStatus, BillableStatus, DeliverableType, WEEKLY_EXPECTED_HOURS } from '@/types';

// ── Demo users (15 across 6 departments) ────────────────────────────

export const users: User[] = [
  // Consulting
  { id: 'user-1', name: 'Sarah Mitchell', email: 'sarah.mitchell@company.co.uk', department: 'Consulting', role: 'Senior Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-2', name: 'James Chen', email: 'james.chen@company.co.uk', department: 'Consulting', role: 'Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-4', name: 'Amara Osei', email: 'amara.osei@company.co.uk', department: 'Consulting', role: 'Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-5', name: 'David Mwangi', email: 'david.mwangi@company.co.uk', department: 'Consulting', role: 'Junior Consultant', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Operations
  { id: 'user-3', name: 'Emily Thompson', email: 'emily.thompson@company.co.uk', department: 'Operations', role: 'Programme Manager', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-6', name: 'Fatima Al-Hassan', email: 'fatima.alhassan@company.co.uk', department: 'Operations', role: 'Operations Lead', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Business Development
  { id: 'user-7', name: 'Liam O\'Brien', email: 'liam.obrien@company.co.uk', department: 'Business Development', role: 'BD Manager', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-8', name: 'Priya Sharma', email: 'priya.sharma@company.co.uk', department: 'Business Development', role: 'BD Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-9', name: 'Grace Kimani', email: 'grace.kimani@company.co.uk', department: 'Business Development', role: 'BD Associate', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // Finance
  { id: 'user-10', name: 'Raj Patel', email: 'raj.patel@company.co.uk', department: 'Finance', role: 'Financial Analyst', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-11', name: 'Nneka Chukwu', email: 'nneka.chukwu@company.co.uk', department: 'Finance', role: 'Finance Officer', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // IT
  { id: 'user-12', name: 'Tom Baker', email: 'tom.baker@company.co.uk', department: 'IT', role: 'IT Manager', appRole: 'admin', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  // HR
  { id: 'user-13', name: 'Sofia Martinez', email: 'sofia.martinez@company.co.uk', department: 'HR', role: 'HR Specialist', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
  { id: 'user-14', name: 'Aisha Banda', email: 'aisha.banda@company.co.uk', department: 'HR', role: 'HR Coordinator', appRole: 'employee', weeklyExpectedHours: WEEKLY_EXPECTED_HOURS },
];

// ── Projects ────────────────────────────────────────────────────────

export const projects: Project[] = [
  { id: 'proj-flagship', name: 'Flagship', code: 'FLAGSHIP', isActive: true, defaultBillableStatus: 'billable' },
  { id: 'proj-jica-gbv', name: 'JICA GBV', code: 'JICA-GBV', isActive: true, defaultBillableStatus: 'billable' },
  { id: 'proj-ceic', name: 'CEIC', code: 'CEIC', isActive: true, defaultBillableStatus: 'billable' },
  { id: 'proj-risa', name: 'RISA', code: 'RISA', isActive: true, defaultBillableStatus: 'billable' },
  { id: 'proj-disrupt-for-her', name: 'Disrupt_for_Her', code: 'D4H', isActive: true, defaultBillableStatus: 'billable' },
  { id: 'proj-orange-corners', name: 'Orange Corners', code: 'OC', isActive: true, defaultBillableStatus: 'billable' },
  { id: 'proj-leave', name: 'Leave / Absence', code: 'LEAVE', isActive: true, defaultBillableStatus: 'not_billable' },
];

// ── Phases ───────────────────────────────────────────────────────────

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

// ── Activity types ──────────────────────────────────────────────────

export const activityTypes: ActivityType[] = [
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
];

export function getActivitiesForPhase(phaseId: string): ActivityType[] {
  return activityTypes.filter(a => a.phaseId === phaseId);
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
