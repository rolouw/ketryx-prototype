import { useEffect, useRef, useState } from 'react';
import type { GroupBy, SortBy, Tab } from '../model';
import { ICONS, Icon } from './Icon';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All projects' },
  { key: 'progress', label: 'In progress' },
  { key: 'not', label: 'Not started' },
  { key: 'ready', label: 'Ready' },
];

const SORTS: { value: SortBy; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Updated' },
  { value: 'fav', label: 'Favourites' },
];

const GROUPS: { key: GroupBy; label: string; icon: string }[] = [
  { key: 'status', label: 'Status', icon: ICONS.status },
  { key: 'folder', label: 'Folders', icon: ICONS.folder },
];

export function GroupBySwitch({ value, onChange }: { value: GroupBy; onChange: (v: GroupBy) => void }) {
  return (
    <div role="group" aria-label="Group by" className="segmented">
      {GROUPS.map((g) => (
        <button key={g.key} type="button" aria-pressed={value === g.key} onClick={() => onChange(g.key)}>
          <Icon d={g.icon} size={16} />
          {g.label}
        </button>
      ))}
    </div>
  );
}

interface ToolbarProps {
  tab: Tab;
  counts: Record<Tab, number>;
  onTab: (t: Tab) => void;
  query: string;
  onQuery: (q: string) => void;
  sortBy: SortBy;
  onSort: (s: SortBy) => void;
}

const SEARCH_PLACEHOLDER = 'Search project by name';

/** The full placeholder when it fits, otherwise just "Search", so a squeezed field never shows "S…". */
function useFittingPlaceholder() {
  const ref = useRef<HTMLInputElement>(null);
  const [short, setShort] = useState(false);
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const observer = new ResizeObserver(([entry]) => setShort(entry.contentRect.width < 150));
    observer.observe(input);
    return () => observer.disconnect();
  }, []);
  return { ref, placeholder: short ? 'Search' : SEARCH_PLACEHOLDER };
}

export function Toolbar({ tab, counts, onTab, query, onQuery, sortBy, onSort }: ToolbarProps) {
  const search = useFittingPlaceholder();
  return (
    <div className="toolbar">
      <label className="search">
        <Icon d={ICONS.search} size={16} strokeWidth={2} className="search-icon" />
        <span className="sr-only">Search project by name</span>
        <input ref={search.ref} type="search" placeholder={search.placeholder} value={query} onChange={(e) => onQuery(e.target.value)} />
      </label>
      <div role="tablist" aria-label="Filter by status" className="tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="tab" onClick={() => onTab(t.key)}>
            {t.label} <span className="tab-count">{counts[t.key]}</span>
          </button>
        ))}
      </div>
      {/* A native select can't mix font weights, so the visible "Sort by: Name" is drawn by the
          wrapper and the real select sits invisibly on top of it to keep native behaviour. */}
      <div className="sort">
        <span className="sort-display" aria-hidden="true">
          <span className="sort-label">Sort by:</span> {SORTS.find((s) => s.value === sortBy)?.label}
        </span>
        <select aria-label="Sort by" value={sortBy} onChange={(e) => onSort(e.target.value as SortBy)}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Icon d={ICONS.chevronDown} size={14} strokeWidth={2.6} />
      </div>
    </div>
  );
}
