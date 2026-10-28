import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { INITIAL_FOLDERS, NO_FOLDER, PROJECTS, createProject, statusOf, type Folder, type NewProject, type Project } from './data';
import { buildGroups, countByTab, type GroupBy, type SortBy, type Tab } from './model';
import { PROJECTS_HREF, projectHref, useRoute } from './route';
import { AiLauncher, AiPanel } from './components/AiPanel';
import { CreateProjectDialog } from './components/CreateProjectDialog';
import { ICONS, Icon } from './components/Icon';
import { NewFolderDialog } from './components/NewFolderDialog';
import { ProjectTable } from './components/ProjectTable';
import { Sidebar } from './components/Sidebar';
import { Toast, type ToastMessage } from './components/Toast';
import { GroupBySwitch, Toolbar } from './components/Toolbar';

function toggleIn<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function App() {
  const [tab, setTab] = useState<Tab>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [query, setQuery] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [favs, setFavs] = useState<Set<number>>(() => new Set([0]));
  // The Ready group starts collapsed; finished projects need the least attention.
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(['status:ready']));
  // Project rows open independently; all start closed.
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(PROJECTS);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  // The most recently created project, briefly highlighted and scrolled into view.
  const [highlightId, setHighlightId] = useState<number | null>(null);
  // Clear it once the flash has played, so regrouping or filtering later doesn't replay it.
  useEffect(() => {
    if (highlightId === null) return;
    const t = setTimeout(() => setHighlightId(null), 2500);
    return () => clearTimeout(t);
  }, [highlightId]);

  // On a folder page only that folder's projects are shown, grouped by status.
  const route = useRoute();
  const folder = route.folderId ? folders.find((f) => f.id === route.folderId) ?? null : null;
  const scoped = useMemo(() => (folder ? projects.filter((p) => p.folder === folder.id) : projects), [projects, folder]);
  const effectiveGroupBy: GroupBy = folder ? 'status' : groupBy;

  const counts = useMemo(() => countByTab(scoped), [scoped]);
  const groups = useMemo(
    () => buildGroups(scoped, { folders, tab, query, groupBy: effectiveGroupBy, sortBy, favs }),
    [scoped, folders, tab, query, effectiveGroupBy, sortBy, favs],
  );

  // Start each page at the top.
  const panelBodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelBodyRef.current?.scrollTo({ top: 0 });
    document.title = folder ? `${folder.label} · Projects · Ketryx` : 'Projects · Ketryx';
  }, [folder]);

  // Makes sure a project isn't hidden by the current filters or a collapsed group, then flashes it.
  const reveal = (p: Project) => {
    setHighlightId(p.id);
    const status = statusOf(p);
    if (tab !== 'all' && tab !== status) setTab('all');
    if (query && !p.name.toLowerCase().includes(query.trim().toLowerCase())) setQuery('');
    setCollapsed((c) => {
      const next = new Set(c);
      next.delete(`status:${status}`);
      next.delete(`folder:${p.folder}`);
      return next;
    });
  };

  // Picking a status tab opens that status's group, so the filtered projects aren't hidden behind a collapsed bar.
  const selectTab = (next: Tab) => {
    setTab(next);
    if (next === 'all') return;
    setCollapsed((c) => {
      const open = new Set(c);
      open.delete(`status:${next}`);
      return open;
    });
  };

  const addProject = (input: NewProject) => {
    const id = Math.max(-1, ...projects.map((p) => p.id)) + 1;
    const project = createProject(id, input);
    setProjects((ps) => [...ps, project]);
    setCreateProjectOpen(false);
    reveal(project);
    // Added to a different folder than the one on screen: go where the project can be seen.
    if (folder && project.folder !== folder.id) window.location.hash = PROJECTS_HREF;
  };

  // A copied project link opens the projects page with that project expanded and highlighted.
  useEffect(() => {
    const p = route.projectId === null ? undefined : projects.find((x) => x.id === route.projectId);
    if (!p) return;
    setExpanded((e) => new Set(e).add(p.id));
    reveal(p);
    // Only react to the link itself, not to later edits of the project list.
  }, [route.projectId]);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const showToast = (text: string, onUndo?: () => void) => setToast({ key: Date.now(), text, onUndo });

  // Archived projects aren't shown anywhere yet, so archiving removes the row just like deleting it.
  const removeProject = (id: number, verb: 'Deleted' | 'Archived') => {
    const index = projects.findIndex((p) => p.id === id);
    const project = projects[index];
    if (!project) return;
    setProjects((ps) => ps.filter((p) => p.id !== id));
    showToast(`${verb} “${project.name}”`, () => {
      setProjects((ps) => [...ps.slice(0, index), project, ...ps.slice(index)]);
      reveal(project);
    });
  };

  const copyProjectLink = (id: number) => {
    const url = `${window.location.origin}${window.location.pathname}${projectHref(id)}`;
    navigator.clipboard
      .writeText(url)
      .then(() => showToast('Link copied to clipboard'))
      .catch(() => showToast('Couldn’t copy the link'));
  };

  const createFolder = (label: string) => {
    setFolders((fs) => [...fs, { id: crypto.randomUUID(), label }]);
    setNewFolderOpen(false);
    // Switch to the folder view so the new folder is visible straight away.
    setGroupBy('folder');
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <div className="panel">
          {/* The panel is fixed to the viewport height; its content scrolls inside it. */}
          <div ref={panelBodyRef} className="panel-body">
            <nav aria-label="Breadcrumb" className="breadcrumb">
              <a href="#org">Ketryx Academy</a>
              <span aria-hidden="true">/</span>
              {folder ? (
                <>
                  <a href={PROJECTS_HREF}>Projects</a>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">{folder.label}</span>
                </>
              ) : (
                <span aria-current="page">Projects</span>
              )}
            </nav>

            <div className="title-row">
              <div className="title-block">
                {folder && (
                  <a href={PROJECTS_HREF} className="back-link">
                    <Icon d={ICONS.chevronLeft} size={16} strokeWidth={2.4} />
                    Back to projects
                  </a>
                )}
                <h1>{folder ? `${folder.label} Projects` : 'Projects'}</h1>
              </div>
              <div className="actions">
                {/* Folders don't nest, so New folder is only offered on the main Projects page. */}
                {!folder && (
                  <button type="button" className="btn btn-outline" aria-haspopup="dialog" onClick={() => setNewFolderOpen(true)}>
                    <Icon d={ICONS.folderPlus} />
                    New folder
                  </button>
                )}
                <button type="button" className="btn btn-primary" aria-haspopup="dialog" onClick={() => setCreateProjectOpen(true)}>
                  <Icon d={ICONS.plus} size={16} strokeWidth={2.4} />
                  Create project
                </button>
              </div>
            </div>

            {!folder && (
              <div className="groupby-row">
                <GroupBySwitch value={groupBy} onChange={setGroupBy} />
              </div>
            )}

            <Toolbar tab={tab} counts={counts} onTab={selectTab} query={query} onQuery={setQuery} sortBy={sortBy} onSort={setSortBy} />

            <ProjectTable
              groups={groups}
              folders={folders}
              showFolder={effectiveGroupBy !== 'folder' && !folder}
              collapsed={collapsed}
              onToggleGroup={(id) => setCollapsed((c) => toggleIn(c, id))}
              expanded={expanded}
              onToggleProject={(id) => setExpanded((e) => toggleIn(e, id))}
              favs={favs}
              onToggleFav={(id) => setFavs((f) => toggleIn(f, id))}
              onDelete={(id) => removeProject(id, 'Deleted')}
              onArchive={(id) => removeProject(id, 'Archived')}
              onCopyLink={copyProjectLink}
              highlightId={highlightId}
              emptyMessage={folder && scoped.length === 0 ? 'No projects in this folder yet. Create one to get started.' : undefined}
            />
          </div>
        </div>

        <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      </main>

      {!aiOpen && <AiLauncher onOpen={() => setAiOpen(true)} />}

      <NewFolderDialog
        open={newFolderOpen}
        existingNames={folders.map((f) => f.label)}
        onCancel={() => setNewFolderOpen(false)}
        onCreate={createFolder}
      />

      <CreateProjectDialog
        open={createProjectOpen}
        existingNames={projects.map((p) => p.name)}
        existingKeys={projects.flatMap((p) => (p.key ? [p.key] : []))}
        folders={folders}
        defaultFolder={folder?.id ?? NO_FOLDER}
        onCancel={() => setCreateProjectOpen(false)}
        onCreate={addProject}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
