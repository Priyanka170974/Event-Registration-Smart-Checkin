const statusLabels = {
  OPEN: 'Open for registration',
  FULL: 'Capacity reached',
  checkedIn: 'Checked in',
  pending: 'Not checked in',
  success: 'Success',
  error: 'Needs attention',
};

export function StatusBadge({ status, children, tone }) {
  const normalized = String(status || 'pending').toLowerCase();
  const inferredTone = normalized.includes('open') || normalized === 'success' || normalized === 'checkedin'
    ? 'success'
    : normalized.includes('full') || normalized === 'error'
      ? 'danger'
      : 'neutral';
  const resolvedTone = tone || inferredTone;
  return <span className={`status-badge status-${resolvedTone}`}>{children || statusLabels[status] || status}</span>;
}
