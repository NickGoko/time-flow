// Core types for Time Registration App

export type BillableStatus = 'billable' | 'maybe_billable' | 'not_billable';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  weeklyExpectedHours: number; // Default 40
  avatarUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  isInternal: boolean;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  code: string; // e.g., "PRJ-001"
  isActive: boolean;
  defaultBillableStatus: BillableStatus;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  durationMinutes: number; // Must be divisible by 15
  description: string;
  billableStatus: BillableStatus;
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
export interface ProjectWithClient extends Project {
  client: Client;
}

export interface TimeEntryWithProject extends TimeEntry {
  project: ProjectWithClient;
}

export interface WeekSummary {
  weekStartDate: string;
  totalMinutes: number;
  billableMinutes: number;
  maybeBillableMinutes: number;
  notBillableMinutes: number;
  entriesByDay: Record<string, TimeEntryWithProject[]>;
  status: WeekStatus | null;
}

export interface DailyTotal {
  date: string;
  dayName: string;
  totalMinutes: number;
  entries: TimeEntryWithProject[];
}

// Constants
export const WEEKLY_EXPECTED_HOURS = 40;
export const MINUTES_PER_INCREMENT = 15;
export const HOURS_PER_DAY_TARGET = 8;

// Helper to validate duration
export function isValidDuration(minutes: number): boolean {
  return minutes > 0 && minutes % MINUTES_PER_INCREMENT === 0;
}

// Format duration for display
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
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
      return 'Maybe billable';
    case 'not_billable':
      return 'Not billable';
  }
}
