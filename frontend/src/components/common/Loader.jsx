export function Loader({ label = 'Loading' }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <span className="loader loader-large" aria-hidden="true" />
      <p>Loading your workspace…</p>
    </div>
  );
}
