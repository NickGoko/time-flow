import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { TimeEntry, User, WeekStatus } from '@/types';

const todayIso = new Date().toISOString().slice(0, 10);
const nowIso = new Date().toISOString();

const mockUser: User = {
  id: 'u-1',
  name: 'Test User',
  email: 'test@example.com',
  departmentId: 'dept-1',
  role: 'Consultant',
  appRole: 'admin',
  weeklyExpectedHours: 40,
  isActive: true,
};

const entries: TimeEntry[] = [
  {
    id: 'e-1',
    userId: 'u-1',
    projectId: 'p-1',
    taskDescription: 'Billable work',
    deliverableType: 'reporting',
    date: todayIso,
    hours: 1,
    minutes: 30,
    billableStatus: 'billable',
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'e-2',
    userId: 'u-1',
    projectId: 'p-2',
    taskDescription: 'Maybe billable work',
    deliverableType: 'training',
    date: todayIso,
    hours: 0,
    minutes: 45,
    billableStatus: 'maybe_billable',
    createdAt: nowIso,
    updatedAt: nowIso,
  },
  {
    id: 'e-3',
    userId: 'u-1',
    projectId: 'p-3',
    taskDescription: 'Non-billable work',
    deliverableType: 'other',
    date: todayIso,
    hours: 0,
    minutes: 15,
    billableStatus: 'not_billable',
    createdAt: nowIso,
    updatedAt: nowIso,
  },
];

vi.mock('@/contexts/TimeEntriesContext', () => ({
  useTimeEntries: () => ({
    getAllEntries: () => entries,
    weekStatuses: [] as WeekStatus[],
    validationEvents: [],
  }),
}));

vi.mock('@/contexts/UserContext', () => ({
  useAuthenticatedUser: () => ({
    currentUser: mockUser,
    allUsers: [mockUser],
    appRole: 'admin' as const,
  }),
}));

import { useDashboardDataset } from '@/hooks/useDashboardDataset';
import { reconcileDashboardTotals } from '@/lib/reconcile';

describe('useDashboardData reconciliation', () => {
  it('returns matching totals for known entry inputs', () => {
    const { result } = renderHook(() => useDashboardDataset('my', mockUser.departmentId, 'this_year'));

    const reconcileResult = reconcileDashboardTotals({
      entries: result.current.scopedEntries,
      kpiTotalMinutes: result.current.metrics.totalMinutes,
      kpiBillable: result.current.metrics.billableMinutes,
      kpiMaybe: result.current.metrics.maybeBillableMinutes,
      kpiNotBillable: result.current.metrics.notBillableMinutes,
      label: 'Test/useDashboardData',
    });

    expect(result.current.metrics.totalMinutes).toBe(150);
    expect(result.current.metrics.billableMinutes).toBe(90);
    expect(result.current.metrics.maybeBillableMinutes).toBe(45);
    expect(result.current.metrics.notBillableMinutes).toBe(15);
    expect(reconcileResult.hasMismatch).toBe(false);
  });
});
