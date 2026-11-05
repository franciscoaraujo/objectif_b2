export function Icon({
  name,
  fill = false,
  className = "",
  size,
}: {
  name: string;
  fill?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={`msym ${fill ? "msym-fill" : ""} ${className}`}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  );
}
