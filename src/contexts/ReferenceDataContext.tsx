import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Department,
  Project,
  ProjectDepartmentAccess,
  Phase,
  ActivityType,
  InternalWorkArea,
  GroupedWorkstreams,
  TimeEntry,
  DeliverableTypeItem,
} from '@/types';

// ── External phase IDs (static set used to distinguish external vs internal phases)
const EXTERNAL_PHASE_IDS = new Set([
  'phase-inception', 'phase-recruitment', 'phase-workshops',
  'phase-entrepreneur-support', 'phase-growthlabs', 'phase-master-classes',
  'phase-reporting', 'phase-general-admin', 'phase-absence',
]);

// ── Context type ────────────────────────────────────────────────────

interface ReferenceDataContextType {
  departments: Department[];
  projects: Project[];
  projectDepartmentAccess: ProjectDepartmentAccess[];
  phases: Phase[];
  activityTypes: ActivityType[];
  internalWorkAreas: InternalWorkArea[];
  deliverableTypes: DeliverableTypeItem[];

  getDepartmentById: (id: string) => Department | undefined;
  getActivitiesForPhase: (phaseId: string) => ActivityType[];
  getPhasesForProject: (projectId: string) => Phase[];
  getGroupedWorkstreams: (departmentId: string, userId: string, entries: TimeEntry[]) => GroupedWorkstreams;
  getProjectById: (id: string) => Project | undefined;
  getDeliverablesForDepartment: (deptId: string) => DeliverableTypeItem[];

  toggleDepartmentActive: (id: string) => void;
  addDepartment: (name: string) => void;
  updateDepartment: (id: string, name: string) => void;
  addPhase: (name: string) => void;
  updatePhase: (id: string, name: string) => void;
  togglePhaseActive: (id: string) => void;
  addActivityType: (name: string, phaseId: string) => void;
  updateActivityType: (id: string, updates: { name?: string; phaseId?: string }) => void;
  toggleActivityTypeActive: (id: string) => void;
  addProject: (project: Omit<Project, 'id'> & { id?: string }) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  toggleProjectActive: (id: string) => void;
  setProjectDepartmentAccess: (projectId: string, departmentIds: string[]) => void;
  addWorkArea: (workArea: Omit<InternalWorkArea, 'id'>) => void;
  updateWorkArea: (id: string, updates: Partial<InternalWorkArea>) => void;
  toggleWorkAreaActive: (id: string) => void;
  addDeliverableType: (name: string) => void;
  updateDeliverableType: (id: string, name: string) => void;
  toggleDeliverableTypeActive: (id: string) => void;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────

export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [access, setAccess] = useState<ProjectDepartmentAccess[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [workAreas, setWorkAreas] = useState<InternalWorkArea[]>([]);
  const [deliverableTypes, setDeliverableTypes] = useState<DeliverableTypeItem[]>([]);

  // ── Fetch reference data from Supabase on mount ──────────────────
  useEffect(() => {
    async function fetchAll() {
      const [deptRes, projRes, accessRes, phaseRes, actRes, waRes, delRes] = await Promise.all([
        supabase.from('departments').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('project_department_access').select('*'),
        supabase.from('phases').select('*'),
        supabase.from('activity_types').select('*'),
        supabase.from('internal_work_areas').select('*'),
        supabase.from('deliverable_types').select('*'),
      ]);

      if (deptRes.data?.length) {
        setDepartments(deptRes.data.map((d: any) => ({ id: d.id, name: d.name, isActive: d.is_active })));
      }
      if (projRes.data?.length) {
        setProjects(projRes.data.map((p: any) => ({
          id: p.id, name: p.name, code: p.code, isActive: p.is_active,
          defaultBillableStatus: p.default_billable_status, type: p.type,
          owningDepartmentId: p.owning_department_id,
        })));
      }
      if (accessRes.data?.length) {
        setAccess(accessRes.data.map((a: any) => ({ workstreamId: a.workstream_id, departmentId: a.department_id })));
      }
      if (phaseRes.data?.length) {
        setPhases(phaseRes.data.map((p: any) => ({ id: p.id, name: p.name, isActive: p.is_active })));
      }
      if (actRes.data?.length) {
        setActivityTypes(actRes.data.map((a: any) => ({ id: a.id, name: a.name, phaseId: a.phase_id, isActive: a.is_active })));
      }
      if (waRes.data?.length) {
        setWorkAreas(waRes.data.map((w: any) => ({
          id: w.id, name: w.name, departmentId: w.department_id, phaseId: w.phase_id, isActive: w.is_active,
        })));
      }
      if (delRes.data?.length) {
        setDeliverableTypes(delRes.data.map((d: any) => ({
          id: d.id, name: d.name, isActive: d.is_active,
          departmentId: d.department_id, isGlobal: d.is_global, sortOrder: d.sort_order,
        })));
      }
    }
    fetchAll();
  }, []);

  // ── Getters ──────────────────────────────────────────────────────

  const getDepartmentById = useCallback(
    (id: string) => departments.find(d => d.id === id),
    [departments],
  );

  const getProjectById = useCallback(
    (id: string) => projects.find(p => p.id === id),
    [projects],
  );

  const getActivitiesForPhase = useCallback(
    (phaseId: string) => activityTypes.filter(a => a.phaseId === phaseId && a.isActive),
    [activityTypes],
  );

  const getPhasesForProject = useCallback(
    (projectId: string): Phase[] => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return [];
      if (project.type === 'internal_department' && project.owningDepartmentId) {
        const deptWAs = workAreas.filter(
          wa => wa.departmentId === project.owningDepartmentId && wa.isActive,
        );
        return deptWAs
          .map(wa => phases.find(p => p.id === wa.phaseId && p.isActive))
          .filter((p): p is Phase => !!p);
      }
      return phases.filter(p => EXTERNAL_PHASE_IDS.has(p.id) && p.isActive);
    },
    [projects, phases, workAreas],
  );

