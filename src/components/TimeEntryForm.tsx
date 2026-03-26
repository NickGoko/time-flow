import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  BillableStatus, 
  getBillableLabel,
  BILLABLE_STATUSES,
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  MAX_DAILY_MINUTES,
  MAX_DAILY_HOURS,
  HOURS_PER_DAY_TARGET,
  MAX_PAST_DAYS,
  toTotalMinutes,
  formatHours,
  isTravelExempt,
  LEAVE_PROJECT_ID,
  ABSENCE_PHASE_ID,
  LEAVE_DAY_ACTIVITY_ID,
} from '@/types';
import { parseLocalDate } from '@/data/seed';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface TimeEntryFormProps {
  selectedDate: string;
  onSuccess?: () => void;
}

export function TimeEntryForm({ selectedDate, onSuccess }: TimeEntryFormProps) {
  const { currentUser } = useAuthenticatedUser();
  const { addEntry, getDailyTotalMinutes, getDailyNonTravelMinutes, getOwnEntries, logCapBlock } = useTimeEntries();
  const { getGroupedWorkstreams, getDepartmentById, getActivitiesForPhase, getPhasesForProject, projects, getDeliverablesForDepartment } = useReferenceData();
  const entries = getOwnEntries();
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Grouped workstreams
  const grouped = useMemo(() => 
    getGroupedWorkstreams(currentUser.departmentId, currentUser.id, entries),
    [currentUser.departmentId, currentUser.id, entries]
  );

  const departmentName = getDepartmentById(currentUser.departmentId)?.name ?? '';

  // Default to internal workstream
  const defaultProjectId = grouped.internal.length > 0 ? grouped.internal[0].id : '';

  // Form state
  const [date, setDate] = useState<Date>(parseLocalDate(selectedDate));
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [phaseId, setPhaseId] = useState('');
  const [activityTypeId, setActivityTypeId] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [deliverableType, setDeliverableType] = useState('');
  const [deliverableDescription, setDeliverableDescription] = useState('');

  // Department-scoped deliverables
  const deptDeliverables = useMemo(
    () => getDeliverablesForDepartment(currentUser.departmentId),
    [currentUser.departmentId, getDeliverablesForDepartment],
  );
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [billableStatus, setBillableStatus] = useState<BillableStatus>(
    projects.find(p => p.id === defaultProjectId)?.defaultBillableStatus ?? 'billable'
  );
  const [comments, setComments] = useState('');

  // Determine selected project type
  const selectedProject = useMemo(() => projects.find(p => p.id === projectId), [projectId]);
  const isInternal = selectedProject?.type === 'internal_department';
  const isLeaveProject = projectId === LEAVE_PROJECT_ID;

  // Get available activities based on selected phase
  const availableActivities = useMemo(() => {
    if (!phaseId) return [];
    return getActivitiesForPhase(phaseId);
  }, [phaseId]);

  // Reset dependent fields when phase changes
  const handlePhaseChange = (value: string) => {
    setPhaseId(value);
    setActivityTypeId('');
  };

  // Set default billable status when project changes
  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const project = projects.find(p => p.id === value);
    if (project) {
      setBillableStatus(project.defaultBillableStatus);
    }
    // Reset phase/activity on project change
    setPhaseId('');
    setActivityTypeId('');
    // Auto-fill for leave project
    if (value === LEAVE_PROJECT_ID) {
      setPhaseId(ABSENCE_PHASE_ID);
      setActivityTypeId(LEAVE_DAY_ACTIVITY_ID);
      setHours(8);
      setMinutes(0);
      setBillableStatus('not_billable');
      // Find dept-specific "Other" deliverable
      const otherDel = deptDeliverables.find(d => d.name === 'Other');
      setDeliverableType(otherDel?.id ?? '');
    } else if (projectId === LEAVE_PROJECT_ID) {
      setHours(0);
      setMinutes(0);
      setDeliverableType('');
    }
  };

  const resetForm = () => {
    setDate(parseLocalDate(selectedDate));
    setProjectId(defaultProjectId);
    setPhaseId('');
    setActivityTypeId('');
    setTaskDescription('');
    setDeliverableType('');
    setDeliverableDescription('');
    setHours(0);
    setMinutes(0);
    setBillableStatus(projects.find(p => p.id === defaultProjectId)?.defaultBillableStatus ?? 'billable');
    setComments('');
    setValidationError(null);
  };

  // Check if adding this entry would exceed daily cap (travel-aware)
  const entryMinutes = toTotalMinutes(hours, minutes);
  const dateStr = format(date, 'yyyy-MM-dd');
  const currentDailyTotal = getDailyTotalMinutes(currentUser.id, dateStr);
  const travelExempt = isTravelExempt(activityTypeId);
  
  // For non-travel entries: check non-travel existing + this entry against cap
  const currentNonTravelTotal = getDailyNonTravelMinutes(currentUser.id, dateStr);
  const wouldExceedCap = !travelExempt && (currentNonTravelTotal + entryMinutes > MAX_DAILY_MINUTES);
  const remainingMinutes = MAX_DAILY_MINUTES - currentNonTravelTotal;

  // Soft warning at daily target (8h) — does not block save
  const overTarget = !travelExempt && (currentNonTravelTotal + entryMinutes > HOURS_PER_DAY_TARGET * 60);

  const isFormValid = 
    projectId && 
    phaseId && 
    (isInternal || activityTypeId) && 
    taskDescription.trim() && 
    deliverableType && 
    (hours > 0 || minutes > 0) &&
    !wouldExceedCap;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wouldExceedCap) {
      logCapBlock(currentUser.id, format(date, 'yyyy-MM-dd'));
      setValidationError(`Daily non-travel total can't exceed ${MAX_DAILY_HOURS}h. You have ${formatHours(remainingMinutes)}h remaining. Only Travel entries may exceed this limit.`);
      return;
    }
    
    setValidationError(null);
    
    if (!isFormValid) return;

    addEntry({
      projectId,
      ...(isInternal
        ? { workAreaId: phaseId, workAreaActivityTypeId: activityTypeId || undefined }
        : { phaseId, activityTypeId, supportDepartmentId: currentUser.departmentId }),
      taskDescription: taskDescription.trim(),
      deliverableType,
      deliverableDescription: deliverableDescription.trim() || undefined,
      date: format(date, 'yyyy-MM-dd'),
      hours,
      minutes,
      billableStatus,
      comments: comments.trim() || undefined,
    });

    resetForm();
    setOpen(false);
    onSuccess?.();
  };

  // Phase/Work area label
  const phaseLabel = isInternal ? 'Work area' : 'Phase';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log time entry</DialogTitle>
            <DialogDescription>
              Record your work activity
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Date */}
            <div className="grid gap-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    weekStartsOn={1}
                    initialFocus
                    disabled={(d) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const earliest = new Date(today);
                      earliest.setDate(earliest.getDate() - MAX_PAST_DAYS);
                      const compare = new Date(d);
                      compare.setHours(0, 0, 0, 0);
                      return compare > today || compare < earliest;
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Workstream (grouped) */}
            <div className="grid gap-2">
              <Label htmlFor="project">Category *</Label>
              <Select value={projectId} onValueChange={handleProjectChange}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(grouped.external.length > 0 || grouped.leave.length > 0) && (
                    <SelectGroup>
                      <SelectLabel>External projects</SelectLabel>
                      {grouped.external.map(p => (
                        <SelectItem key={`ext-${p.id}`} value={p.id}>{p.name}</SelectItem>
                      ))}
                      {grouped.leave.map(p => (
                        <SelectItem key={`leave-${p.id}`} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {grouped.internal.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Internal — {departmentName}</SelectLabel>
                      {grouped.internal.map(p => (
                        <SelectItem key={`int-${p.id}`} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Phase / Work area */}
            <div className="grid gap-2">
              <Label htmlFor="phase">Project *</Label>
              <Select value={phaseId} onValueChange={handlePhaseChange} disabled={isLeaveProject}>
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {(isLeaveProject ? getPhasesForProject(LEAVE_PROJECT_ID) : projectId ? getPhasesForProject(projectId) : []).map(phase => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type */}
            <div className="grid gap-2">
              <Label htmlFor="activityType">Activity/task *</Label>
              <Select 
                value={activityTypeId} 
                onValueChange={setActivityTypeId}
                disabled={!phaseId}
              >
                <SelectTrigger id="activityType">
                  <SelectValue placeholder={phaseId ? "Select activity/task" : "Select project first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableActivities.map(activity => (
                    <SelectItem key={activity.id} value={activity.id}>
                      {activity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Description */}
            <div className="grid gap-2">
              <Label htmlFor="taskDescription">Task description *</Label>
              <Textarea
                id="taskDescription"
                placeholder="Describe the task you worked on"
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Deliverable Type */}
            <div className="grid gap-2">
              <Label htmlFor="deliverableType">Deliverable type *</Label>
              {deptDeliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground italic py-2">
                  No deliverables configured for your department. Contact Admin.
                </p>
              ) : (
                <Select 
                  value={deliverableType} 
                  onValueChange={setDeliverableType}
                  disabled={isLeaveProject}
                >
                  <SelectTrigger id="deliverableType">
                    <SelectValue placeholder="Select deliverable type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deptDeliverables.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Deliverable Description */}
            <div className="grid gap-2">
              <Label htmlFor="deliverableDescription">Deliverable description</Label>
              <Textarea
                id="deliverableDescription"
                placeholder="Describe the deliverable"
                value={deliverableDescription}
                onChange={e => setDeliverableDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Hours and Minutes */}
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hours">Hours *</Label>
                  <Select 
                    value={hours.toString()} 
                    onValueChange={(v) => {
                      setHours(parseInt(v, 10));
                      setValidationError(null);
                    }}
                    disabled={isLeaveProject}
                  >
                    <SelectTrigger id="hours">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOUR_OPTIONS.map(h => (
                        <SelectItem key={h} value={h.toString()}>
                          {h} {h === 1 ? 'hour' : 'hours'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minutes">Minutes *</Label>
                  <Select 
                    value={minutes.toString()} 
                    onValueChange={(v) => {
                      setMinutes(parseInt(v, 10));
                      setValidationError(null);
                    }}
                    disabled={isLeaveProject}
                  >
                    <SelectTrigger id="minutes">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTE_OPTIONS.map(m => (
                        <SelectItem key={m} value={m.toString()}>
                          {m} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Daily total info */}
              <p className="text-xs text-muted-foreground">
                Already logged today: {formatHours(currentDailyTotal)}h of {MAX_DAILY_HOURS}h maximum
                {travelExempt && ' (Travel — exempt from cap)'}
              </p>
              
              {/* Soft warning at target */}
              {overTarget && !wouldExceedCap && (
                <p className="text-sm text-warning font-medium">
                  This will bring your daily total above {HOURS_PER_DAY_TARGET}h. You can still save.
                </p>
              )}

              {/* Hard block at cap */}
              {(wouldExceedCap || validationError) && (
                <p className="text-sm text-destructive font-medium">
                  {validationError || `Daily non-travel total cannot exceed ${MAX_DAILY_HOURS}h. You have ${formatHours(remainingMinutes)}h remaining.`}
                </p>
              )}
            </div>

            {/* Billable Status */}
            <div className="grid gap-2">
              <Label>Billable status *</Label>
              <div className="flex gap-2">
                {BILLABLE_STATUSES.map(status => (
                  <Button
                    key={status}
                    type="button"
                    variant={billableStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBillableStatus(status)}
                    disabled={isLeaveProject}
                    className={cn(
                      'flex-1',
                      billableStatus === status && status === 'billable' && 'bg-billable hover:bg-billable/90',
                      billableStatus === status && status === 'maybe_billable' && 'bg-warning hover:bg-warning/90',
                      billableStatus === status && status === 'not_billable' && 'bg-not-billable hover:bg-not-billable/90'
                    )}
                  >
                    {getBillableLabel(status)}
                  </Button>
                ))}
              </div>
              {isLeaveProject && (
                <p className="text-xs text-muted-foreground">Leave is always non-billable</p>
              )}
            </div>

            {/* Comments */}
            <div className="grid gap-2">
              <Label htmlFor="comments">
                Comments <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="comments"
                placeholder="Any additional notes"
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!isFormValid}>
              Save entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}