import { seedPhases, type Phase } from './phases';

export type StatusKey = 'progress' | 'not' | 'ready';

export interface Folder {
  id: string;
  label: string;
}

/** Folder id used for projects that are not in any folder. */
export const NO_FOLDER = 'none';
export const NO_FOLDER_LABEL = 'No folder';
export const NO_FOLDER_GROUP = 'Not in a folder';

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'demo', label: 'Demo Lab' },
  { id: 'robo', label: 'Robotic Workstation' },
];

export interface Project {
  id: number;
  name: string;
  version: string;
  /** A folder id, or NO_FOLDER. */
  folder: string;
  /** Design controls completion, 0–100, or null when there is no data. */
  design: number | null;
  /** Test executions completion, 0–100, or null when there is no data. */
  test: number | null;
  items: number;
  updated: string;
  minutesAgo: number;
  phases: Phase[];
  /** Middle part of Ketryx item keys, e.g. PROJ in KX-PROJ-1. */
  key?: string;
  repositories?: string[];
}

/** What the Create project form collects. */
export interface NewProject {
  name: string;
  key: string;
  repositories: string[];
}

export const STATUS: Record<StatusKey, { label: string; color: string; head: string; ink: string }> = {
  progress: { label: 'In progress', color: 'var(--blue)', head: 'var(--blue-tint)', ink: 'var(--blue-ink)' },
  not: { label: 'Not started', color: 'var(--purple)', head: 'var(--purple-tint)', ink: 'var(--purple-ink)' },
  ready: { label: 'Ready', color: 'var(--green)', head: 'var(--mint)', ink: 'var(--green-ink)' },
};

type Row = [name: string, version: string, folder: string, design: number | null, test: number | null, items: number, updated: string, minutesAgo: number];

const RAW: Row[] = [
  ['Quality Management', 'No version yet', 'none', 5, 25, 47, '4 min ago', 4],
  ['Industrial requirements', 'Industrial requirements baseline', 'none', 100, 100, 4, '44 min ago', 44],
  ['Second-team workflow fixture', 'No version yet', 'none', 100, 100, 1, '5 min ago', 5],
  ['Requirement Conflict Detection, Restart Interlock', 'No version yet', 'demo', 0, 100, 3, '1 day ago', 1440],
  ['Agent assurance laboratory', 'No version yet', 'demo', null, null, 0, '7 hours ago', 420],
  ['Sensor Replacement and Return to Service', 'No version yet', 'demo', 0, 0, 20, '12 hours ago', 720],
  ['Assessment application', 'Additional exercise application', 'robo', 96, 0, 27, '26 min ago', 26],
  ['Medical workstation', 'Serial-specific service', 'robo', 29, 33, 19, '3 min ago', 3],
  ['Movement assessment', 'Estimator update candidate', 'robo', 95, 50, 23, '46 min ago', 46],
  ['Industrial assembly', 'Guarded presentation assembly', 'robo', 100, 100, 14, '30 min ago', 30],
  ['Industrial workstation', 'Initial guarded parts', 'robo', 100, 100, 4, '28 min ago', 28],
  ['Medical requirements', 'Unassigned', 'robo', 100, 100, 8, '51 min ago', 51],
  ['Workstation controls', 'Guarded motion controls', 'robo', 100, 100, 13, '40 min ago', 40],
  ['Industrial requirements placeholder', 'Industrial requirement baseline', 'robo', 100, 100, 0, '9 hours ago', 540],
];

export const PROJECTS: Project[] = RAW.map(([name, version, folder, design, test, items, updated, minutesAgo], id) => {
  const project = { id, name, version, folder, design, test, items, updated, minutesAgo, phases: [] as Phase[] };
  project.phases = seedPhases(id, readinessOf(project));
  return project;
});

/** Not started if no data or 0/0, Ready if 100/100, otherwise In progress. */
export function statusOf(p: Project): StatusKey {
  if (p.design === null || p.test === null || (p.design === 0 && p.test === 0)) return 'not';
  if (p.design === 100 && p.test === 100) return 'ready';
  return 'progress';
}

/** A freshly created project: no folder, no design or test data yet, so it starts as Not started. */
export function createProject(id: number, { name, key, repositories }: NewProject, folder: string = NO_FOLDER): Project {
  return {
    id,
    name,
    version: 'No version yet',
    folder,
    design: null,
    test: null,
    items: 0,
    updated: 'Just now',
    minutesAgo: 0,
    phases: seedPhases(id, 0),
    key: key || undefined,
    repositories,
  };
}

/** Overall readiness as the average of design and test (open assumption in the handoff). */
export function readinessOf(p: Pick<Project, 'design' | 'test'>): number {
  if (p.design === null || p.test === null) return 0;
  return Math.round((p.design + p.test) / 2);
}
