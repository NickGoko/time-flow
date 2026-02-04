import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { getWeekStart, getWeekDate } from '@/data/seed';
import { formatDuration, getBillableLabel, toTotalMinutes } from '@/types';

interface ExportButtonProps {
  weekStart?: string;
}

export function ExportButton({ weekStart = getWeekStart() }: ExportButtonProps) {
  const { currentUser } = useCurrentUser();
  const { getEntriesForWeek, getDailyTotals } = useTimeEntries();

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportRawCSV = () => {
    const entries = getEntriesForWeek(currentUser.id, weekStart);
    
    const headers = [
      'Date',
      'Project Code',
      'Project Name',
      'Phase',
      'Activity Type',
      'Task Description',
      'Deliverable Type',
      'Deliverable Description',
      'Hours',
      'Minutes',
      'Duration (hours)',
      'Billable Status',
      'Comments',
    ];

    const rows = entries.map(entry => {
      const totalMins = toTotalMinutes(entry.hours, entry.minutes);
      return [
        entry.date,
        entry.project.code,
        entry.project.name,
        entry.phase.name,
        entry.activityType.name,
        `"${entry.taskDescription.replace(/"/g, '""')}"`,
        entry.deliverableType,
        `"${(entry.deliverableDescription || '').replace(/"/g, '""')}"`,
        entry.hours.toString(),
        entry.minutes.toString(),
        (totalMins / 60).toFixed(2),
        getBillableLabel(entry.billableStatus),
        `"${(entry.comments || '').replace(/"/g, '""')}"`,
      ];
    });

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const endDate = getWeekDate(weekStart, 6);
    downloadCSV(csv, `timesheet-raw-${weekStart}-to-${endDate}.csv`);
  };

  const exportTimesheetCSV = () => {
    const dailyTotals = getDailyTotals(currentUser.id, weekStart);
    const entries = getEntriesForWeek(currentUser.id, weekStart);
    
    // Group entries by project
    const projectTotals = entries.reduce((acc, entry) => {
      const totalMins = toTotalMinutes(entry.hours, entry.minutes);
      
      if (!acc[entry.projectId]) {
        acc[entry.projectId] = {
          project: entry.project,
          days: [0, 0, 0, 0, 0, 0, 0],
          total: 0,
        };
      }
      const dayIndex = dailyTotals.findIndex(d => d.date === entry.date);
      if (dayIndex >= 0) {
        acc[entry.projectId].days[dayIndex] += totalMins;
        acc[entry.projectId].total += totalMins;
      }
      return acc;
    }, {} as Record<string, { 
      project: typeof entries[0]['project'], 
      days: number[], 
      total: number 
    }>);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const headers = [
      'Project Code',
      'Project Name',
      ...dayNames.map((d, i) => `${d} (${new Date(dailyTotals[i].date).getDate()})`),
      'Total',
    ];

    const rows = Object.values(projectTotals).map(pt => [
      pt.project.code,
      pt.project.name,
      ...pt.days.map(d => (d / 60).toFixed(2)),
      (pt.total / 60).toFixed(2),
    ]);

    // Add totals row
    const dailyTotalsRow = [
      '',
      'Daily Total',
      ...dailyTotals.map(d => (d.totalMinutes / 60).toFixed(2)),
      (dailyTotals.reduce((sum, d) => sum + d.totalMinutes, 0) / 60).toFixed(2),
    ];

    const csv = [
      `Employee: ${currentUser.name}`,
      `Week: ${weekStart}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
      dailyTotalsRow.join(','),
    ].join('\n');

    const endDate = getWeekDate(weekStart, 6);
    downloadCSV(csv, `timesheet-finance-${weekStart}-to-${endDate}.csv`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportRawCSV}>
          <div className="flex flex-col">
            <span>Raw data (CSV)</span>
            <span className="text-xs text-muted-foreground">All entries with details</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportTimesheetCSV}>
          <div className="flex flex-col">
            <span>Timesheet format (CSV)</span>
            <span className="text-xs text-muted-foreground">Grid view for Finance</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
