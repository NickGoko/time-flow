import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { 
  TimeEntry, 
  WeekStatus, 
  TimeEntryWithDetails, 
  WeekSummary, 
  DailyTotal,
  toTotalMinutes,
} from '@/types';
import { 
  timeEntries as seedTimeEntries, 
  weekStatuses as seedWeekStatuses, 
  getEntryWithDetails,
  getWeekDate 
} from '@/data/seed';

interface TimeEntriesContextType {
  entries: TimeEntry[];
  weekStatuses: WeekStatus[];
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesForWeek: (userId: string, weekStart: string) => TimeEntryWithDetails[];
  getWeekSummary: (userId: string, weekStart: string) => WeekSummary;
  getDailyTotals: (userId: string, weekStart: string) => DailyTotal[];
  submitWeek: (userId: string, weekStart: string) => void;
  isWeekSubmitted: (userId: string, weekStart: string) => boolean;
}

const TimeEntriesContext = createContext<TimeEntriesContextType | undefined>(undefined);

export function TimeEntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TimeEntry[]>(seedTimeEntries);
  const [weekStatuses, setWeekStatuses] = useState<WeekStatus[]>(seedWeekStatuses);

  const addEntry = useCallback((entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries(prev => [...prev, newEntry]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    setEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

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

  const submitWeek = useCallback((userId: string, weekStart: string) => {
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

  return (
    <TimeEntriesContext.Provider
      value={{
        entries,
        weekStatuses,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntriesForWeek,
        getWeekSummary,
        getDailyTotals,
        submitWeek,
        isWeekSubmitted,
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
