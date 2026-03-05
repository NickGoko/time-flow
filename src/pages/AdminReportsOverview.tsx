import { useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricCards } from '@/components/admin/MetricCards';
import { WeeklyChart } from '@/components/admin/WeeklyChart';
import { CohortWidget } from '@/components/admin/CohortWidget';
import { TeamSummaryTable } from '@/components/admin/TeamSummaryTable';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { deriveMetrics, deriveOperationalInsights } from '@/data/reportsMockData';
import { getWeekStart } from '@/data/seed';
import { departments } from '@/data/seed';
import { formatDuration } from '@/types';
import { AlertTriangle, Clock, HelpCircle, ShieldAlert } from 'lucide-react';

type RangeOption = 'this_week' | 'last_week' | 'this_month';
type ScopeOption = 'my' | 'department' | 'org';

export default function AdminReportsOverview() {
  const { getAllEntries, weekStatuses } = useTimeEntries();
  const entries = getAllEntries();
  const { currentUser, allUsers, appRole } = useAuthenticatedUser();
  const [range, setRange] = useState<RangeOption>('this_week');

  // RBAC: determine available scopes
  const canViewDepartment = ['hod', 'leadership', 'admin', 'super_admin'].includes(appRole ?? '');
  const canViewOrg = ['leadership', 'admin', 'super_admin'].includes(appRole ?? '');

  const defaultScope: ScopeOption = canViewOrg ? 'org' : canViewDepartment ? 'department' : 'my';
  const [scope, setScope] = useState<ScopeOption>(defaultScope);

  // Department selector for department scope
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

  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    availableDepartments.length > 0 ? availableDepartments[0].id : '',
  );

  // Scoped filtering
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

  const { weekStart, days } = useMemo(() => {
    const now = new Date();
    if (range === 'this_week') return { weekStart: getWeekStart(now), days: 7 };
    if (range === 'last_week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { weekStart: getWeekStart(d), days: 7 };
    }
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayCount = now.getDate();
    return { weekStart: getWeekStart(first), days: Math.min(dayCount + (first.getDay() === 0 ? 6 : first.getDay() - 1), 35) };
  }, [range]);

  const metrics = useMemo(() => deriveMetrics(scopedEntries, weekStart, days), [scopedEntries, weekStart, days]);
  const insights = useMemo(
    () => deriveOperationalInsights(scopedEntries, weekStart, days, scopedUsers, scopedWeekStatuses),
    [scopedEntries, weekStart, days, scopedUsers, scopedWeekStatuses],
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Reports Overview</h1>
          <Badge variant="secondary">Preview</Badge>
        </div>

        {/* Scope selector */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            <Button size="sm" variant={scope === 'my' ? 'default' : 'outline'} onClick={() => setScope('my')}>
              My
            </Button>
            {canViewDepartment && (
              <Button size="sm" variant={scope === 'department' ? 'default' : 'outline'} onClick={() => setScope('department')}>
                Department
              </Button>
            )}
            {canViewOrg && (
              <Button size="sm" variant={scope === 'org' ? 'default' : 'outline'} onClick={() => setScope('org')}>
                Organisation
              </Button>
            )}
          </div>

          {scope === 'department' && availableDepartments.length > 1 && (
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Range selector */}
        <div className="mt-3 flex gap-1">
          {([['this_week', 'This week'], ['last_week', 'Last week'], ['this_month', 'This month']] as const).map(
            ([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={range === value ? 'default' : 'outline'}
                onClick={() => setRange(value)}
              >
                {label}
              </Button>
            ),
          )}
        </div>

        <div className="mt-6 space-y-6">
          <MetricCards metrics={metrics} />

          {/* Operational insights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Maybe billable</p>
                <p className="text-lg font-semibold">
                  {insights.maybeBillableCount} {insights.maybeBillableCount === 1 ? 'entry' : 'entries'}
                </p>
                <p className="text-xs text-muted-foreground">{formatDuration(insights.maybeBillableMinutes)} total</p>
              </div>
            </Card>
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Data quality</p>
                {insights.backdatedEntryCount > 0 ? (
                  <p className="text-lg font-semibold">
                    {insights.backdatedEntryCount} backdated {insights.backdatedEntryCount === 1 ? 'entry' : 'entries'}
                  </p>
                ) : (
                  <p className="text-lg font-semibold">No flags</p>
                )}
              </div>
            </Card>
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Weeks not submitted</p>
                <p className="text-lg font-semibold">
                  {insights.weeksNotSubmitted} {insights.weeksNotSubmitted === 1 ? 'user' : 'users'}
                </p>
              </div>
            </Card>
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Blocked by cap</p>
                <p className="text-lg font-semibold">{insights.blockedByCap}</p>
                <Badge variant="secondary" className="text-[10px] mt-1">Preview</Badge>
              </div>
            </Card>
          </div>

          <WeeklyChart range={range} entries={scopedEntries} />

          {scope !== 'my' && (
            <TeamSummaryTable
              weekStart={weekStart}
              days={days}
              entries={scopedEntries}
              users={scopedUsers}
              weekStatuses={scopedWeekStatuses}
            />
          )}

          <CohortWidget entries={scopedEntries} users={scopedUsers} />
        </div>
      </main>
    </div>
  );
}
