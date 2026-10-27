const CIRCUMFERENCE = 135.1; // 2π × 21.5

/** 48px readiness ring: green only at 100%, blue below, empty track with "n/a" when there is no data. */
export function Ring({ value, label }: { value: number | null; label: string }) {
  const has = value !== null;
  const color = value === 100 ? 'var(--green)' : 'var(--blue)';
  return (
    <span className="ring">
      <svg width="48" height="48" viewBox="0 0 48 48" role="img" aria-label={`${label} ${has ? `${value}%` : 'not available'}`}>
        <circle cx="24" cy="24" r="21.5" className="ring-track" />
        <circle
          cx="24"
          cy="24"
          r="21.5"
          fill="none"
          strokeWidth="5"
          strokeLinecap={has && value > 0 ? 'round' : 'butt'}
          strokeDasharray={`${has ? (CIRCUMFERENCE * value) / 100 : 0} ${CIRCUMFERENCE}`}
          transform="rotate(-90 24 24)"
          style={{ stroke: color }}
        />
      </svg>
      <span className="ring-label" aria-hidden="true">
        {has ? (
          <>
            {value}
            <small>%</small>
          </>
        ) : (
          'n/a'
        )}
      </span>
    </span>
  );
}
