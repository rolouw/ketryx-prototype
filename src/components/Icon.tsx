import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'd'> {
  d: string | readonly string[];
  size?: number;
}

/** Stroke icon on a 24×24 grid, inheriting the current text color. */
export function Icon({ d, size = 18, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {(typeof d === 'string' ? [d] : d).map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

export const ICONS = {
  home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  projects: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z',
  graph: 'M6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM18 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM9 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 7l8 1M7 8l1.5 8M16.5 10l-6 6.5',
  repositories: 'M6 3h12v18l-6-4-6 4z',
  documents: 'M7 3h7l5 5v13H7zM14 3v5h5',
  compliance: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5',
  organization: 'M4 21V7l8-4 8 4v14M9 21v-6h6v6M9 10h.01M15 10h.01',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  folderPlus: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M12 10v6M9 13h6'],
  status: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 12V6a6 6 0 0 1 6 6z',
  plus: 'M12 5v14M5 12h14',
  search: ['M20 20l-4-4', 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z'],
  chevronDown: 'M6 9l6 6 6-6',
  chevronLeft: 'M15 6l-6 6 6 6',
  arrowUp: ['M12 19V5', 'M6 11l6-6 6 6'],
  expand: ['M14 4h6v6', 'M20 4l-6 6', 'M10 20H4v-6', 'M4 20l6-6'],
  collapse: ['M20 4l-6 6', 'M14 4v6h6', 'M4 20l6-6', 'M10 20v-6H4'],
  sliders: ['M4 7h9', 'M17 7h3', 'M15 5v4', 'M4 12h3', 'M11 12h9', 'M9 10v4', 'M4 17h11', 'M19 17h1', 'M17 15v4'],
  close: 'M6 6l12 12M18 6L6 18',
  whatsNew: ['M4 11h16v9H4z', 'M3 7h18v4H3z', 'M12 7v13', 'M12 7C10.5 4 7 4 7 6s3 1 5 1zM12 7c1.5-3 5-3 5-1s-3 1-5 1z'],
  help: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M9.5 9.5a2.5 2.5 0 0 1 4.9.7c0 1.6-2.4 2.1-2.4 3.3', 'M12 17h.01'],
  sidebar: ['M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M9 4v16'],
  trash: ['M4 7h16', 'M10 11v6M14 11v6', 'M6 7l1 13h10l1-13', 'M9 7V4h6v3'],
  archive: ['M3 4h18v4H3z', 'M5 8v12h14V8', 'M10 12h4'],
  link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'],
  heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
} as const;
