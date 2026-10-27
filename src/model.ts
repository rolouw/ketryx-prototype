import { NO_FOLDER, NO_FOLDER_GROUP, STATUS, statusOf, type Folder, type Project, type StatusKey } from './data';

export type Tab = 'all' | StatusKey;
export type GroupBy = 'status' | 'folder';
export type SortBy = 'updated' | 'name' | 'fav';

export interface Group {
  id: string;
  label: string;
  head: string;
  ink: string;
  rows: Project[];
  /** Set for groups that are a real folder, so they can link to the folder's page. */
  folderId?: string;
}

const STATUS_ORDER: StatusKey[] = ['progress', 'not', 'ready'];

interface Options {
  folders: Folder[];
  tab: Tab;
  query: string;
  groupBy: GroupBy;
  sortBy: SortBy;
  favs: Set<number>;
}

export function buildGroups(projects: Project[], { folders, tab, query, groupBy, sortBy, favs }: Options): Group[] {
  const q = query.trim().toLowerCase();
  const filtering = tab !== 'all' || q !== '';
  const filtered = projects.filter(
    (p) => (tab === 'all' || statusOf(p) === tab) && (!q || p.name.toLowerCase().includes(q)),
  );

  const compare = (a: Project, b: Project) => {
    if (sortBy === 'fav' && favs.has(a.id) !== favs.has(b.id)) return favs.has(a.id) ? -1 : 1;
    return sortBy === 'name' ? a.name.localeCompare(b.name) : a.minutesAgo - b.minutesAgo;
  };

  if (groupBy === 'status') {
    return STATUS_ORDER.map((k) => ({
      id: `status:${k}`,
      label: STATUS[k].label,
      head: STATUS[k].head,
      ink: STATUS[k].ink,
      rows: filtered.filter((p) => statusOf(p) === k).sort(compare),
    })).filter((g) => g.rows.length > 0);
  }

  // Named folders first, "Not in a folder" last. Empty folders stay visible unless a filter is active.
  const folderGroups = folders
    .map((f) => ({ id: f.id, label: f.label }))
    .concat({ id: NO_FOLDER, label: NO_FOLDER_GROUP })
    .map((f) => ({
      id: `folder:${f.id}`,
      folderId: f.id === NO_FOLDER ? undefined : f.id,
      label: f.label,
      head: 'var(--neutral-head)',
      ink: 'var(--teal)',
      rows: filtered.filter((p) => p.folder === f.id).sort(compare),
    }));
  return folderGroups.filter((g) => g.rows.length > 0 || (!filtering && g.id !== `folder:${NO_FOLDER}`));
}

export function countByTab(projects: Project[]): Record<Tab, number> {
  const counts: Record<Tab, number> = { all: projects.length, progress: 0, not: 0, ready: 0 };
  for (const p of projects) counts[statusOf(p)]++;
  return counts;
}
