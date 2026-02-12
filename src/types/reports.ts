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