  const getDeliverablesForDepartment = useCallback(
    (deptId: string): DeliverableTypeItem[] => {
      return deliverableTypes
        .filter(d => d.isActive && (d.isGlobal || d.departmentId === deptId))
        .sort((a, b) => a.sortOrder - b.sortOrder);
    },
    [deliverableTypes],
  );

  const getGroupedWorkstreams = useCallback(
    (departmentId: string, userId: string, entries: TimeEntry[]): GroupedWorkstreams => {
      const internal = projects.filter(
        p => p.isActive && p.type === 'internal_department' && p.owningDepartmentId === departmentId,
      );
      // Safety fallback: if no departmentId, show all external projects
      const accessibleIds = departmentId
        ? new Set(access.filter(a => a.departmentId === departmentId).map(a => a.workstreamId))
        : new Set(projects.filter(p => p.type === 'external_project').map(p => p.id));
      const external = projects.filter(
        p => p.isActive && p.type === 'external_project' && p.id !== 'proj-leave' && accessibleIds.has(p.id),
      );
      const leave = projects.filter(p => p.id === 'proj-leave' && p.isActive);

      const sorted = [...entries]
        .filter(e => e.userId === userId)
        .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
      const seen = new Set<string>();
      const recent: Project[] = [];
      for (const entry of sorted) {
        if (seen.has(entry.projectId)) continue;
        seen.add(entry.projectId);
        const project = projects.find(p => p.id === entry.projectId);
        if (project) recent.push(project);
        if (recent.length >= 5) break;
      }

      return { recent, external, internal, leave };
    },
    [projects, access],
  );

  // ── Mutation helpers (optimistic + Supabase write) ───────────────

  const addDepartment = useCallback(async (name: string) => {
    const id = 'dept-' + Date.now();
    const newItem: Department = { id, name, isActive: true };
    setDepartments(prev => [...prev, newItem]);
    const { error } = await supabase.from('departments').insert({ id, name, is_active: true });
    if (error) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.error('Failed to add department: ' + error.message);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, name: string) => {
    setDepartments(prev => {
      const old = prev.find(d => d.id === id);
      if (!old) return prev;
      return prev.map(d => d.id === id ? { ...d, name } : d);
    });
    const { error } = await supabase.from('departments').update({ name }).eq('id', id);
    if (error) {
      toast.error('Failed to update department: ' + error.message);
    }
  }, []);

