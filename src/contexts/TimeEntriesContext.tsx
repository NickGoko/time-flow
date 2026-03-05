import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useCurrentUser } from '@/contexts/UserContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { toast } from 'sonner';
import { 
  TimeEntry, 
  WeekStatus, 
  TimeEntryWithDetails, 
  WeekSummary, 
  DailyTotal,
  toTotalMinutes,
  isTravelExempt,
} from '@/types';
import { 
  timeEntries as seedTimeEntries, 
  weekStatuses as seedWeekStatuses, 
  getEntryWithDetails,
  getWeekDate,
  getWeekStart,
  parseLocalDate,
  toLocalDateString,
} from '@/data/seed';

export interface WeeklyTotal {
  weekStart: string;
  totalMinutes: number;
  billableMinutes: number;
  maybeBillableMinutes: number;
  notBillableMinutes: number;
}

export interface DayHistoryRow {
  date: string;
  totalMinutes: number;
  billableMinutes: number;
  billablePercent: number;
  isSubmitted: boolean | null;
}

interface TimeEntriesContextType {
  getOwnEntries: () => TimeEntry[];
  getAllEntries: () => TimeEntry[];
  weekStatuses: WeekStatus[];
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesForWeek: (userId: string, weekStart: string) => TimeEntryWithDetails[];
  getWeekSummary: (userId: string, weekStart: string) => WeekSummary;
  getDailyTotals: (userId: string, weekStart: string) => DailyTotal[];
  getDailyTotalMinutes: (userId: string, date: string) => number;
  getDailyNonTravelMinutes: (userId: string, date: string) => number;
  submitWeek: (userId: string, weekStart: string) => void;
  isWeekSubmitted: (userId: string, weekStart: string) => boolean;
  getWeeklyTotals: (userId: string, numberOfWeeks: number) => WeeklyTotal[];
  getRecentDays: (userId: string, numberOfDays: number) => DayHistoryRow[];
}

const TimeEntriesContext = createContext<TimeEntriesContextType | undefined>(undefined);

