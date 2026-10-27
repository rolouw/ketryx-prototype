import { useEffect, useState } from 'react';

/** Hash routes: #/projects (all projects) and #/projects/folders/<id> (one folder's projects). */
export interface Route {
  folderId: string | null;
  /** From a copied project link (#/projects?project=<id>): the project to open and highlight. */
  projectId: number | null;
}

export const PROJECTS_HREF = '#/projects';
export const projectHref = (projectId: number) => `${PROJECTS_HREF}?project=${projectId}`;
export const folderHref = (folderId: string) => `${PROJECTS_HREF}/folders/${encodeURIComponent(folderId)}`;

function parse(hash: string): Route | null {
  // Placeholder links like "#help" aren't routes; leave the current page as it is.
  if (hash !== '' && !hash.startsWith('#/')) return null;
  const [path, search = ''] = hash.split('?');
  const m = path.match(/^#\/projects\/folders\/([^/]+)$/);
  const project = new URLSearchParams(search).get('project');
  return { folderId: m ? decodeURIComponent(m[1]) : null, projectId: project && /^\d+$/.test(project) ? Number(project) : null };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash) ?? { folderId: null, projectId: null });

  useEffect(() => {
    const onChange = () => {
      const next = parse(window.location.hash);
      if (next) setRoute(next);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
