export default function InputTextarea({
  field,
  error,
  label,
  id,
  size = "lg",
  required = false,
  rows = 4,
}: {
  field?: string;
  error?: string;
  label: string;
  id: string;
  size?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div className="form-control">
      <label className="label" htmlFor={id}>
        <span className={`label-text text-${size}`}>{label}</span>
      </label>
      <textarea
        name={id}
        id={id}
        rows={rows}
        className={`textarea textarea-bordered text-${size}`}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? "details-error" : undefined}
        required={required ?? undefined}
      >
        {field}
      </textarea>

      {error && (
        <div className="pt-1 text-error" id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
