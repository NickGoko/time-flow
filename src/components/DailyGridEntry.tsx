import { useState, useMemo, useCallback } from 'react';
import { Plus, Save, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BillableStatus,
  DeliverableType,
  getBillableLabel,
  getDeliverableLabel,
  DELIVERABLE_TYPES,
  BILLABLE_STATUSES,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  MAX_DAILY_MINUTES,
  MAX_DAILY_HOURS,
  toTotalMinutes,
  formatHours,
} from '@/types';
import { projects, phases, getActivitiesForPhase, parseLocalDate } from '@/data/seed';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { Lock } from 'lucide-react';

interface GridRow {
  id: string;
  projectId: string;
  phaseId: string;
  activityTypeId: string;
  taskDescription: string;
  deliverableType: DeliverableType | '';
  deliverableDescription: string;
  hours: number;
  minutes: number;
  billableStatus: BillableStatus;
  errors: Record<string, string>;
}

const createEmptyRow = (): GridRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  projectId: '',
  phaseId: '',
  activityTypeId: '',
  taskDescription: '',
  deliverableType: '',
  deliverableDescription: '',
  hours: 0,
  minutes: 0,
  billableStatus: 'billable',
  errors: {},
});

interface DailyGridEntryProps {
  selectedDate: string;
  disabled: boolean;
}

export function DailyGridEntry({ selectedDate, disabled }: DailyGridEntryProps) {
  const { currentUser } = useCurrentUser();
  const { addEntry, getDailyTotalMinutes } = useTimeEntries();
  const [rows, setRows] = useState<GridRow[]>([createEmptyRow()]);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const existingMinutes = getDailyTotalMinutes(currentUser.id, selectedDate);

  const formattedDate = parseLocalDate(selectedDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const updateRow = useCallback((rowId: string, field: keyof GridRow, value: any) => {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      const updated = { ...row, [field]: value, errors: { ...row.errors } };
      delete updated.errors[field];

      // Reset activity when phase changes
      if (field === 'phaseId') {
        updated.activityTypeId = '';
      }
      // Set default billable from project
      if (field === 'projectId') {
        const project = projects.find(p => p.id === value);
        if (project) updated.billableStatus = project.defaultBillableStatus;
      }
      return updated;
    }));
    setGlobalError(null);
  }, []);

  const addRow = useCallback(() => {
    setRows(prev => [...prev, createEmptyRow()]);
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setRows(prev => prev.length <= 1 ? [createEmptyRow()] : prev.filter(r => r.id !== rowId));
  }, []);

  const isRowEmpty = (row: GridRow) =>
    !row.projectId && !row.phaseId && !row.activityTypeId &&
    !row.taskDescription.trim() && !row.deliverableType &&
    !row.deliverableDescription.trim() &&
    row.hours === 0 && row.minutes === 0;

  const validateAndSave = () => {
    const nonEmptyRows = rows.filter(r => !isRowEmpty(r));
    if (nonEmptyRows.length === 0) {
      setGlobalError('Add at least one entry before saving.');
      return;
    }

    let hasErrors = false;
    const newRows = rows.map(row => {
      if (isRowEmpty(row)) return row;
      const errors: Record<string, string> = {};
      if (!row.projectId) errors.projectId = 'Required';
      if (!row.phaseId) errors.phaseId = 'Required';
      if (!row.activityTypeId) errors.activityTypeId = 'Required';
      if (!row.taskDescription.trim()) errors.taskDescription = 'Required';
      if (!row.deliverableType) errors.deliverableType = 'Required';
      if (row.hours === 0 && row.minutes === 0) errors.duration = 'Must be > 0';
      if (Object.keys(errors).length > 0) hasErrors = true;
      return { ...row, errors };
    });

    // Daily cap check
    const gridTotalMinutes = nonEmptyRows.reduce(
      (sum, r) => sum + toTotalMinutes(r.hours, r.minutes), 0
    );
    if (existingMinutes + gridTotalMinutes > MAX_DAILY_MINUTES) {
      hasErrors = true;
      setGlobalError(
        `Daily total would be ${formatHours(existingMinutes + gridTotalMinutes)}h, ` +
        `exceeding the ${MAX_DAILY_HOURS}h cap. You have ${formatHours(MAX_DAILY_MINUTES - existingMinutes)}h remaining.`
      );
    }

    if (hasErrors) {
      setRows(newRows);
      return;
    }

    // Save all non-empty rows
    for (const row of nonEmptyRows) {
      addEntry({
        userId: currentUser.id,
        projectId: row.projectId,
        phaseId: row.phaseId,
        activityTypeId: row.activityTypeId,
        taskDescription: row.taskDescription.trim(),
        deliverableType: row.deliverableType as DeliverableType,
        deliverableDescription: row.deliverableDescription.trim() || undefined,
        date: selectedDate,
        hours: row.hours,
        minutes: row.minutes,
        billableStatus: row.billableStatus,
      });
    }

    setRows([createEmptyRow()]);
    setGlobalError(null);
  };

  if (disabled) {
    return (
      <div className="flex items-center gap-2 py-6 justify-center text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>This week is locked — grid entry is disabled</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sticky date header */}
      <div className="sticky top-0 z-10 bg-card py-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs sm:text-sm font-medium">{formattedDate}</Badge>
          <span className="text-xs text-muted-foreground">
            Logged: {formatHours(existingMinutes)}h / {MAX_DAILY_HOURS}h
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addRow} className="gap-1 flex-1 sm:flex-initial">
            <Plus className="h-3.5 w-3.5" /> Add entry
          </Button>
          <Button size="sm" onClick={validateAndSave} className="gap-1 flex-1 sm:flex-initial">
            <Save className="h-3.5 w-3.5" /> Save all
          </Button>
        </div>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Grid rows */}
      <div className="space-y-4">
        {rows.map((row, idx) => (
          <GridRowEntry
            key={row.id}
            row={row}
            index={idx}
            onUpdate={updateRow}
            onRemove={removeRow}
            canRemove={rows.length > 1}
          />
        ))}
      </div>
    </div>
  );
}

