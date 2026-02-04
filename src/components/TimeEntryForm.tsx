import { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
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
  MINUTES_PER_INCREMENT, 
  isValidDuration,
  getBillableLabel,
  ProjectWithClient 
} from '@/types';
import { projects, clients } from '@/data/seed';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { cn } from '@/lib/utils';

interface TimeEntryFormProps {
  selectedDate: string;
  onSuccess?: () => void;
}

// Duration presets in minutes
const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480];

export function TimeEntryForm({ selectedDate, onSuccess }: TimeEntryFormProps) {
  const { currentUser } = useCurrentUser();
  const { addEntry } = useTimeEntries();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [billableStatus, setBillableStatus] = useState<BillableStatus>('billable');
  const [customDuration, setCustomDuration] = useState('');

  // Group projects by client
  const projectsByClient = projects.reduce((acc, project) => {
    const client = clients.find(c => c.id === project.clientId);
    if (!client || !project.isActive) return acc;
    
    if (!acc[client.id]) {
      acc[client.id] = {
        client,
        projects: [],
      };
    }
    acc[client.id].projects.push(project);
    return acc;
  }, {} as Record<string, { client: typeof clients[0]; projects: typeof projects }>);

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const project = projects.find(p => p.id === value);
    if (project) {
      setBillableStatus(project.defaultBillableStatus);
    }
  };

  const handleCustomDurationChange = (value: string) => {
    setCustomDuration(value);
    const mins = parseInt(value, 10);
    if (!isNaN(mins) && mins > 0) {
      // Round to nearest 15 minutes
      const rounded = Math.round(mins / MINUTES_PER_INCREMENT) * MINUTES_PER_INCREMENT;
      setDurationMinutes(Math.max(MINUTES_PER_INCREMENT, rounded));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !isValidDuration(durationMinutes)) {
      return;
    }

    addEntry({
      userId: currentUser.id,
      projectId,
      date: selectedDate,
      durationMinutes,
      description: description.trim(),
      billableStatus,
    });

    // Reset form
    setProjectId('');
    setDurationMinutes(60);
    setDescription('');
    setBillableStatus('billable');
    setCustomDuration('');
    setOpen(false);
    onSuccess?.();
  };

  const formatDurationLabel = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log time entry</DialogTitle>
            <DialogDescription>
              Recording time for{' '}
              {new Date(selectedDate).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-5">
            {/* Project Selection */}
            <div className="grid gap-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={projectId} onValueChange={handleProjectChange}>
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(projectsByClient).map(({ client, projects }) => (
                    <div key={client.id}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {client.name}
                      </div>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <span className="font-mono text-xs text-muted-foreground mr-2">
                            {project.code}
                          </span>
                          {project.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selection */}
            <div className="grid gap-2">
              <Label>Duration *</Label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.slice(0, 8).map(mins => (
                  <Button
                    key={mins}
                    type="button"
                    variant={durationMinutes === mins ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setDurationMinutes(mins);
                      setCustomDuration('');
                    }}
                    className="min-w-[52px]"
                  >
                    {formatDurationLabel(mins)}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Custom (minutes)"
                  value={customDuration}
                  onChange={e => handleCustomDurationChange(e.target.value)}
                  className="w-40"
                  min={15}
                  step={15}
                />
                {customDuration && (
                  <span className="text-sm text-muted-foreground">
                    = {formatDurationLabel(durationMinutes)}
                  </span>
                )}
              </div>
            </div>

            {/* Billable Status */}
            <div className="grid gap-2">
              <Label>Billable status</Label>
              <div className="flex gap-2">
                {(['billable', 'maybe_billable', 'not_billable'] as BillableStatus[]).map(status => (
                  <Button
                    key={status}
                    type="button"
                    variant={billableStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBillableStatus(status)}
                    className={cn(
                      'flex-1',
                      billableStatus === status && status === 'billable' && 'bg-billable hover:bg-billable/90',
                      billableStatus === status && status === 'maybe_billable' && 'bg-maybe-billable hover:bg-maybe-billable/90',
                      billableStatus === status && status === 'not_billable' && 'bg-not-billable hover:bg-not-billable/90'
                    )}
                  >
                    {getBillableLabel(status)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What did you work on?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!projectId || !isValidDuration(durationMinutes)}>
              Save entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
