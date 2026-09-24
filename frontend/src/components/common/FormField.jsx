export function FormField({ label, name, error, hint, children, className = '' }) {
  return (
    <label className={`form-field ${className}`.trim()} htmlFor={name}>
      <span className="form-label">{label}{children?.props?.required && <em> *</em>}</span>
      {children}
      {hint && !error && <span className="form-hint">{hint}</span>}
      {error && <span className="form-error">{error}</span>}
    </label>
  );
}

export function FieldError({ children }) {
  return children ? <span className="form-error">{children}</span> : null;
}
