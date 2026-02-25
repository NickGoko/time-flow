import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  SEED_DELIVERABLE_TYPES,
} from '@/types';
import {
  departments as seedDepartments,
  projects as seedProjects,
  projectDepartmentAccess as seedAccess,
  phases as seedPhases,
  activityTypes as seedActivityTypes,
  internalWorkAreas as seedWorkAreas,
} from '@/data/seed';

// ── localStorage keys ───────────────────────────────────────────────
const LS_DEPARTMENTS = 'timetrack_departments';
const LS_PROJECTS = 'timetrack_projects';
const LS_ACCESS = 'timetrack_project_dept_access';
const LS_PHASES = 'timetrack_phases';
const LS_ACTIVITY_TYPES = 'timetrack_activity_types';
const LS_WORK_AREAS = 'timetrack_work_areas';
const LS_DELIVERABLE_TYPES = 'timetrack_deliverable_types';

function loadOrSeed<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fall through */ }
  return seed;
}

function persist<T>(key: string, data: T[]) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* noop */ }
}

// ── External phase IDs (static set used to distinguish external vs internal phases)
const EXTERNAL_PHASE_IDS = new Set([
  'phase-inception', 'phase-recruitment', 'phase-workshops',
  'phase-entrepreneur-support', 'phase-growthlabs', 'phase-master-classes',
  'phase-reporting', 'phase-general-admin', 'phase-absence',
]);

// ── Context type ────────────────────────────────────────────────────

interface ReferenceDataContextType {
  // Raw arrays (all, including inactive — for admin tables)
  departments: Department[];
  projects: Project[];
  projectDepartmentAccess: ProjectDepartmentAccess[];
  phases: Phase[];
  activityTypes: ActivityType[];
  internalWorkAreas: InternalWorkArea[];
  deliverableTypes: DeliverableTypeItem[];

  // Filtered getters (active-only — for entry forms)
  getDepartmentById: (id: string) => Department | undefined;
  getActivitiesForPhase: (phaseId: string) => ActivityType[];
  getPhasesForProject: (projectId: string) => Phase[];
  getGroupedWorkstreams: (departmentId: string, userId: string, entries: TimeEntry[]) => GroupedWorkstreams;
  getProjectById: (id: string) => Project | undefined;

