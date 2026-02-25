import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Department } from '@/types';
import { useReferenceData } from '@/contexts/ReferenceDataContext';

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Department | null;
}

export function DepartmentDialog({ open, onOpenChange, editing }: DepartmentDialogProps) {
  const [name, setName] = useState('');
  const { addDepartment, updateDepartment } = useReferenceData();

  useEffect(() => {
    if (open) {
      setName(editing?.name ?? '');
    }
  }, [open, editing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editing) {
      updateDepartment(editing.id, name.trim());
    } else {
      addDepartment(name.trim());
    }
    onOpenChange(false);
  };

  return (
    <EditDialog open={open} onOpenChange={onOpenChange} title={editing ? 'Edit Department' : 'Add Department'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dept-name">Name</Label>
          <Input id="dept-name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={!name.trim()}>Save</Button>
        </div>
      </form>
    </EditDialog>
  );
}
