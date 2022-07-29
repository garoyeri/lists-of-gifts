export default function Input({
  field,
  error,
  label,
  id,
  size = "lg",
  required = false,
  className = "",
}: {
  field?: string;
  error?: string;
  label: string;
  id: string;
  size?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label" htmlFor={id}>
        <span className={`label-text text-${size}`}>{label}</span>
      </label>
      <input
        name={id}
        id={id}
        defaultValue={field}
        className={`input input-bordered input-${size}`}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? `${id}-error` : undefined}
        required={required ?? undefined}
      />
      {error && (
        <div className={`pt-1 text-error text-${size}`} id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
