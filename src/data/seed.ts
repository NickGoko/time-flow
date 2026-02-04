import { User, Client, Project, TimeEntry, WeekStatus, WEEKLY_EXPECTED_HOURS } from '@/types';

// Demo users
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.co.uk',
    department: 'Engineering',
    role: 'Senior Developer',
    weeklyExpectedHours: WEEKLY_EXPECTED_HOURS,
  },
  {
    id: 'user-2',
    name: 'James Chen',
    email: 'james.chen@company.co.uk',
    department: 'Design',
    role: 'UX Designer',
    weeklyExpectedHours: WEEKLY_EXPECTED_HOURS,
  },
  {
    id: 'user-3',
    name: 'Emily Thompson',
    email: 'emily.thompson@company.co.uk',
    department: 'Consulting',
    role: 'Senior Consultant',
    weeklyExpectedHours: WEEKLY_EXPECTED_HOURS,
  },
];

// Clients
export const clients: Client[] = [
  {
    id: 'client-internal',
    name: 'Internal',
    isInternal: true,
    isActive: true,
  },
  {
    id: 'client-1',
    name: 'Meridian Financial',
    isInternal: false,
    isActive: true,
  },
  {
    id: 'client-2',
    name: 'Northern Healthcare Trust',
    isInternal: false,
    isActive: true,
  },
  {
    id: 'client-3',
    name: 'Greenway Logistics',
    isInternal: false,
    isActive: true,
  },
  {
    id: 'client-4',
    name: 'TechStart Ventures',
    isInternal: false,
    isActive: true,
  },
];

// Projects
export const projects: Project[] = [
  // Internal projects
  {
    id: 'proj-internal-ops',
    name: 'Internal – Operations',
    clientId: 'client-internal',
    code: 'INT-OPS',
    isActive: true,
    defaultBillableStatus: 'not_billable',
  },
  {
    id: 'proj-internal-training',
    name: 'Internal – Training & Development',
    clientId: 'client-internal',
    code: 'INT-TRN',
    isActive: true,
    defaultBillableStatus: 'not_billable',
  },
  {
    id: 'proj-internal-sales',
    name: 'Internal – Sales & BD',
    clientId: 'client-internal',
    code: 'INT-SLS',
    isActive: true,
    defaultBillableStatus: 'not_billable',
  },
  {
    id: 'proj-internal-admin',
    name: 'Internal – Administration',
    clientId: 'client-internal',
    code: 'INT-ADM',
    isActive: true,
    defaultBillableStatus: 'not_billable',
  },
  // Client projects
  {
    id: 'proj-1',
    name: 'Digital Transformation Programme',
    clientId: 'client-1',
    code: 'MF-DTP',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-2',
    name: 'Core Banking Migration',
    clientId: 'client-1',
    code: 'MF-CBM',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-3',
    name: 'Patient Portal Redesign',
    clientId: 'client-2',
    code: 'NHT-PPR',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-4',
    name: 'Data Analytics Platform',
    clientId: 'client-2',
    code: 'NHT-DAP',
    isActive: true,
    defaultBillableStatus: 'maybe_billable',
  },
  {
    id: 'proj-5',
    name: 'Fleet Management System',
    clientId: 'client-3',
    code: 'GL-FMS',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
  {
    id: 'proj-6',
    name: 'MVP Development Sprint',
    clientId: 'client-4',
    code: 'TSV-MVP',
    isActive: true,
    defaultBillableStatus: 'billable',
  },
];

// Helper to get current week's Monday
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Helper to get date string for a day in the week
export function getWeekDate(weekStart: string, dayOffset: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split('T')[0];
}

// Generate sample time entries for current week
const currentWeekStart = getWeekStart();

export const timeEntries: TimeEntry[] = [
  // Sarah's entries - Monday
  {
    id: 'entry-1',
    userId: 'user-1',
    projectId: 'proj-1',
    date: getWeekDate(currentWeekStart, 0),
    durationMinutes: 240,
    description: 'Sprint planning and backlog refinement for Q1 deliverables',
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-2',
    userId: 'user-1',
    projectId: 'proj-1',
    date: getWeekDate(currentWeekStart, 0),
    durationMinutes: 180,
    description: 'API integration development for payment gateway',
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-3',
    userId: 'user-1',
    projectId: 'proj-internal-ops',
    date: getWeekDate(currentWeekStart, 0),
    durationMinutes: 60,
    description: 'Team standup and code reviews',
    billableStatus: 'not_billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Sarah's entries - Tuesday
  {
    id: 'entry-4',
    userId: 'user-1',
    projectId: 'proj-1',
    date: getWeekDate(currentWeekStart, 1),
    durationMinutes: 360,
    description: 'Building authentication microservice with OAuth 2.0',
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-5',
    userId: 'user-1',
    projectId: 'proj-internal-training',
    date: getWeekDate(currentWeekStart, 1),
    durationMinutes: 120,
    description: 'AWS certification study and practice labs',
    billableStatus: 'not_billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Sarah's entries - Wednesday
  {
    id: 'entry-6',
    userId: 'user-1',
    projectId: 'proj-3',
    date: getWeekDate(currentWeekStart, 2),
    durationMinutes: 300,
    description: 'Technical discovery session with NHS stakeholders',
    billableStatus: 'billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'entry-7',
    userId: 'user-1',
    projectId: 'proj-3',
    date: getWeekDate(currentWeekStart, 2),
    durationMinutes: 180,
    description: 'Architecture document drafting for patient portal',
    billableStatus: 'maybe_billable',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Week status
export const weekStatuses: WeekStatus[] = [];

// Get project with client
export function getProjectWithClient(projectId: string) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  const client = clients.find(c => c.id === project.clientId);
  if (!client) return null;
  return { ...project, client };
}
