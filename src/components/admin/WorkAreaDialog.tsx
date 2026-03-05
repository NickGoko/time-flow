import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import type { InternalWorkArea } from '@/types';

interface WorkAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: InternalWorkArea | null;
  onSave: (data: Partial<InternalWorkArea> & { name: string; departmentId: string; phaseId: string; isActive: boolean }) => void;
}

export function WorkAreaDialog({ open, onOpenChange, editing, onSave }: WorkAreaDialogProps) {
  const { departments, phases } = useReferenceData();

  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [phaseId, setPhaseId] = useState('');

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
      setDepartmentId(editing?.departmentId ?? '');
      setPhaseId(editing?.phaseId ?? '');
    }
  }, [open, editing]);

  const activeDepartments = departments.filter(d => d.isActive);
  const activePhases = phases.filter(p => p.isActive);

  const canSave = name.trim() && departmentId && phaseId;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), departmentId, phaseId, isActive: editing?.isActive ?? true });
  };

  return (
    <EditDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Edit work area' : 'Add work area'}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="wa-name">Name</Label>
          <Input id="wa-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Management Accounts" />
        </div>

        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {activeDepartments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
          <Select value={phaseId} onValueChange={setPhaseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {activePhases.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {editing ? 'Save Changes' : 'Add Work Area'}
          </Button>
        </div>
      </div>
    </EditDialog>
  );
}
