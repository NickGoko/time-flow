import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import type { User, AppRole } from '@/types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null; // null = add mode
  onSave: (data: Omit<User, 'id'>) => void;
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const { departments } = useReferenceData();
  const activeDepts = departments.filter(d => d.isActive);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [role, setRole] = useState('');
  const [appRole, setAppRole] = useState<AppRole>('employee');
  const [weeklyExpectedHours, setWeeklyExpectedHours] = useState(40);

  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setDepartmentId(user.departmentId);
        setRole(user.role);
        setAppRole(user.appRole);
        setWeeklyExpectedHours(user.weeklyExpectedHours);
      } else {
        setName('');
        setEmail('');
        setDepartmentId(activeDepts[0]?.id ?? '');
        setRole('');
        setAppRole('employee');
        setWeeklyExpectedHours(40);
      }
    }
  }, [open, user]);

  const canSave = name.trim() && email.trim() && departmentId && role.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      email: email.trim(),
      departmentId,
      role: role.trim(),
      appRole,
      weeklyExpectedHours,
      isActive: user?.isActive ?? true,
    });
    onOpenChange(false);
  };

  return (
    <EditDialog open={open} onOpenChange={onOpenChange} title={user ? 'Edit User' : 'Add User'}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {activeDepts.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Associate, Finance Officer" />
        </div>
        <div className="space-y-2">
          <Label>App Role</Label>
          <Select value={appRole} onValueChange={v => setAppRole(v as AppRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Weekly Expected Hours</Label>
          <Input
            type="number"
            min={0}
            max={60}
            value={weeklyExpectedHours}
            onChange={e => setWeeklyExpectedHours(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>Save</Button>
        </div>
      </div>
    </EditDialog>
  );
}
