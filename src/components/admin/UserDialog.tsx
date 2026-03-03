import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { Loader2 } from 'lucide-react';
import type { User, AppRole } from '@/types';

interface UserDialogSaveData extends Omit<User, 'id'> {
  managedDepartments?: string[];
  reason?: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null; // null = add mode
  onSave: (data: UserDialogSaveData) => Promise<void>;
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
  const [managedDepartments, setManagedDepartments] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setDepartmentId(user.departmentId);
        setRole(user.role);
        setAppRole(user.appRole);
        setWeeklyExpectedHours(user.weeklyExpectedHours);
        setManagedDepartments(user.managedDepartments ?? []);
        setReason('');
      } else {
        setName('');
        setEmail('');
        setDepartmentId(activeDepts[0]?.id ?? '');
        setRole('');
        setAppRole('employee');
        setWeeklyExpectedHours(40);
        setManagedDepartments([]);
        setReason('');
      }
      setSaving(false);
    }
  }, [open, user]);

  const isEdit = !!user;
  const reasonValid = !isEdit || reason.trim().length >= 5;
  const canSave = name.trim() && email.trim() && departmentId && role.trim() && reasonValid && !saving;

  const handleDeptToggle = (deptId: string, checked: boolean) => {
    setManagedDepartments(prev =>
      checked ? [...prev, deptId] : prev.filter(id => id !== deptId)
    );
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        departmentId,
        role: role.trim(),
        appRole,
        weeklyExpectedHours,
        isActive: user?.isActive ?? true,
        managedDepartments: appRole === 'hod' ? managedDepartments : undefined,
        reason: isEdit ? reason.trim() : undefined,
      });
      onOpenChange(false);
    } catch {
      // Error toast handled by context
    } finally {
      setSaving(false);
    }
  };

  return (
    <EditDialog open={open} onOpenChange={onOpenChange} title={user ? 'Edit User' : 'Invite User'}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            disabled={!!user}
          />
          {!user && (
            <p className="text-xs text-muted-foreground">
              User will receive an invite email to set their password.
            </p>
          )}
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
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="hod">HOD</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {appRole === 'hod' && (
          <div className="space-y-2">
            <Label>Managed Departments</Label>
            <p className="text-xs text-muted-foreground">Select which departments this HOD can manage.</p>
            <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
              {activeDepts.map(d => (
                <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={managedDepartments.includes(d.id)}
                    onCheckedChange={(checked) => handleDeptToggle(d.id, !!checked)}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
        )}

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

        {isEdit && (
          <div className="space-y-2">
            <Label>Reason for change <span className="text-destructive">*</span></Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Briefly explain the reason for this update (min 5 characters)"
              rows={2}
            />
            {reason.length > 0 && reason.trim().length < 5 && (
              <p className="text-xs text-destructive">Reason must be at least 5 characters.</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? 'Save' : 'Send Invite'}
          </Button>
        </div>
      </div>
    </EditDialog>
  );
}
