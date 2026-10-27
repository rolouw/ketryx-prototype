import { useEffect, useState } from 'react';

/** Hash routes: #/projects (all projects) and #/projects/folders/<id> (one folder's projects). */
export interface Route {
  folderId: string | null;
}

export const PROJECTS_HREF = '#/projects';
export const folderHref = (folderId: string) => `${PROJECTS_HREF}/folders/${encodeURIComponent(folderId)}`;

function parse(hash: string): Route | null {
  // Placeholder links like "#help" aren't routes; leave the current page as it is.
  if (hash !== '' && !hash.startsWith('#/')) return null;
  const m = hash.match(/^#\/projects\/folders\/([^/]+)$/);
  return { folderId: m ? decodeURIComponent(m[1]) : null };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash) ?? { folderId: null });

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
