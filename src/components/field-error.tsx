export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-danger">
      {errors[0]}
    </p>
  );
}
