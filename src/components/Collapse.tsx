import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Animates its content open and closed by transitioning the grid row from 0fr to 1fr,
 * so no height has to be measured. Content stays mounted; while closed it is inert,
 * which removes it from the tab order and the accessibility tree.
 */
export function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.toggleAttribute('inert', !open);
  }, [open]);

  return (
    <div ref={ref} className="collapse" data-open={open}>
      <div className="collapse-inner">{children}</div>
    </div>
  );
}
