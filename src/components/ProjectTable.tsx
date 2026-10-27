import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { NO_FOLDER, NO_FOLDER_LABEL, STATUS, readinessOf, statusOf, type Folder, type Project } from '../data';
import type { Group } from '../model';
import { currentPhaseIndex } from '../phases';
import { folderHref } from '../route';
import { Collapse } from './Collapse';
import { ICONS, Icon } from './Icon';
import { PhasesPanel } from './PhasesPanel';
import { Ring } from './Ring';
import { StatusGlyph } from './StatusGlyph';
import { Tooltip } from './Tooltip';

interface ProjectTableProps {
  groups: Group[];
  folders: Folder[];
  showFolder: boolean;
  collapsed: Set<string>;
  onToggleGroup: (id: string) => void;
  expanded: Set<number>;
  onToggleProject: (id: number) => void;
  favs: Set<number>;
  onToggleFav: (id: number) => void;
  /** A just-created project to flash and scroll into view. */
  highlightId: number | null;
  /** Replaces the default "no matches" text when there are no groups to show. */
  emptyMessage?: string;
}

export function ProjectTable({
  groups,
  folders,
  showFolder,
  collapsed,
  onToggleGroup,
  expanded,
  onToggleProject,
  favs,
  onToggleFav,
  highlightId,
  emptyMessage = 'No projects match these filters. Clear the filter or choose another status.',
}: ProjectTableProps) {
  const folderLabel = (id: string) => (id === NO_FOLDER ? NO_FOLDER_LABEL : folders.find((f) => f.id === id)?.label ?? NO_FOLDER_LABEL);
  const layout = {
    '--cols': showFolder
      ? '36px 24px minmax(0,3fr) 150px 168px 100px 100px 44px 44px'
      : '36px 24px minmax(0,3fr) 168px 100px 100px 44px 44px',
    '--min-w': showFolder ? '1086px' : '926px',
  } as CSSProperties;

  // The column headings live outside the horizontal scroller so they can stick to the top of the
  // vertically scrolling panel; their horizontal position is kept in sync with the table below.
  const headRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sentinel = sentinelRef.current?.getBoundingClientRect();
        const head = headRef.current?.getBoundingClientRect();
        // While resting, the sentinel sits right above the headings; once stuck it scrolls away above them.
        if (sentinel && head) setStuck(sentinel.bottom < head.top - 0.5);
      });
    };
    check();
    window.addEventListener('scroll', check, { capture: true, passive: true });
    window.addEventListener('resize', check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', check, { capture: true });
      window.removeEventListener('resize', check);
    };
  }, []);

  const syncHead = () => {
    if (headRef.current && bodyRef.current) headRef.current.scrollLeft = bodyRef.current.scrollLeft;
  };

  return (
    <div className="project-table" style={layout}>
      <div ref={sentinelRef} className="table-head-sentinel" aria-hidden="true" />
      <div ref={headRef} className={stuck ? 'table-head-wrap is-stuck' : 'table-head-wrap'}>
        <div className="table-head" aria-hidden={groups.length === 0}>
          <span />
          <span />
          <span>Name</span>
          {showFolder && <span>Folder</span>}
          <span className="ring-heads">
            <span>Design</span>
            <span>Test</span>
          </span>
          <span>Configurations</span>
          <span>Updated</span>
          <span />
          <span />
        </div>
      </div>

      <div ref={bodyRef} className="table-scroll" onScroll={syncHead}>
        <div className="table">
          {groups.map((g) => {
            const open = !collapsed.has(g.id);
            return (
              <section key={g.id} className="group" aria-label={g.label}>
                {/* The whole bar toggles the group; "Open folder" is a separate link layered on top of it. */}
                <div className="group-head-wrap">
                  <button
                    type="button"
                    className={g.folderId ? 'group-head has-link' : 'group-head'}
                    aria-expanded={open}
                    onClick={() => onToggleGroup(g.id)}
                    style={{ background: g.head, color: g.ink }}
                  >
                    <span>{g.label}</span>
                    <span className="group-count">{g.rows.length}</span>
                    <Icon d={ICONS.chevronDown} size={14} strokeWidth={2.6} className="chevron" />
                  </button>
                  {g.folderId && (
                    <a href={folderHref(g.folderId)} className="group-open" aria-label={`Open folder ${g.label}`}>
                      Open folder
                    </a>
                  )}
                </div>
                <Collapse open={open}>
                  {g.rows.length === 0 && <p className="group-empty">No projects in this folder yet.</p>}
                  {g.rows.map((p) => (
                    <ProjectRow
                      key={p.id}
                      project={p}
                      folderLabel={showFolder ? folderLabel(p.folder) : null}
                      expanded={expanded.has(p.id)}
                      onToggle={() => onToggleProject(p.id)}
                      fav={favs.has(p.id)}
                      onToggleFav={() => onToggleFav(p.id)}
                      highlighted={p.id === highlightId}
                    />
                  ))}
                </Collapse>
              </section>
            );
          })}

          {groups.length === 0 && <p className="empty">{emptyMessage}</p>}
        </div>
      </div>
    </div>
  );
}

