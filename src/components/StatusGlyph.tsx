import { STATUS, type StatusKey } from '../data';

function piePath(pct: number) {
  const a = (pct / 100) * 2 * Math.PI;
  const x = 8 + 5 * Math.sin(a);
  const y = 8 - 5 * Math.cos(a);
  return `M8 8 L8 3 A5 5 0 ${pct > 50 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
}

interface StatusGlyphProps {
  status: StatusKey;
  /** Fraction done, drawn as a pie while in progress. */
  pct: number;
  /** Accessible label; defaults to the status name. */
  label?: string;
  size?: number;
  /** Skip the native title tooltip, e.g. when a custom Tooltip wraps the glyph. */
  hideTitle?: boolean;
}

/** Dashed ring for Not started, filling pie for In progress, filled check for Ready. */
export function StatusGlyph({ status, pct, label, size = 20, hideTitle = false }: StatusGlyphProps) {
  const { label: statusLabel, color } = STATUS[status];
  const name = label ?? (status === 'progress' ? `${statusLabel}, ${pct}%` : statusLabel);
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" role="img" aria-label={name} className="status-glyph">
      {!hideTitle && <title>{name}</title>}
      <circle
        cx="8"
        cy="8"
        r="6.5"
        strokeWidth="1.6"
        strokeDasharray={status === 'not' ? '2.4 2.4' : undefined}
        style={{ stroke: color, fill: status === 'ready' ? color : 'none' }}
      />
      {status === 'progress' && pct > 0 && pct < 100 && <path d={piePath(pct)} style={{ fill: color }} />}
      {status === 'ready' && (
        <path d="M5 8.2l2 2 3.6-4" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
