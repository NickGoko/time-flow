import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  Department,
  Project,
  ProjectDepartmentAccess,
  Phase,
  ActivityType,
  InternalWorkArea,
  GroupedWorkstreams,
  TimeEntry,
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

  // Filtered getters (active-only — for entry forms)
  getDepartmentById: (id: string) => Department | undefined;
  getActivitiesForPhase: (phaseId: string) => ActivityType[];
  getPhasesForProject: (projectId: string) => Phase[];
  getGroupedWorkstreams: (departmentId: string, userId: string, entries: TimeEntry[]) => GroupedWorkstreams;
  getProjectById: (id: string) => Project | undefined;

  // CRUD methods
  toggleDepartmentActive: (id: string) => void;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────────────

export function ReferenceDataProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>(() => loadOrSeed(LS_DEPARTMENTS, seedDepartments));
  const [projects] = useState<Project[]>(() => loadOrSeed(LS_PROJECTS, seedProjects));
  const [access] = useState<ProjectDepartmentAccess[]>(() => loadOrSeed(LS_ACCESS, seedAccess));
  const [phases] = useState<Phase[]>(() => loadOrSeed(LS_PHASES, seedPhases));
  const [activityTypes] = useState<ActivityType[]>(() => loadOrSeed(LS_ACTIVITY_TYPES, seedActivityTypes));
  const [workAreas] = useState<InternalWorkArea[]>(() => loadOrSeed(LS_WORK_AREAS, seedWorkAreas));

  // Persist whenever state changes (for future CRUD — currently init-only)
  // Will be wired in Bricks 2-5 via setX + useEffect

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

  const value = useMemo<ReferenceDataContextType>(
    () => ({
      departments,
      projects,
      projectDepartmentAccess: access,
      phases,
      activityTypes,
      internalWorkAreas: workAreas,
      getDepartmentById,
      getActivitiesForPhase,
      getPhasesForProject,
      getGroupedWorkstreams,
      getProjectById,
      toggleDepartmentActive,
    }),
    [departments, projects, access, phases, activityTypes, workAreas, getDepartmentById, getActivitiesForPhase, getPhasesForProject, getGroupedWorkstreams, getProjectById, toggleDepartmentActive],
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