  // CRUD methods
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
  const [departments, setDepartments] = useState<Department[]>(() => loadOrSeed(LS_DEPARTMENTS, seedDepartments));
  const [projects, setProjects] = useState<Project[]>(() => loadOrSeed(LS_PROJECTS, seedProjects));
  const [access, setAccess] = useState<ProjectDepartmentAccess[]>(() => loadOrSeed(LS_ACCESS, seedAccess));
  const [phases, setPhases] = useState<Phase[]>(() => loadOrSeed(LS_PHASES, seedPhases));
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(() => loadOrSeed(LS_ACTIVITY_TYPES, seedActivityTypes));
  const [workAreas, setWorkAreas] = useState<InternalWorkArea[]>(() => loadOrSeed(LS_WORK_AREAS, seedWorkAreas));
  const [deliverableTypes, setDeliverableTypes] = useState<DeliverableTypeItem[]>(() => loadOrSeed(LS_DELIVERABLE_TYPES, SEED_DELIVERABLE_TYPES));

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
        const mapped = deptRes.data.map((d: any) => ({ id: d.id, name: d.name, isActive: d.is_active }));
        setDepartments(mapped);
        persist(LS_DEPARTMENTS, mapped);
      }
      if (projRes.data?.length) {
        const mapped = projRes.data.map((p: any) => ({
          id: p.id, name: p.name, code: p.code, isActive: p.is_active,
          defaultBillableStatus: p.default_billable_status, type: p.type,
          owningDepartmentId: p.owning_department_id,
        }));
        setProjects(mapped);
        persist(LS_PROJECTS, mapped);
      }
      if (accessRes.data?.length) {
        const mapped = accessRes.data.map((a: any) => ({ workstreamId: a.workstream_id, departmentId: a.department_id }));
        setAccess(mapped);
        persist(LS_ACCESS, mapped);
      }
      if (phaseRes.data?.length) {
        const mapped = phaseRes.data.map((p: any) => ({ id: p.id, name: p.name, isActive: p.is_active }));
        setPhases(mapped);
        persist(LS_PHASES, mapped);
      }
      if (actRes.data?.length) {
        const mapped = actRes.data.map((a: any) => ({ id: a.id, name: a.name, phaseId: a.phase_id, isActive: a.is_active }));
        setActivityTypes(mapped);
        persist(LS_ACTIVITY_TYPES, mapped);
      }
      if (waRes.data?.length) {
        const mapped = waRes.data.map((w: any) => ({
          id: w.id, name: w.name, departmentId: w.department_id, phaseId: w.phase_id, isActive: w.is_active,
        }));
        setWorkAreas(mapped);
        persist(LS_WORK_AREAS, mapped);
      }
      if (delRes.data?.length) {
        const mapped = delRes.data.map((d: any) => ({ id: d.id, name: d.name, isActive: d.is_active }));
        setDeliverableTypes(mapped);
        persist(LS_DELIVERABLE_TYPES, mapped);
      }
    }
    fetchAll();
  }, []);

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

  const getGroupedWorkstreams = useCallback(
    (departmentId: string, userId: string, entries: TimeEntry[]): GroupedWorkstreams => {
      const internal = projects.filter(
        p => p.isActive && p.type === 'internal_department' && p.owningDepartmentId === departmentId,
      );
      const accessibleIds = new Set(
        access.filter(a => a.departmentId === departmentId).map(a => a.workstreamId),
      );
      const external = projects.filter(
        p => p.isActive && p.type === 'external_project' && p.id !== 'proj-leave' && accessibleIds.has(p.id),
      );
      const leave = projects.filter(p => p.id === 'proj-leave' && p.isActive);

      // Recent workstreams
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

  const toggleDepartmentActive = useCallback(
    (id: string) => {
      setDepartments(prev => {
        const next = prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
        persist(LS_DEPARTMENTS, next);
        return next;
      });
    },
    [],
  );

  const addDepartment = useCallback(
    (name: string) => {
      setDepartments(prev => {
        const id = 'dept-' + Date.now();
        const next = [...prev, { id, name, isActive: true }];
        persist(LS_DEPARTMENTS, next);
        return next;
      });
    },
    [],
  );

  const updateDepartment = useCallback(
    (id: string, name: string) => {
      setDepartments(prev => {
        const next = prev.map(d => d.id === id ? { ...d, name } : d);
        persist(LS_DEPARTMENTS, next);
        return next;
      });
    },
    [],
  );

  const addProject = useCallback(
    (project: Omit<Project, 'id'> & { id?: string }) => {
      setProjects(prev => {
        const id = project.id || 'proj-' + Date.now();
        const next = [...prev, { ...project, id } as Project];
        persist(LS_PROJECTS, next);
        return next;
      });
    },
    [],
  );

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects(prev => {
        const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
        persist(LS_PROJECTS, next);
        return next;
      });
    },
    [],
  );

  const toggleProjectActive = useCallback(
    (id: string) => {
      setProjects(prev => {
        const next = prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
        persist(LS_PROJECTS, next);
        return next;
      });
    },
    [],
  );

  const setProjectDepartmentAccess = useCallback(
    (projectId: string, departmentIds: string[]) => {
      setAccess(prev => {
        const filtered = prev.filter(a => a.workstreamId !== projectId);
        const newRows = departmentIds.map(deptId => ({ workstreamId: projectId, departmentId: deptId }));
        const next = [...filtered, ...newRows];
        persist(LS_ACCESS, next);
        return next;
      });
    },
    [],
  );

  const addWorkArea = useCallback(
    (workArea: Omit<InternalWorkArea, 'id'>) => {
      setWorkAreas(prev => {
        const id = 'wa-' + Date.now();
        const next = [...prev, { ...workArea, id } as InternalWorkArea];
        persist(LS_WORK_AREAS, next);
        return next;
      });
    },
    [],
  );

  const updateWorkArea = useCallback(
    (id: string, updates: Partial<InternalWorkArea>) => {
      setWorkAreas(prev => {
        const next = prev.map(wa => wa.id === id ? { ...wa, ...updates } : wa);
        persist(LS_WORK_AREAS, next);
        return next;
      });
    },
    [],
  );

  const toggleWorkAreaActive = useCallback(
    (id: string) => {
      setWorkAreas(prev => {
        const next = prev.map(wa => wa.id === id ? { ...wa, isActive: !wa.isActive } : wa);
        persist(LS_WORK_AREAS, next);
        return next;
      });
    },
    [],
  );

  const addPhase = useCallback(
    (name: string) => {
      setPhases(prev => {
        const id = 'phase-' + Date.now();
        const next = [...prev, { id, name, isActive: true }];
        persist(LS_PHASES, next);
        return next;
      });
    },
    [],
  );

  const updatePhase = useCallback(
    (id: string, name: string) => {
      setPhases(prev => {
        const next = prev.map(p => p.id === id ? { ...p, name } : p);
        persist(LS_PHASES, next);
        return next;
      });
    },
    [],
  );

  const togglePhaseActive = useCallback(
    (id: string) => {
      setPhases(prev => {
        const next = prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p);
        persist(LS_PHASES, next);
        return next;
      });
    },
    [],
  );

  const addActivityType = useCallback(
    (name: string, phaseId: string) => {
      setActivityTypes(prev => {
        const id = 'act-' + Date.now();
        const next = [...prev, { id, name, phaseId, isActive: true }];
        persist(LS_ACTIVITY_TYPES, next);
        return next;
      });
    },
    [],
  );

  const updateActivityType = useCallback(
    (id: string, updates: { name?: string; phaseId?: string }) => {
      setActivityTypes(prev => {
        const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
        persist(LS_ACTIVITY_TYPES, next);
        return next;
      });
    },
    [],
  );

  const toggleActivityTypeActive = useCallback(
    (id: string) => {
      setActivityTypes(prev => {
        const next = prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a);
        persist(LS_ACTIVITY_TYPES, next);
        return next;
      });
    },
    [],
  );

  const addDeliverableType = useCallback(
    (name: string) => {
      setDeliverableTypes(prev => {
        const id = 'del-' + Date.now();
        const next = [...prev, { id, name, isActive: true }];
        persist(LS_DELIVERABLE_TYPES, next);
        return next;
      });
    },
    [],
  );

  const updateDeliverableType = useCallback(
    (id: string, name: string) => {
      setDeliverableTypes(prev => {
        const next = prev.map(d => d.id === id ? { ...d, name } : d);
        persist(LS_DELIVERABLE_TYPES, next);
        return next;
      });
    },
    [],
  );

  const toggleDeliverableTypeActive = useCallback(
    (id: string) => {
      setDeliverableTypes(prev => {
        const next = prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
        persist(LS_DELIVERABLE_TYPES, next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<ReferenceDataContextType>(
    () => ({
      departments,
      projects,
      projectDepartmentAccess: access,
      phases,
      activityTypes,
      internalWorkAreas: workAreas,
      deliverableTypes,
      getDepartmentById,
      getActivitiesForPhase,
      getPhasesForProject,
      getGroupedWorkstreams,
      getProjectById,
      toggleDepartmentActive,
      addDepartment,
      updateDepartment,
      addPhase,
      updatePhase,
      togglePhaseActive,
      addActivityType,
      updateActivityType,
      toggleActivityTypeActive,
      addProject,
      updateProject,
      toggleProjectActive,
      setProjectDepartmentAccess,
      addWorkArea,
      updateWorkArea,
      toggleWorkAreaActive,
      addDeliverableType,
      updateDeliverableType,
      toggleDeliverableTypeActive,
    }),
    [departments, projects, access, phases, activityTypes, workAreas, deliverableTypes, getDepartmentById, getActivitiesForPhase, getPhasesForProject, getGroupedWorkstreams, getProjectById, toggleDepartmentActive, addDepartment, updateDepartment, addPhase, updatePhase, togglePhaseActive, addActivityType, updateActivityType, toggleActivityTypeActive, addProject, updateProject, toggleProjectActive, setProjectDepartmentAccess, addWorkArea, updateWorkArea, toggleWorkAreaActive, addDeliverableType, updateDeliverableType, toggleDeliverableTypeActive],
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
