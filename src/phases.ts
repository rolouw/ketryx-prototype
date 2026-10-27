import type { StatusKey } from './data';

export interface Deliverable {
  label: string;
  done: boolean;
}

export interface Milestone {
  name: string;
  deliverables: Deliverable[];
}

export interface Phase {
  name: string;
  milestones: Milestone[];
}

export interface Progress {
  done: number;
  total: number;
}

// Mock template: phase > milestone > deliverable labels. Replace with real data from the API.
const TEMPLATE: { name: string; milestones: [name: string, deliverables: string[]][] }[] = [
  {
    name: 'Plan',
    milestones: [
      ['Scope defined', ['Project charter', 'Stakeholder map']],
      ['Requirements baselined', ['User needs', 'System requirements', 'Baseline review']],
      ['Risks assessed', ['Hazard analysis', 'Risk file']],
    ],
  },
  {
    name: 'Design',
    milestones: [
      ['Architecture approved', ['Architecture spec', 'Design review']],
      ['Design controls linked', ['Controls mapped', 'Trace links checked', 'Gaps closed']],
      ['Design frozen', ['Change freeze', 'Sign-off']],
    ],
  },
  {
    name: 'Verify',
    milestones: [
      ['Test protocols written', ['Test plan', 'Protocol review']],
      ['Test executions passed', ['Execution run', 'Failures resolved', 'Evidence attached']],
      ['Traceability reviewed', ['Coverage report', 'Review notes']],
    ],
  },
  {
    name: 'Release',
    milestones: [
      ['Release candidate signed', ['Release notes', 'Approver sign-off']],
      ['Documentation released', ['Records exported', 'Archive created']],
      ['Handover complete', ['Handover brief', 'Support briefed']],
    ],
  },
];

/**
 * Builds mock phases for a project. A third milestone appears when (projectId + phaseIndex) is even.
 * Deliverables are marked done in order across the flattened list, up to the project's readiness %.
 */
export function seedPhases(projectId: number, readiness: number): Phase[] {
  const shape = TEMPLATE.map((phase, pi) => ({
    name: phase.name,
    milestones: phase.milestones.filter((_, mi) => mi < 2 || (projectId + pi) % 2 === 0),
  }));
  const total = shape.reduce((sum, p) => sum + p.milestones.reduce((s, [, labels]) => s + labels.length, 0), 0);
  const doneCount = Math.round((total * readiness) / 100);
  let index = 0;
  return shape.map((p) => ({
    name: p.name,
    milestones: p.milestones.map(([name, labels]) => ({
      name,
      deliverables: labels.map((label) => ({ label, done: index++ < doneCount })),
    })),
  }));
}

// Completion is always derived from deliverables, never stored.

export function milestoneProgress(m: Milestone): Progress {
  return { done: m.deliverables.filter((d) => d.done).length, total: m.deliverables.length };
}

export function phaseProgress(p: Phase): Progress {
  return p.milestones.map(milestoneProgress).reduce((a, b) => ({ done: a.done + b.done, total: a.total + b.total }), { done: 0, total: 0 });
}

export const isComplete = ({ done, total }: Progress) => total > 0 && done === total;

export const percentOf = ({ done, total }: Progress) => (total === 0 ? 0 : Math.round((100 * done) / total));

/** Same status language as project rows: complete is green, any progress is blue, nothing done is not started. */
export function progressStatus(progress: Progress): StatusKey {
  if (isComplete(progress)) return 'ready';
  return progress.done > 0 ? 'progress' : 'not';
}

export const STATE_TEXT: Record<StatusKey, string> = { ready: 'complete', progress: 'in progress', not: 'not started' };

/** The first incomplete phase, or the last phase when all are complete. */
export function currentPhaseIndex(phases: Phase[]): number {
  const i = phases.findIndex((p) => !isComplete(phaseProgress(p)));
  return i < 0 ? phases.length - 1 : i;
}
