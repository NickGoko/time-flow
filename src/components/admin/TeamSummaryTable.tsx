import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Minus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { deriveTeamSummary } from '@/data/reportsMockData';
import { formatDuration, TimeEntry, User, WeekStatus } from '@/types';
import { TeamMemberSummary } from '@/types/reports';
import { RangeOption, getExpectedMinutes } from '@/hooks/useDashboardDataset';

type SortKey = 'userName' | 'totalMinutes' | 'registeredPercent' | 'billablePercent' | 'maybeBillableMinutes' | 'weekSubmitted';
type SortDir = 'asc' | 'desc';

interface Props {
  weekStart: string;
  days: number;
  range: RangeOption;
  entries: TimeEntry[];
  users: User[];
  weekStatuses: WeekStatus[];
}

export function TeamSummaryTable({ weekStart, days, range, entries, users, weekStatuses }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('totalMinutes');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const expectedMinutes = useMemo(() => getExpectedMinutes(range, days), [range, days]);

  const rows = useMemo(
    () => deriveTeamSummary(entries, weekStart, days, users, weekStatuses, expectedMinutes),
    [entries, weekStart, days, users, weekStatuses, expectedMinutes],
  );

  const sortedRows = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'userName') cmp = a.userName.localeCompare(b.userName);
      else if (sortKey === 'weekSubmitted') cmp = (a.weekSubmitted ? 1 : 0) - (b.weekSubmitted ? 1 : 0);
      else cmp = (a[sortKey] as number) - (b[sortKey] as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'userName' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="inline-block ml-1 h-3 w-3 text-muted-foreground" />;
    return sortDir === 'asc'
      ? <ArrowUp className="inline-block ml-1 h-3 w-3" />
      : <ArrowDown className="inline-block ml-1 h-3 w-3" />;
  };

  const isMySummary = users.length === 1;

  return (
    <Card className="border-border bg-card rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {isMySummary ? 'My summary' : 'Team summary'}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('userName')}>
              User <SortIcon col="userName" />
            </TableHead>
            <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('totalMinutes')}>
              Hours <SortIcon col="totalMinutes" />
            </TableHead>
            <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('registeredPercent')}>
              Registered % <SortIcon col="registeredPercent" />
            </TableHead>
            <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('billablePercent')}>
              Billable % <SortIcon col="billablePercent" />
            </TableHead>
            <TableHead className="text-right cursor-pointer select-none" onClick={() => toggleSort('maybeBillableMinutes')}>
              Maybe billable <SortIcon col="maybeBillableMinutes" />
            </TableHead>
            <TableHead className="text-center cursor-pointer select-none" onClick={() => toggleSort('weekSubmitted')}>
              Week submitted? <SortIcon col="weekSubmitted" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRows.map(row => (
            <TableRow key={row.userId}>
              <TableCell className="font-medium">{row.userName}</TableCell>
              <TableCell className="text-right">{formatDuration(row.totalMinutes)}</TableCell>
              <TableCell className="text-right">
                <span>{row.registeredPercent}%</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  ({formatDuration(row.totalMinutes)} of {formatDuration(row.expectedMinutes)})
                </span>
              </TableCell>
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
