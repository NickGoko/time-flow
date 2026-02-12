// Admin Reports — aggregate interfaces (backend-agnostic)

export interface ReportMetrics {
  totalMinutes: number;
  billableMinutes: number;
  maybeBillableMinutes: number;
  notBillableMinutes: number;
  activeUserCount: number;
  periodLabel: string;
}

export interface DailyBreakdown {
  date: string;
  dayLabel: string;
  billableMinutes: number;
  maybeBillableMinutes: number;
  notBillableMinutes: number;
}

export interface CohortBucket {
  label: string;
  userCount: number;
  avgPercentOfExpected: number;
  minPercent: number;
  maxPercent: number;
}

export interface UserWeekSummary {
  userId: string;
  totalMinutes: number;
  expectedMinutes: number;
  percentOfExpected: number;
}

export interface TeamMemberSummary {
  userId: string;
  userName: string;
  totalMinutes: number;
  compliancePercent: number;
  billablePercent: number;
  maybeBillableMinutes: number;
  weekSubmitted: boolean;
}

export interface ProjectBreakdownItem {
  projectId: string;
  projectName: string;
  totalMinutes: number;
}

export interface OperationalInsights {
  maybeBillableCount: number;
  maybeBillableMinutes: number;
  backdatedEntryCount: number;
}
