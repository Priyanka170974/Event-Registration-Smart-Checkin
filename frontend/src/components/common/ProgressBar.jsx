export function ProgressBar({ value, max, tone = 'teal', label }) {
  const safeMax = Number(max) || 0;
  const safeValue = Math.min(Math.max(Number(value) || 0, 0), safeMax || 1);
  const width = safeMax ? Math.round((safeValue / safeMax) * 100) : 0;
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label"><span>{label}</span><strong>{width}%</strong></div>}
      <div className="progress-track" aria-label={label} role="progressbar" aria-valuenow={width} aria-valuemin="0" aria-valuemax={safeMax || 1}>
        <span className={`progress-fill progress-${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
