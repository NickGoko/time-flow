import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Minus } from 'lucide-react';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { deriveTeamSummary } from '@/data/reportsMockData';
import { formatDuration } from '@/types';

interface Props {
  weekStart: string;
  days: number;
}

export function TeamSummaryTable({ weekStart, days }: Props) {
  const { entries, weekStatuses } = useTimeEntries();
  const { allUsers } = useAuthenticatedUser();

  const rows = useMemo(
    () => deriveTeamSummary(entries, weekStart, days, allUsers, weekStatuses),
    [entries, weekStart, days, allUsers, weekStatuses],
  );

  return (
    <Card className="border-border bg-card rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Team Summary</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Hours</TableHead>
            <TableHead className="text-right">Compliance %</TableHead>
            <TableHead className="text-right">Billable %</TableHead>
            <TableHead className="text-right">Maybe billable</TableHead>
            <TableHead className="text-center">Week submitted?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.userId}>
              <TableCell className="font-medium">{row.userName}</TableCell>
              <TableCell className="text-right">{formatDuration(row.totalMinutes)}</TableCell>
              <TableCell className="text-right">{Math.min(row.compliancePercent, 100)}%</TableCell>
              <TableCell className="text-right">{row.billablePercent}%</TableCell>
              <TableCell className="text-right">{formatDuration(row.maybeBillableMinutes)}</TableCell>
              <TableCell className="text-center">
                {row.weekSubmitted ? (
                  <Check className="inline-block h-4 w-4 text-green-600" />
                ) : (
                  <Minus className="inline-block h-4 w-4 text-muted-foreground" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
