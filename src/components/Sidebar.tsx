import { useEffect, useRef, useState } from 'react';
import logoUrl from '../assets/ketryx-logo.svg';
import markUrl from '../assets/ketryx-mark.svg';
import { PROJECTS_HREF } from '../route';
import { ICONS, Icon } from './Icon';
import { Tooltip } from './Tooltip';

const NAV = [
  { label: 'Home', icon: ICONS.home },
  { label: 'Projects', icon: ICONS.projects, active: true, href: PROJECTS_HREF },
  { label: 'Graph', icon: ICONS.graph },
  { label: 'Repositories', icon: ICONS.repositories },
  { label: 'Documents', icon: ICONS.documents },
  { label: 'Compliance', icon: ICONS.compliance },
  { label: 'Organization', icon: ICONS.organization },
];

const SECONDARY = [
  { label: "What's new", href: '#whatsnew', icon: ICONS.whatsNew },
  { label: 'Help', href: '#help', icon: ICONS.help },
];

const STORAGE_KEY = 'ketryx.sidebarCollapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const toggledRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Storage can be unavailable (private mode); the sidebar still works, it just won't be remembered.
    }
    // The button that was clicked disappears, so hand focus to the one that replaces it.
    if (toggledRef.current) (collapsed ? expandRef : collapseRef).current?.focus();
  }, [collapsed]);

  const toggle = () => {
    toggledRef.current = true;
    setCollapsed((c) => !c);
  };

  return (
    <aside id="sidebar" className={collapsed ? 'sidebar is-collapsed' : 'sidebar'}>
      <div className="sidebar-head">
        <a href="#home" className="sidebar-logo">
          <img src={logoUrl} width={112} height={39} alt="Ketryx" />
        </a>
        <Tooltip text="Collapse sidebar" placement="right" className="sidebar-collapse-tip">
          <button ref={collapseRef} type="button" className="sidebar-toggle" aria-label="Collapse sidebar" aria-expanded={true} aria-controls="sidebar" onClick={toggle}>
            <Icon d={ICONS.sidebar} />
          </button>
        </Tooltip>
        {/* Collapsed: the logo mark doubles as the expand button and swaps to the sidebar icon on hover. */}
        <Tooltip text="Expand sidebar" placement="right" className="sidebar-expand-tip">
          <button ref={expandRef} type="button" className="sidebar-expand" aria-label="Expand sidebar" aria-expanded={false} aria-controls="sidebar" onClick={toggle}>
            <img src={markUrl} width={24} height={32} alt="" className="sidebar-mark" />
            <Icon d={ICONS.sidebar} className="sidebar-expand-icon" />
          </button>
        </Tooltip>
      </div>

      <nav aria-label="Main" className="nav">
        {NAV.map((n) => (
          <NavItem key={n.label} label={n.label} href={n.href ?? `#${n.label.toLowerCase()}`} icon={n.icon} active={n.active} collapsed={collapsed} />
        ))}
      </nav>

      <div className="sidebar-footer">
        {SECONDARY.map((n) => (
          <NavItem key={n.label} label={n.label} href={n.href} icon={n.icon} collapsed={collapsed} secondary />
        ))}
        <Tooltip text="Gabriel Pascualy" placement="right" disabled={!collapsed} className="nav-tip">
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              GP
            </span>
            <span className="nav-label">Gabriel Pascualy</span>
          </div>
        </Tooltip>
      </div>
    </aside>
  );
}

interface NavItemProps {
  label: string;
  href: string;
  icon: string | readonly string[];
  collapsed: boolean;
  active?: boolean;
  secondary?: boolean;
}

/** Icon plus label; when the sidebar is collapsed the label is clipped away and shown as a tooltip instead. */
function NavItem({ label, href, icon, collapsed, active, secondary }: NavItemProps) {
  return (
    <Tooltip text={label} placement="right" disabled={!collapsed} className="nav-tip">
      <a href={href} className={secondary ? 'nav-link is-secondary' : 'nav-link'} aria-current={active ? 'page' : undefined}>
        <Icon d={icon} />
        <span className="nav-label">{label}</span>
      </a>
    </Tooltip>
  );
}
