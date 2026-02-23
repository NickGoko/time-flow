import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import type { Project, WorkstreamType, BillableStatus } from '@/types';
import { WORKSTREAM_TYPES, getWorkstreamTypeLabel, BILLABLE_STATUSES, getBillableLabel } from '@/types';

interface WorkstreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Project | null;
}

export function WorkstreamDialog({ open, onOpenChange, editing }: WorkstreamDialogProps) {
  const {
    departments,
    projectDepartmentAccess,
    addProject,
    updateProject,
    setProjectDepartmentAccess,
  } = useReferenceData();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<WorkstreamType>('external_project');
  const [owningDeptId, setOwningDeptId] = useState('');
  const [billableStatus, setBillableStatus] = useState<BillableStatus>('billable');
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setCode(editing.code);
        setType(editing.type);
        setOwningDeptId(editing.owningDepartmentId ?? '');
        setBillableStatus(editing.defaultBillableStatus);
        const deptIds = projectDepartmentAccess
          .filter(a => a.workstreamId === editing.id)
          .map(a => a.departmentId);
        setSelectedDepts(new Set(deptIds));
      } else {
        setName('');
        setCode('');
        setType('external_project');
        setOwningDeptId('');
        setBillableStatus('billable');
        setSelectedDepts(new Set());
      }
    }
  }, [open, editing, projectDepartmentAccess]);

  const isValid =
    name.trim() &&
    code.trim() &&
    (type === 'internal_department' ? !!owningDeptId : selectedDepts.size > 0);

  const handleSave = () => {
    if (!isValid) return;
    const projectData: Omit<Project, 'id'> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      isActive: editing?.isActive ?? true,
      defaultBillableStatus: billableStatus,
      owningDepartmentId: type === 'internal_department' ? owningDeptId : undefined,
    };

    if (editing) {
      updateProject(editing.id, projectData);
      if (type === 'external_project') {
        setProjectDepartmentAccess(editing.id, Array.from(selectedDepts));
      }
    } else {
      const id = 'proj-' + code.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      addProject({ ...projectData, id });
      if (type === 'external_project') {
        setProjectDepartmentAccess(id, Array.from(selectedDepts));
      }
    }
    onOpenChange(false);
  };

  const toggleDept = (deptId: string) => {
    setSelectedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  return (
    <EditDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Edit Workstream' : 'Add Workstream'}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ws-name">Name</Label>
          <Input id="ws-name" value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ws-code">Code</Label>
          <Input id="ws-code" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. FLAGSHIP" />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as WorkstreamType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORKSTREAM_TYPES.map(t => (
                <SelectItem key={t} value={t}>{getWorkstreamTypeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === 'internal_department' && (
          <div className="space-y-2">
            <Label>Owning Department</Label>
            <Select value={owningDeptId} onValueChange={setOwningDeptId}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.filter(d => d.isActive).map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Default Billable Status</Label>
          <Select value={billableStatus} onValueChange={(v) => setBillableStatus(v as BillableStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BILLABLE_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{getBillableLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === 'external_project' && (
          <div className="space-y-2">
            <Label>Department Access</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {departments.filter(d => d.isActive).map(d => (
                <label key={d.id} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox
                    checked={selectedDepts.has(d.id)}
                    onCheckedChange={() => toggleDept(d.id)}
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {editing ? 'Save' : 'Add'}
          </Button>
        </div>
      </div>
    </EditDialog>
  );
}
