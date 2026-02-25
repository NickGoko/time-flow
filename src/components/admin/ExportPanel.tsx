import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, ChevronDown } from 'lucide-react';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { getBillableLabel, getDeliverableLabel, getWorkstreamTypeLabel } from '@/types';

function escapeCSV(value: string): string {
  if (!value) return '';
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

export function ExportPanel() {
  const { getAllEntries } = useTimeEntries();
  const { departments, projects, phases, activityTypes, internalWorkAreas } = useReferenceData();
  const { allUsersList } = useAuthenticatedUser();

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(toDateStr(firstOfMonth));
  const [endDate, setEndDate] = useState(toDateStr(today));
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    () => new Set(allUsersList.map(u => u.id)),
  );

  const allEntries = getAllEntries();

  const filteredEntries = useMemo(
    () =>
      allEntries.filter(
        e => e.date >= startDate && e.date <= endDate && selectedUserIds.has(e.userId),
      ),
    [allEntries, startDate, endDate, selectedUserIds],
  );

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedUserIds.size === allUsersList.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(allUsersList.map(u => u.id)));
    }
  };

  const selectedLabel =
    selectedUserIds.size === allUsersList.length
      ? 'All users'
      : selectedUserIds.size === 0
        ? 'No users'
        : `${selectedUserIds.size} user${selectedUserIds.size > 1 ? 's' : ''}`;

  const handleExport = () => {
    const headers = [
      'Date', 'User', 'Department', 'Workstream', 'Workstream Type',
      'Phase', 'Activity Type', 'Task Description', 'Deliverable Type',
      'Deliverable Description', 'Hours', 'Billable Status', 'Comments',
    ];

    const rows = filteredEntries.map(entry => {
      const user = allUsersList.find(u => u.id === entry.userId);
      const dept = user ? departments.find(d => d.id === user.departmentId) : undefined;
      const project = projects.find(p => p.id === entry.projectId);

      let phaseName = '';
      let activityName = '';

      if (entry.phaseId) {
        phaseName = phases.find(p => p.id === entry.phaseId)?.name ?? '';
      }
      if (entry.activityTypeId) {
        activityName = activityTypes.find(a => a.id === entry.activityTypeId)?.name ?? '';
      }
      if (entry.workAreaId) {
        const wa = internalWorkAreas.find(w => w.id === entry.workAreaId);
        if (wa) {
          phaseName = phases.find(p => p.id === wa.phaseId)?.name ?? '';
        }
      }
      if (entry.workAreaActivityTypeId) {
        activityName = activityTypes.find(a => a.id === entry.workAreaActivityTypeId)?.name ?? '';
      }

      const hoursDecimal = ((entry.hours * 60 + entry.minutes) / 60).toFixed(2);

      return [
        entry.date,
        user?.name ?? '',
        dept?.name ?? '',
        project?.name ?? '',
        project ? getWorkstreamTypeLabel(project.type) : '',
        phaseName,
        activityName,
        entry.taskDescription,
        getDeliverableLabel(entry.deliverableType),
        entry.deliverableDescription ?? '',
        hoursDecimal,
        getBillableLabel(entry.billableStatus),
        entry.comments ?? '',
      ].map(escapeCSV);
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-entries-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Users</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal">
                {selectedLabel}
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <ScrollArea className="max-h-64">
                <div className="p-2 space-y-1">
                  <label className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm">
                    <Checkbox
                      checked={selectedUserIds.size === allUsersList.length}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-sm font-medium">Select all</span>
                  </label>
                  <div className="border-t my-1" />
                  {allUsersList.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    >
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <span className="text-sm">{user.name}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} match
        </p>
        <Button onClick={handleExport} disabled={filteredEntries.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>
    </Card>
  );
}
