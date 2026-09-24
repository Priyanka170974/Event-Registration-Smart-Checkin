export function PageIntro({ eyebrow, title, description, children }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="page-intro-actions">{children}</div>}
    </div>
  );
}
