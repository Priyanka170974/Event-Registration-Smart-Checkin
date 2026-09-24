export function StatCard({ label, value, detail, icon: Icon, tone = 'teal' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon size={19} /></div>
      <div className="stat-content">
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </article>
  );
}
