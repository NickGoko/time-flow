import { useMemo } from 'react';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { deriveMetrics, deriveOperationalInsights } from '@/data/reportsMockData';
import { getWeekStart, parseLocalDate, departments } from '@/data/seed';

export type RangeOption = 'this_week' | 'last_week' | 'this_month' | 'today' | 'this_quarter' | 'this_year';
export type ScopeOption = 'my' | 'department' | 'org';

export function getExpectedMinutes(range: RangeOption, days: number): number {
  if (range === 'today') return 8 * 60;
  if (range === 'this_week' || range === 'last_week') return 40 * 60;
  const workingDays = Math.round(days * 5 / 7);
  return workingDays * 8 * 60;
}

export function getDateWindow(range: RangeOption): { weekStart: string; days: number; rangeStartDate: Date; rangeEndDate: Date } {
  const now = new Date();
  if (range === 'this_week') {
    const ws = getWeekStart(now);
    const start = parseLocalDate(ws);
    const end = new Date(start); end.setDate(end.getDate() + 4);
    return { weekStart: ws, days: 5, rangeStartDate: start, rangeEndDate: end };
  }
  if (range === 'last_week') {
    const d = new Date(now); d.setDate(d.getDate() - 7);
    const ws = getWeekStart(d);
    const start = parseLocalDate(ws);
    const end = new Date(start); end.setDate(end.getDate() + 4);
    return { weekStart: ws, days: 5, rangeStartDate: start, rangeEndDate: end };
  }
  if (range === 'today') {
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return { weekStart: todayStr, days: 1, rangeStartDate: now, rangeEndDate: now };
  }
  if (range === 'this_quarter') {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const first = new Date(now.getFullYear(), qMonth, 1);
    const ws = getWeekStart(first);
    const start = parseLocalDate(ws);
    const totalDays = Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    return { weekStart: ws, days: Math.min(totalDays, 100), rangeStartDate: start, rangeEndDate: now };
  }
  if (range === 'this_year') {
    const first = new Date(now.getFullYear(), 0, 1);
    const ws = getWeekStart(first);
    const start = parseLocalDate(ws);
    const totalDays = Math.ceil((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    return { weekStart: ws, days: Math.min(totalDays, 366), rangeStartDate: start, rangeEndDate: now };
  }
  // this_month
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayCount = now.getDate();
  const ws = getWeekStart(first);
  const start = parseLocalDate(ws);
  const totalDays = Math.min(dayCount + (first.getDay() === 0 ? 6 : first.getDay() - 1), 35);
  const end = new Date(start); end.setDate(end.getDate() + totalDays - 1);
  return { weekStart: ws, days: totalDays, rangeStartDate: start, rangeEndDate: end };
}

export function useDashboardDataset(scope: ScopeOption, selectedDeptId: string, range: RangeOption) {
  const { getAllEntries, weekStatuses, validationEvents } = useTimeEntries();
  const entries = getAllEntries();
  const { currentUser, allUsers, appRole } = useAuthenticatedUser();

  const canViewDepartment = ['hod', 'leadership', 'admin', 'super_admin'].includes(appRole ?? '');
  const canViewOrg = ['leadership', 'admin', 'super_admin'].includes(appRole ?? '');

  const availableDepartments = useMemo(() => {
    if (appRole === 'hod') {
      const managed = currentUser.managedDepartments ?? [];
      return departments.filter(d => d.isActive && managed.includes(d.id));
    }
    if (canViewOrg || canViewDepartment) {
      return departments.filter(d => d.isActive);
    }
    return [];
  }, [appRole, currentUser.managedDepartments, canViewOrg, canViewDepartment]);

  const scopedUsers = useMemo(() => {
    if (scope === 'my') return allUsers.filter(u => u.id === currentUser.id);
    if (scope === 'department') return allUsers.filter(u => u.departmentId === selectedDeptId);
    return allUsers;
  }, [scope, allUsers, currentUser.id, selectedDeptId]);

  const scopedEntries = useMemo(() => {
    const scopedUserIds = new Set(scopedUsers.map(u => u.id));
    return entries.filter(e => scopedUserIds.has(e.userId));
  }, [entries, scopedUsers]);

  const scopedWeekStatuses = useMemo(() => {
    const scopedUserIds = new Set(scopedUsers.map(u => u.id));
    return weekStatuses.filter(ws => scopedUserIds.has(ws.userId));
  }, [weekStatuses, scopedUsers]);

  const { weekStart, days, rangeStartDate, rangeEndDate } = useMemo(() => getDateWindow(range), [range]);

  const metrics = useMemo(() => deriveMetrics(scopedEntries, weekStart, days), [scopedEntries, weekStart, days]);
  const insights = useMemo(
    () => deriveOperationalInsights(scopedEntries, weekStart, days, scopedUsers, scopedWeekStatuses),
    [scopedEntries, weekStart, days, scopedUsers, scopedWeekStatuses],
  );

  const blockedByCapCount = useMemo(() => {
    const scopedUserIds = new Set(scopedUsers.map(u => u.id));
    return validationEvents.filter(ve => {
      if (ve.eventType !== 'cap_blocked') return false;
      if (!scopedUserIds.has(ve.userId)) return false;
      const d = parseLocalDate(ve.entryDate);
      return d >= rangeStartDate && d <= rangeEndDate;
    }).length;
  }, [validationEvents, scopedUsers, rangeStartDate, rangeEndDate]);

  return {
    scopedEntries,
    scopedUsers,
    scopedWeekStatuses,
    weekStart,
    days,
    rangeStartDate,
    rangeEndDate,
    metrics,
    insights,
    blockedByCapCount,
    availableDepartments,
    canViewDepartment,
    canViewOrg,
    currentUser,
    allUsers,
    appRole,
  };
}