interface GridRowEntryProps {
  row: GridRow;
  index: number;
  onUpdate: (rowId: string, field: keyof GridRow, value: any) => void;
  onRemove: (rowId: string) => void;
  canRemove: boolean;
}

function GridRowEntry({ row, index, onUpdate, onRemove, canRemove }: GridRowEntryProps) {
  const activities = useMemo(() => {
    if (!row.phaseId) return [];
    return getActivitiesForPhase(row.phaseId);
  }, [row.phaseId]);

  const hasErrors = Object.keys(row.errors).length > 0;

  return (
    <div className={`p-4 rounded-lg border ${hasErrors ? 'border-destructive/40 bg-destructive/5' : 'border-border bg-card'} space-y-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Row {index + 1}</span>
        {canRemove && (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onRemove(row.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Project */}
        <div>
          <Select value={row.projectId} onValueChange={v => onUpdate(row.id, 'projectId', v)}>
            <SelectTrigger className={row.errors.projectId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Project *" />
            </SelectTrigger>
            <SelectContent>
              {projects.filter(p => p.isActive).map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {row.errors.projectId && <p className="text-xs text-destructive mt-1">{row.errors.projectId}</p>}
        </div>

        {/* Phase */}
        <div>
          <Select value={row.phaseId} onValueChange={v => onUpdate(row.id, 'phaseId', v)}>
            <SelectTrigger className={row.errors.phaseId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Phase *" />
            </SelectTrigger>
            <SelectContent>
              {phases.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {row.errors.phaseId && <p className="text-xs text-destructive mt-1">{row.errors.phaseId}</p>}
        </div>

        {/* Activity */}
        <div>
          <Select value={row.activityTypeId} onValueChange={v => onUpdate(row.id, 'activityTypeId', v)} disabled={!row.phaseId}>
            <SelectTrigger className={row.errors.activityTypeId ? 'border-destructive' : ''}>
              <SelectValue placeholder={row.phaseId ? 'Activity *' : 'Select phase first'} />
            </SelectTrigger>
            <SelectContent>
              {activities.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {row.errors.activityTypeId && <p className="text-xs text-destructive mt-1">{row.errors.activityTypeId}</p>}
        </div>

        {/* Task Description */}
        <div className="sm:col-span-2 lg:col-span-2">
          <Input
            placeholder="Task description *"
            value={row.taskDescription}
            onChange={e => onUpdate(row.id, 'taskDescription', e.target.value)}
            className={row.errors.taskDescription ? 'border-destructive' : ''}
          />
          {row.errors.taskDescription && <p className="text-xs text-destructive mt-1">{row.errors.taskDescription}</p>}
        </div>

        {/* Deliverable Type */}
        <div>
          <Select value={row.deliverableType} onValueChange={v => onUpdate(row.id, 'deliverableType', v)}>
            <SelectTrigger className={row.errors.deliverableType ? 'border-destructive' : ''}>
              <SelectValue placeholder="Deliverable *" />
            </SelectTrigger>
            <SelectContent>
              {DELIVERABLE_TYPES.map(t => (
                <SelectItem key={t} value={t}>{getDeliverableLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {row.errors.deliverableType && <p className="text-xs text-destructive mt-1">{row.errors.deliverableType}</p>}
        </div>

        {/* Deliverable Description (optional) */}
        <div className="sm:col-span-2 lg:col-span-3">
          <Input
            placeholder="Deliverable description (optional)"
            value={row.deliverableDescription}
            onChange={e => onUpdate(row.id, 'deliverableDescription', e.target.value)}
          />
        </div>

        {/* Hours */}
        <div>
          <Select value={row.hours.toString()} onValueChange={v => onUpdate(row.id, 'hours', parseInt(v, 10))}>
            <SelectTrigger className={row.errors.duration ? 'border-destructive' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HOUR_OPTIONS.map(h => (
                <SelectItem key={h} value={h.toString()}>{h} {h === 1 ? 'hour' : 'hours'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minutes */}
        <div>
          <Select value={row.minutes.toString()} onValueChange={v => onUpdate(row.id, 'minutes', parseInt(v, 10))}>
            <SelectTrigger className={row.errors.duration ? 'border-destructive' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINUTE_OPTIONS.map(m => (
                <SelectItem key={m} value={m.toString()}>{m} min</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {row.errors.duration && <p className="text-xs text-destructive mt-1">{row.errors.duration}</p>}
        </div>

        {/* Billable */}
        <div>
          <Select value={row.billableStatus} onValueChange={v => onUpdate(row.id, 'billableStatus', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BILLABLE_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{getBillableLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