interface ProjectRowProps {
  project: Project;
  /** Shown in the Folder column; null hides the column (when grouped by folder). */
  folderLabel: string | null;
  expanded: boolean;
  onToggle: () => void;
  fav: boolean;
  onToggleFav: () => void;
  highlighted: boolean;
}

// Controls inside the row must not also toggle the row.
const stop = (e: MouseEvent) => e.stopPropagation();

function ProjectRow({ project: p, folderLabel, expanded, onToggle, fav, onToggleFav, highlighted }: ProjectRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlighted]);

  const hasData = p.design !== null && p.test !== null;
  const ci = currentPhaseIndex(p.phases);
  const phaseNow = `Phase ${ci + 1}: ${p.phases[ci].name}`;
  const status = statusOf(p);
  const readiness = readinessOf(p);
  const completeText = `Project is ${readiness}% complete`;

  return (
    <div ref={ref} className={['project', expanded && 'is-open', highlighted && 'is-new'].filter(Boolean).join(' ')}>
      {/* The whole row is a mouse target; the chevron button is the keyboard path. */}
      <article className="row" onClick={onToggle}>
        <button
          type="button"
          className="row-chevron"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Hide' : 'Show'} phases for ${p.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          <Icon d={ICONS.chevronDown} size={16} strokeWidth={2.6} />
        </button>
        <Tooltip text={completeText}>
          <StatusGlyph status={status} pct={readiness} label={`${STATUS[status].label}. ${completeText}`} hideTitle />
        </Tooltip>
        <div className="name-cell">
          {/* No project page exists yet, so the link doesn't navigate (or add a history entry). */}
          <a
            href="#project"
            title={p.name}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {p.name}
          </a>
          <span className="version" title={phaseNow}>
            {phaseNow}
          </span>
        </div>
        {folderLabel !== null && <span className={p.folder === NO_FOLDER ? 'folder is-none' : 'folder'}>{folderLabel}</span>}
        <div className="readiness" title={hasData ? `Design controls ${p.design}%, Test executions ${p.test}%` : 'No design controls or test executions yet'}>
          <Ring value={p.design} label="Design controls" />
          <Ring value={p.test} label="Test executions" />
        </div>
        <span className="cell">{p.items}</span>
        <span className="cell muted">{p.updated}</span>
        <button type="button" className="icon-btn" aria-label={`More actions for ${p.name}`} onClick={stop}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-pressed={fav}
          aria-label={fav ? `Remove ${p.name} from favorites` : `Add ${p.name} to favorites`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true" className={fav ? 'heart is-fav' : 'heart'}>
            <path d={ICONS.heart} />
          </svg>
        </button>
      </article>
      <Collapse open={expanded}>
        <PhasesPanel phases={p.phases} />
      </Collapse>
    </div>
  );
}