export function TimeEntriesProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useCurrentUser();
  const [entries, setEntries] = useState<TimeEntry[]>(seedTimeEntries);
  const [weekStatuses, setWeekStatuses] = useState<WeekStatus[]>(seedWeekStatuses);

  const assertOwnership = (userId: string, action: string) => {
    if (currentUser && userId !== currentUser.id) {
      console.error(`[TimeEntries] ${action} blocked: userId "${userId}" does not match current user "${currentUser.id}"`);
      return false;
    }
    return true;
  };

  const { getDeliverablesForDepartment } = useReferenceData();

  const addEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!currentUser) return;

    // Validate deliverable belongs to user's department
    const allowed = getDeliverablesForDepartment(currentUser.departmentId);
    if (!allowed.some(d => d.id === entry.deliverableType)) {
      toast.error('Deliverable type is not allowed for your department.');
      return;
    }

    const newEntry: TimeEntry = {
      ...entry,
      userId: currentUser.id,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries(prev => [...prev, newEntry]);
  }, [currentUser, getDeliverablesForDepartment]);

  const updateEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    const { userId: _strip, ...safeUpdates } = updates;

    // Validate deliverable if being changed
    if (safeUpdates.deliverableType && currentUser) {
      const allowed = getDeliverablesForDepartment(currentUser.departmentId);
      if (!allowed.some(d => d.id === safeUpdates.deliverableType)) {
        toast.error('Deliverable type is not allowed for your department.');
        return;
      }
    }

    setEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (existing && !assertOwnership(existing.userId, 'updateEntry')) return prev;
      return prev.map(entry =>
        entry.id === id
          ? { ...entry, ...safeUpdates, updatedAt: new Date().toISOString() }
          : entry
      );
    });
  }, [currentUser, getDeliverablesForDepartment]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const existing = prev.find(e => e.id === id);
      if (existing && !assertOwnership(existing.userId, 'deleteEntry')) return prev;
      return prev.filter(entry => entry.id !== id);
    });
  }, [currentUser]);
  

  const getEntriesForWeek = useCallback(
    (userId: string, weekStart: string): TimeEntryWithDetails[] => {
      const weekDates = Array.from({ length: 7 }, (_, i) => getWeekDate(weekStart, i));
      
      return entries
        .filter(entry => entry.userId === userId && weekDates.includes(entry.date))
        .map(entry => getEntryWithDetails(entry))
        .filter((entry): entry is TimeEntryWithDetails => entry !== null);
    },
    [entries]
  );

  const getWeekSummary = useCallback(
    (userId: string, weekStart: string): WeekSummary => {
      const weekEntries = getEntriesForWeek(userId, weekStart);
      
      const entriesByDay: Record<string, TimeEntryWithDetails[]> = {};
      
      for (let i = 0; i < 7; i++) {
        const date = getWeekDate(weekStart, i);
        entriesByDay[date] = weekEntries.filter(e => e.date === date);
      }

      const getTotalMinutes = (entry: TimeEntryWithDetails) => 
        toTotalMinutes(entry.hours, entry.minutes);

      const totalMinutes = weekEntries.reduce((sum, e) => sum + getTotalMinutes(e), 0);
      const billableMinutes = weekEntries
        .filter(e => e.billableStatus === 'billable')
        .reduce((sum, e) => sum + getTotalMinutes(e), 0);
      const notBillableMinutes = weekEntries
        .filter(e => e.billableStatus === 'not_billable')
        .reduce((sum, e) => sum + getTotalMinutes(e), 0);

      const status = weekStatuses.find(
        ws => ws.userId === userId && ws.weekStartDate === weekStart
      ) || null;

      return {
        weekStartDate: weekStart,
        totalMinutes,
        billableMinutes,
        notBillableMinutes,
        entriesByDay,
        status,
      };
    },
    [getEntriesForWeek, weekStatuses]
  );

  const getDailyTotals = useCallback(
    (userId: string, weekStart: string): DailyTotal[] => {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekEntries = getEntriesForWeek(userId, weekStart);
      
      return Array.from({ length: 7 }, (_, i) => {
        const date = getWeekDate(weekStart, i);
        const dayEntries = weekEntries.filter(e => e.date === date);
        const totalMinutes = dayEntries.reduce(
          (sum, e) => sum + toTotalMinutes(e.hours, e.minutes), 
          0
        );
        
        return {
          date,
          dayName: dayNames[i],
          totalMinutes,
          entries: dayEntries,
        };
      });
    },
    [getEntriesForWeek]
  );

  const getDailyTotalMinutes = useCallback(
    (userId: string, date: string): number => {
      return entries
        .filter(entry => entry.userId === userId && entry.date === date)
        .reduce((sum, entry) => sum + toTotalMinutes(entry.hours, entry.minutes), 0);
    },
    [entries]
  );

  const getDailyNonTravelMinutes = useCallback(
    (userId: string, date: string): number => {
      return entries
        .filter(entry => entry.userId === userId && entry.date === date)
        .filter(entry => !isTravelExempt(entry.activityTypeId) && !isTravelExempt(entry.workAreaActivityTypeId))
        .reduce((sum, entry) => sum + toTotalMinutes(entry.hours, entry.minutes), 0);
    },
    [entries]
  );

  const submitWeek = useCallback((userId: string, weekStart: string) => {
    if (!assertOwnership(userId, 'submitWeek')) return;
    const existingIndex = weekStatuses.findIndex(
      ws => ws.userId === userId && ws.weekStartDate === weekStart
    );

    if (existingIndex >= 0) {
      setWeekStatuses(prev =>
        prev.map((ws, i) =>
          i === existingIndex
            ? { ...ws, isSubmitted: true, submittedAt: new Date().toISOString() }
            : ws
        )
      );
    } else {
      setWeekStatuses(prev => [
        ...prev,
        {
          userId,
          weekStartDate: weekStart,
          isSubmitted: true,
          submittedAt: new Date().toISOString(),
          isLocked: false,
        },
      ]);
    }
  }, [weekStatuses]);

  const isWeekSubmitted = useCallback(
    (userId: string, weekStart: string): boolean => {
      const status = weekStatuses.find(
        ws => ws.userId === userId && ws.weekStartDate === weekStart
      );
      return status?.isSubmitted ?? false;
    },
    [weekStatuses]
  );

  const getWeeklyTotals = useCallback(
    (userId: string, numberOfWeeks: number): WeeklyTotal[] => {
      const result: WeeklyTotal[] = [];
      const now = new Date();
      const currentWs = getWeekStart(now);

      for (let i = numberOfWeeks - 1; i >= 0; i--) {
        const d = parseLocalDate(currentWs);
        d.setDate(d.getDate() - i * 7);
        const ws = toLocalDateString(d);
        const weekDates = Array.from({ length: 7 }, (_, j) => getWeekDate(ws, j));
        const weekEntries = entries.filter(
          e => e.userId === userId && weekDates.includes(e.date)
        );

        let totalMinutes = 0;
        let billableMinutes = 0;
        let maybeBillableMinutes = 0;
        let notBillableMinutes = 0;

        for (const e of weekEntries) {
          const mins = toTotalMinutes(e.hours, e.minutes);
          totalMinutes += mins;
          if (e.billableStatus === 'billable') billableMinutes += mins;
          else if (e.billableStatus === 'maybe_billable') maybeBillableMinutes += mins;
          else notBillableMinutes += mins;
        }

        result.push({ weekStart: ws, totalMinutes, billableMinutes, maybeBillableMinutes, notBillableMinutes });
      }
      return result;
    },
    [entries]
  );

  const getRecentDays = useCallback(
    (userId: string, numberOfDays: number): DayHistoryRow[] => {
      const result: DayHistoryRow[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < numberOfDays; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = toLocalDateString(d);
        const dayEntries = entries.filter(e => e.userId === userId && e.date === dateStr);
        if (dayEntries.length === 0) continue;

        let totalMinutes = 0;
        let billableMinutes = 0;
        for (const e of dayEntries) {
          const mins = toTotalMinutes(e.hours, e.minutes);
          totalMinutes += mins;
          if (e.billableStatus === 'billable') billableMinutes += mins;
        }

        const ws = getWeekStart(d);
        const status = weekStatuses.find(
          s => s.userId === userId && s.weekStartDate === ws
        );

        result.push({
          date: dateStr,
          totalMinutes,
          billableMinutes,
          billablePercent: totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0,
          isSubmitted: status?.isSubmitted ?? null,
        });
      }
      return result;
    },
    [entries, weekStatuses]
  );

  const getOwnEntries = useCallback(
    () => entries.filter(e => e.userId === currentUser?.id),
    [entries, currentUser],
  );

  const getAllEntries = useCallback(() => {
    if (currentUser && currentUser.appRole !== 'admin') {
      console.warn('[TimeEntries] getAllEntries called by non-admin user');
    }
    return entries;
  }, [entries, currentUser]);

  return (
    <TimeEntriesContext.Provider
      value={{
        getOwnEntries,
        getAllEntries,
        weekStatuses,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntriesForWeek,
        getWeekSummary,
        getDailyTotals,
        getDailyTotalMinutes,
        getDailyNonTravelMinutes,
        submitWeek,
        isWeekSubmitted,
        getWeeklyTotals,
        getRecentDays,
      }}
    >
      {children}
    </TimeEntriesContext.Provider>
  );
}

export function useTimeEntries() {
  const context = useContext(TimeEntriesContext);
  if (context === undefined) {
    throw new Error('useTimeEntries must be used within a TimeEntriesProvider');
  }
  return context;
}