  const toggleDepartmentActive = useCallback(async (id: string) => {
    let newVal = false;
    setDepartments(prev => prev.map(d => {
      if (d.id === id) { newVal = !d.isActive; return { ...d, isActive: newVal }; }
      return d;
    }));
    const { error } = await supabase.from('departments').update({ is_active: newVal }).eq('id', id);
    if (error) {
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, isActive: !newVal } : d));
      toast.error('Failed to toggle department: ' + error.message);
    }
  }, []);

  const addPhase = useCallback(async (name: string) => {
    const id = 'phase-' + Date.now();
    const newItem: Phase = { id, name, isActive: true };
    setPhases(prev => [...prev, newItem]);
    const { error } = await supabase.from('phases').insert({ id, name, is_active: true });
    if (error) {
      setPhases(prev => prev.filter(p => p.id !== id));
      toast.error('Failed to add phase: ' + error.message);
    }
  }, []);

  const updatePhase = useCallback(async (id: string, name: string) => {
    setPhases(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    const { error } = await supabase.from('phases').update({ name }).eq('id', id);
    if (error) { toast.error('Failed to update phase: ' + error.message); }
  }, []);

  const togglePhaseActive = useCallback(async (id: string) => {
    let newVal = false;
    setPhases(prev => prev.map(p => {
      if (p.id === id) { newVal = !p.isActive; return { ...p, isActive: newVal }; }
      return p;
    }));
    const { error } = await supabase.from('phases').update({ is_active: newVal }).eq('id', id);
    if (error) {
      setPhases(prev => prev.map(p => p.id === id ? { ...p, isActive: !newVal } : p));
      toast.error('Failed to toggle phase: ' + error.message);
    }
  }, []);

  const addActivityType = useCallback(async (name: string, phaseId: string) => {
    const id = 'act-' + Date.now();
    const newItem: ActivityType = { id, name, phaseId, isActive: true };
    setActivityTypes(prev => [...prev, newItem]);
    const { error } = await supabase.from('activity_types').insert({ id, name, phase_id: phaseId, is_active: true });
    if (error) {
      setActivityTypes(prev => prev.filter(a => a.id !== id));
      toast.error('Failed to add activity type: ' + error.message);
    }
  }, []);

  const updateActivityType = useCallback(async (id: string, updates: { name?: string; phaseId?: string }) => {
    setActivityTypes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.phaseId !== undefined) dbUpdates.phase_id = updates.phaseId;
    const { error } = await supabase.from('activity_types').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Failed to update activity type: ' + error.message); }
  }, []);

  const toggleActivityTypeActive = useCallback(async (id: string) => {
    let newVal = false;
    setActivityTypes(prev => prev.map(a => {
      if (a.id === id) { newVal = !a.isActive; return { ...a, isActive: newVal }; }
      return a;
    }));
    const { error } = await supabase.from('activity_types').update({ is_active: newVal }).eq('id', id);
    if (error) {
      setActivityTypes(prev => prev.map(a => a.id === id ? { ...a, isActive: !newVal } : a));
      toast.error('Failed to toggle activity type: ' + error.message);
    }
  }, []);

  const addProject = useCallback(async (project: Omit<Project, 'id'> & { id?: string }) => {
    const id = project.id || 'proj-' + Date.now();
    const newItem = { ...project, id } as Project;
    setProjects(prev => [...prev, newItem]);
    const { error } = await supabase.from('projects').insert({
      id, name: newItem.name, code: newItem.code, is_active: newItem.isActive,
      default_billable_status: newItem.defaultBillableStatus, type: newItem.type,
      owning_department_id: newItem.owningDepartmentId ?? null,
    });
    if (error) {
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.error('Failed to add project: ' + error.message);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.defaultBillableStatus !== undefined) dbUpdates.default_billable_status = updates.defaultBillableStatus;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.owningDepartmentId !== undefined) dbUpdates.owning_department_id = updates.owningDepartmentId;
    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Failed to update project: ' + error.message); }
  }, []);

  const toggleProjectActive = useCallback(async (id: string) => {
    let newVal = false;
    setProjects(prev => prev.map(p => {
      if (p.id === id) { newVal = !p.isActive; return { ...p, isActive: newVal }; }
      return p;
    }));
    const { error } = await supabase.from('projects').update({ is_active: newVal }).eq('id', id);
    if (error) {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, isActive: !newVal } : p));
      toast.error('Failed to toggle project: ' + error.message);
    }
  }, []);

  const setProjectDepartmentAccess = useCallback(async (projectId: string, departmentIds: string[]) => {
    const oldAccess = access.filter(a => a.workstreamId === projectId);
    const newRows = departmentIds.map(deptId => ({ workstreamId: projectId, departmentId: deptId }));
    setAccess(prev => [...prev.filter(a => a.workstreamId !== projectId), ...newRows]);

    const { error: delError } = await supabase.from('project_department_access').delete().eq('workstream_id', projectId);
    if (delError) {
      setAccess(prev => [...prev.filter(a => a.workstreamId !== projectId), ...oldAccess]);
      toast.error('Failed to update access: ' + delError.message);
      return;
    }
    if (departmentIds.length > 0) {
      const { error: insError } = await supabase.from('project_department_access').insert(
        departmentIds.map(deptId => ({ workstream_id: projectId, department_id: deptId }))
      );
      if (insError) {
        toast.error('Failed to insert access: ' + insError.message);
      }
    }
  }, [access]);

  const addWorkArea = useCallback(async (workArea: Omit<InternalWorkArea, 'id'>) => {
    const id = 'wa-' + Date.now();
    const newItem = { ...workArea, id } as InternalWorkArea;
    setWorkAreas(prev => [...prev, newItem]);
    const { error } = await supabase.from('internal_work_areas').insert({
      id, name: newItem.name, department_id: newItem.departmentId, phase_id: newItem.phaseId, is_active: newItem.isActive,
    });
    if (error) {
      setWorkAreas(prev => prev.filter(w => w.id !== id));
      toast.error('Failed to add work area: ' + error.message);
    }
  }, []);

  const updateWorkArea = useCallback(async (id: string, updates: Partial<InternalWorkArea>) => {
    setWorkAreas(prev => prev.map(wa => wa.id === id ? { ...wa, ...updates } : wa));
    const dbUpdates: Record<string, any> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.departmentId !== undefined) dbUpdates.department_id = updates.departmentId;
    if (updates.phaseId !== undefined) dbUpdates.phase_id = updates.phaseId;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    const { error } = await supabase.from('internal_work_areas').update(dbUpdates).eq('id', id);
    if (error) { toast.error('Failed to update work area: ' + error.message); }
  }, []);

  const toggleWorkAreaActive = useCallback(async (id: string) => {
    let newVal = false;
    setWorkAreas(prev => prev.map(wa => {
      if (wa.id === id) { newVal = !wa.isActive; return { ...wa, isActive: newVal }; }
      return wa;
    }));
    const { error } = await supabase.from('internal_work_areas').update({ is_active: newVal }).eq('id', id);
    if (error) {
      setWorkAreas(prev => prev.map(wa => wa.id === id ? { ...wa, isActive: !newVal } : wa));
      toast.error('Failed to toggle work area: ' + error.message);
    }
  }, []);

  const addDeliverableType = useCallback(async (name: string) => {
    const id = 'del-' + Date.now();
    const newItem: DeliverableTypeItem = { id, name, isActive: true, isGlobal: false, sortOrder: 0 };
    setDeliverableTypes(prev => [...prev, newItem]);
    const { error } = await supabase.from('deliverable_types').insert({ id, name, is_active: true });
    if (error) {
      setDeliverableTypes(prev => prev.filter(d => d.id !== id));
      toast.error('Failed to add deliverable type: ' + error.message);
    }
  }, []);

  const updateDeliverableType = useCallback(async (id: string, name: string) => {
    setDeliverableTypes(prev => prev.map(d => d.id === id ? { ...d, name } : d));
    const { error } = await supabase.from('deliverable_types').update({ name }).eq('id', id);
    if (error) { toast.error('Failed to update deliverable type: ' + error.message); }
  }, []);

  const toggleDeliverableTypeActive = useCallback(async (id: string) => {
    let newVal = false;
    setDeliverableTypes(prev => prev.map(d => {
      if (d.id === id) { newVal = !d.isActive; return { ...d, isActive: newVal }; }
      return d;
    }));
    const { error } = await supabase.from('deliverable_types').update({ is_active: newVal }).eq('id', id);
    if (error) {
      setDeliverableTypes(prev => prev.map(d => d.id === id ? { ...d, isActive: !newVal } : d));
      toast.error('Failed to toggle deliverable type: ' + error.message);
    }
  }, []);

  const value = useMemo<ReferenceDataContextType>(
    () => ({
      departments, projects, projectDepartmentAccess: access, phases, activityTypes,
      internalWorkAreas: workAreas, deliverableTypes,
      getDepartmentById, getActivitiesForPhase, getPhasesForProject, getGroupedWorkstreams, getProjectById, getDeliverablesForDepartment,
      toggleDepartmentActive, addDepartment, updateDepartment,
      addPhase, updatePhase, togglePhaseActive,
      addActivityType, updateActivityType, toggleActivityTypeActive,
      addProject, updateProject, toggleProjectActive, setProjectDepartmentAccess,
      addWorkArea, updateWorkArea, toggleWorkAreaActive,
      addDeliverableType, updateDeliverableType, toggleDeliverableTypeActive,
    }),
    [departments, projects, access, phases, activityTypes, workAreas, deliverableTypes,
     getDepartmentById, getActivitiesForPhase, getPhasesForProject, getGroupedWorkstreams, getProjectById, getDeliverablesForDepartment,
     toggleDepartmentActive, addDepartment, updateDepartment,
     addPhase, updatePhase, togglePhaseActive,
     addActivityType, updateActivityType, toggleActivityTypeActive,
     addProject, updateProject, toggleProjectActive, setProjectDepartmentAccess,
     addWorkArea, updateWorkArea, toggleWorkAreaActive,
     addDeliverableType, updateDeliverableType, toggleDeliverableTypeActive],
  );

  return (
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
}

export function useReferenceData() {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx) throw new Error('useReferenceData must be used within ReferenceDataProvider');
  return ctx;
}
