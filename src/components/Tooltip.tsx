import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  children: ReactNode;
  /** Where the tooltip sits relative to its anchor. */
  placement?: 'top' | 'right';
  /** Keeps the anchor in place but never shows the tooltip. */
  disabled?: boolean;
  className?: string;
}

/**
 * Hover and keyboard-focus tooltip. It renders into <body> with fixed positioning
 * so the table's scroll and accordion containers can't clip it.
 */
export function Tooltip({ text, children, placement = 'top', disabled = false, className }: TooltipProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = () => {
    if (disabled) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(placement === 'right' ? { x: r.right, y: r.top + r.height / 2 } : { x: r.left + r.width / 2, y: r.top });
  };
  const hide = () => setPos(null);

  // A fixed tooltip would drift away from its anchor on scroll, so hide it instead.
  useEffect(() => {
    if (!pos) return;
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', hide, { capture: true });
  }, [pos]);

  useEffect(() => {
    if (disabled) hide();
  }, [disabled]);

  return (
    <>
      <span
        ref={ref}
        className={className ? `tooltip-anchor ${className}` : 'tooltip-anchor'}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={(e) => e.target.matches(':focus-visible') && show()}
        onBlur={hide}
        aria-describedby={pos ? id : undefined}
      >
        {children}
      </span>
      {pos &&
        createPortal(
          <span id={id} role="tooltip" className={`tooltip is-${placement}`} style={{ left: pos.x, top: pos.y }}>
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}
