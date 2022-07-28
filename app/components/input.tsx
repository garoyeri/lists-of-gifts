export default function Input({
  field,
  error,
  label,
  id,
  size = "lg",
  required = false,
}: {
  field?: string;
  error?: string;
  label: string;
  id: string;
  size?: string;
  required?: boolean;
}) {
  return (
    <div className="form-control">
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
        <div className="pt-1 text-error" id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
