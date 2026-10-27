import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

export interface MenuItem {
  label: string;
  icon: string | readonly string[];
  onSelect: () => void;
  danger?: boolean;
}

interface RowMenuProps {
  label: string;
  items: MenuItem[];
}

/**
 * "More actions" button with a dropdown menu. The menu renders into <body> with fixed
 * positioning so the table's scroll and accordion containers can't clip it.
 */
export function RowMenu({ label, items }: RowMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const id = useId();
  // Right edge and top of the menu, aligned under the button.
  const [pos, setPos] = useState<{ right: number; top: number } | null>(null);

  const open = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setPos({ right: window.innerWidth - r.right, top: r.bottom + 4 });
  };
  const close = (refocus: boolean) => {
    setPos(null);
    if (refocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!pos) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !buttonRef.current?.contains(t)) close(false);
    };
    // A fixed menu would drift away from its button on scroll, so close it instead.
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) close(false);
    };
    const onResize = () => close(false);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
    };
  }, [pos]);

  const onMenuKey = (e: KeyboardEvent) => {
    const els = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    const move = (n: number) => {
      e.preventDefault();
      els[(n + els.length) % els.length]?.focus();
    };
    if (e.key === 'ArrowDown') move(i + 1);
    else if (e.key === 'ArrowUp') move(i - 1);
    else if (e.key === 'Home') move(0);
    else if (e.key === 'End') move(els.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') close(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={pos ? 'icon-btn is-active' : 'icon-btn'}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={pos !== null}
        aria-controls={pos ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (pos) close(false);
          else open();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !pos) {
            e.preventDefault();
            open();
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {pos &&
        createPortal(
          <div ref={menuRef} id={id} role="menu" aria-label={label} className="menu" style={pos} onKeyDown={onMenuKey}>
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                className={item.danger ? 'menu-item is-danger' : 'menu-item'}
                onClick={() => {
                  close(true);
                  item.onSelect();
                }}
              >
                <Icon d={item.icon} size={16} />
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
