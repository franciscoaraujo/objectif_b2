import { Icon } from "./icon";
import { MapleLeaf } from "./flags";
import { Button } from "./ui";

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Etiqueta curta acima do título (mesmo padrão das seções da página de vendas). */
  eyebrow?: string;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-[#D52B1E] uppercase">
            <MapleLeaf className="h-3.5 w-3.5" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] leading-9 font-semibold tracking-tight md:text-[34px] md:leading-[42px]">{title}</h1>
        {subtitle && <p className="mt-1 text-on-surface-variant type-body-large">{subtitle}</p>}
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
  if (tone === "primary") {
    // Destaque no estilo do hero da página de vendas: azul-escuro com folha de bordo.
    return (
      <section
        className={`relative overflow-hidden rounded-[24px] bg-[#0b1d45] p-5 text-white shadow-lg shadow-[#0b1d45]/20 [--md-linear-progress-active-indicator-color:#ff7b70] [--md-linear-progress-track-color:rgba(255,255,255,0.18)] ${className}`}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_80%_at_100%_0%,rgba(31,79,160,0.85),transparent),radial-gradient(50%_70%_at_0%_100%,rgba(213,43,30,0.35),transparent)]"
        />
        <MapleLeaf className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 -rotate-12 text-white/[0.06]" />
        <div className="relative">{children}</div>
      </section>
    );
  }
  const tones = {
    low: "bg-surface-container-lowest ring-1 ring-outline-variant/60",
    container: "bg-surface-container-lowest ring-1 ring-outline-variant/60",
    high: "bg-surface-container-low ring-1 ring-outline-variant/60",
  };
  return <section className={`rounded-[24px] p-5 ${tones[tone]} ${className}`}>{children}</section>;
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[18px] leading-6 font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warn" | "red";
}) {
  const tones = {
    neutral: "bg-surface-container-high text-on-surface-variant",
    primary: "bg-secondary-container text-on-secondary-container",
    success: "bg-[#d7ecd3] text-[#0f3a14]",
    warn: "bg-[#ffddb8] text-[#5a3200]",
    red: "bg-[#fde3e1] text-[#9b1c13]",
  };
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 type-label-medium ${tones[tone]}`}>
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
    <div className="flex flex-col items-center gap-2 rounded-[24px] border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-12 text-center">
      <span className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fde3e1] text-[#D52B1E]">
        <Icon name={icon} size={32} />
      </span>
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
      className="flex flex-col items-center gap-2 rounded-[24px] bg-error-container px-6 py-10 text-center text-on-error-container"
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

