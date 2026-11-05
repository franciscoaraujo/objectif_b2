import { Icon } from "./icon";
import { Button } from "./ui";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="type-headline-medium">{title}</h1>
        {subtitle && <p className="text-on-surface-variant type-body-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Surface({
  children,
  className = "",
  tone = "low",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "low" | "container" | "high" | "primary";
}) {
  const tones = {
    low: "bg-surface-container-low",
    container: "bg-surface-container",
    high: "bg-surface-container-high",
    primary: "bg-primary-container text-on-primary-container",
  };
  return <section className={`rounded-lg p-4 ${tones[tone]} ${className}`}>{children}</section>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="type-title-medium">{children}</h2>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warn";
}) {
  const tones = {
    neutral: "bg-surface-container-high text-on-surface-variant",
    primary: "bg-secondary-container text-on-secondary-container",
    success: "bg-[#d7ecd3] text-[#0f3a14]",
    warn: "bg-[#ffddb8] text-[#5a3200]",
  };
  return (
    <span className={`inline-flex h-6 items-center rounded-sm px-2 type-label-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* ───────── Estados ───────── */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-outline-variant px-6 py-10 text-center">
      <Icon name={icon} size={40} className="text-on-surface-variant" />
      <p className="type-title-medium">{title}</p>
      {description && <p className="max-w-sm text-on-surface-variant type-body-medium">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-2 rounded-lg bg-error-container px-6 py-10 text-center text-on-error-container"
    >
      <Icon name="cloud_off" size={40} />
      <p className="type-title-medium">Algo deu errado</p>
      <p className="max-w-sm type-body-medium">{message}</p>
      {onRetry && (
        <div className="mt-2">
          <Button variant="tonal" icon="refresh" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Carregando">
      <Skeleton className="mb-2 h-9 w-56" />
      <Skeleton className="mb-6 h-4 w-72" />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    </div>
  );
}
