import type { CSSProperties } from 'react';
import {
  STATE_TEXT,
  isComplete,
  milestoneProgress,
  percentOf,
  phaseProgress,
  progressStatus,
  type Milestone,
  type Phase,
} from '../phases';
import { StatusGlyph } from './StatusGlyph';

/** Expanded content of a project row: one column per phase, each with its milestone cards. */
export function PhasesPanel({ phases }: { phases: Phase[] }) {
  const completeCount = phases.filter((p) => isComplete(phaseProgress(p))).length;
  const allDone = completeCount === phases.length;

  return (
    <div className="phases">
      <div className="phases-head">
        <span className="phases-title">Phases</span>
        <span className={allDone ? 'pill is-done' : 'pill'}>
          {allDone ? 'Project complete' : `${completeCount} of ${phases.length} phases complete`}
        </span>
      </div>
      <ol className="phase-grid" style={{ '--phase-count': phases.length } as CSSProperties}>
        {phases.map((phase, i) => (
          <PhaseColumn key={phase.name} phase={phase} index={i} />
        ))}
      </ol>
    </div>
  );
}

function PhaseColumn({ phase, index }: { phase: Phase; index: number }) {
  const progress = phaseProgress(phase);
  const status = progressStatus(progress);
  const pct = percentOf(progress);

  return (
    <li className="phase">
      <div className="phase-head">
        <span className="eyebrow">Phase {index + 1}</span>
        <span className="phase-name">
          <StatusGlyph status={status} pct={pct} size={18} label={`${phase.name} ${STATE_TEXT[status]}`} />
          {phase.name}
        </span>
      </div>
      <ul className="milestones">
        {phase.milestones.map((m) => (
          <MilestoneCard key={m.name} milestone={m} />
        ))}
      </ul>
    </li>
  );
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const progress = milestoneProgress(milestone);
  const status = progressStatus(progress);

  return (
    <li className="milestone">
      <div className="milestone-head">
        <StatusGlyph status={status} pct={percentOf(progress)} size={20} label={`${milestone.name} ${STATE_TEXT[status]}`} />
        <span className="milestone-name">{milestone.name}</span>
        <span className="milestone-count">
          {progress.done}/{progress.total}
        </span>
      </div>
      {/* Display only: deliverables are not editable in this prototype. */}
      <ul className="deliverables">
        {milestone.deliverables.map((d) => (
          <li key={d.label} className={d.done ? 'deliverable is-done' : 'deliverable'}>
            <span className="checkbox" aria-hidden="true">
              {d.done && (
                <svg width="11" height="11" viewBox="0 0 16 16">
                  <path d="M3.5 8.5l3 3 6-6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span>
              {d.label}
              <span className="sr-only"> ({d.done ? 'done' : 'not done'})</span>
            </span>
          </li>
        ))}
      </ul>
    </li>
  );
}
