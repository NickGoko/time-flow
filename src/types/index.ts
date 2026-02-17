// Core types for Time Registration App

export type BillableStatus = 'billable' | 'maybe_billable' | 'not_billable';

export type AppRole = 'admin' | 'employee';

export interface Department {
  id: string;
  name: string;
}

export type WorkstreamType = 'internal_department' | 'external_project';

export interface User {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: string;
  appRole: AppRole;
  weeklyExpectedHours: number;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  defaultBillableStatus: BillableStatus;
  type: WorkstreamType;
  owningDepartmentId?: string;
}

export interface ProjectDepartmentAccess {
  workstreamId: string;
  departmentId: string;
}

export interface InternalWorkArea {
  id: string;
  name: string;
  departmentId: string;
  phaseId: string; // links to the Phase entry for this work area
}

export interface Phase {
  id: string;
  name: string;
}

export interface ActivityType {
  id: string;
  name: string;
  phaseId: string;
}

export type DeliverableType = 
  | 'workshop'
  | 'reporting'
  | 'training'
  | 'event'
  | 'case_study'
  | 'other';

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;

  // External project fields (undefined when internal)
  phaseId?: string;
  activityTypeId?: string;
  supportDepartmentId?: string;

  // Internal workstream fields (undefined when external)
  workAreaId?: string;
  workAreaActivityTypeId?: string;

  taskDescription: string; // mandatory
  deliverableType: DeliverableType;
  deliverableDescription?: string; // optional
  date: string; // ISO date string (YYYY-MM-DD)
  hours: number; // 0-8
  minutes: number; // 0, 15, 30, 45
  billableStatus: BillableStatus;
  comments?: string; // optional
  createdAt: string;
  updatedAt: string;
}

export interface WeekStatus {
  userId: string;
  weekStartDate: string; // Monday of the week (YYYY-MM-DD)
  isSubmitted: boolean;
  submittedAt?: string;
  isLocked: boolean;
  lockedAt?: string;
}

// Derived types for UI
export interface TimeEntryWithDetails extends TimeEntry {
  project: Project;
  phase?: Phase;
  activityType?: ActivityType;
  workArea?: Phase;
  workAreaActivity?: ActivityType;
}

export interface WeekSummary {
  weekStartDate: string;
  totalMinutes: number;
  billableMinutes: number;
  notBillableMinutes: number;
  entriesByDay: Record<string, TimeEntryWithDetails[]>;
  status: WeekStatus | null;
}

export interface DailyTotal {
  date: string;
  dayName: string;
  totalMinutes: number;
  entries: TimeEntryWithDetails[];
}

// Constants
export const WEEKLY_EXPECTED_HOURS = 40;
export const HOURS_PER_DAY_TARGET = 8;
export const MAX_DAILY_HOURS = 10;
export const MAX_DAILY_MINUTES = MAX_DAILY_HOURS * 60;
export const MAX_PAST_DAYS = 14;

// Helper: convert hours + minutes to total minutes
export function toTotalMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

// Format duration for display
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Format hours for display
export function formatHours(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

// Get billable status label
export function getBillableLabel(status: BillableStatus): string {
  switch (status) {
    case 'billable':
      return 'Billable';
    case 'maybe_billable':
      return 'Maybe Billable';
    case 'not_billable':
      return 'Not Billable';
  }
}

export const BILLABLE_STATUSES: BillableStatus[] = ['billable', 'maybe_billable', 'not_billable'];

export interface GroupedWorkstreams {
  recent: Project[];
  external: Project[];
  internal: Project[];
  leave: Project[];
}

// Get deliverable type label
export function getDeliverableLabel(type: DeliverableType): string {
  switch (type) {
    case 'workshop':
      return 'Workshop';
    case 'reporting':
      return 'Reporting';
    case 'training':
      return 'Training';
    case 'event':
      return 'Event';
    case 'case_study':
      return 'Case study';
    case 'other':
      return 'Other';
  }
}

export const DELIVERABLE_TYPES: DeliverableType[] = [
  'workshop',
  'reporting',
  'training',
  'event',
  'case_study',
  'other',
];

export const HOUR_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export const MINUTE_OPTIONS = [0, 15, 30, 45] as const;
