import { useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { MetricCards } from '@/components/admin/MetricCards';
import { WeeklyChart } from '@/components/admin/WeeklyChart';
import { CohortWidget } from '@/components/admin/CohortWidget';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { deriveMetrics } from '@/data/reportsMockData';
import { getWeekStart } from '@/data/seed';

export default function AdminReportsOverview() {
  const { entries } = useTimeEntries();

  const metrics = useMemo(
    () => deriveMetrics(entries, getWeekStart(), 7),
    [entries],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Reports Overview</h1>
          <Badge variant="secondary">Preview</Badge>
        </div>

        <div className="mt-6 space-y-6">
          <MetricCards metrics={metrics} />
          <WeeklyChart />
          <CohortWidget />
        </div>
      </main>
    </div>
  );
}
