import { MapleLeaf } from "@/components/flags";

/** Cartão centralizado das telas de autenticação (confirmação de e-mail, nova senha…). */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  icon,
}: {
  /** Substitui a folha de bordo do topo (ex.: ícone de sucesso). */
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-container-low px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-surface-container-lowest shadow-xl ring-1 ring-outline-variant/60">
        <div aria-hidden="true" className="flex h-1.5">
          <span className="flex-1 bg-[#D52B1E]" />
          <span className="flex-[2] bg-surface-container-lowest" />
          <span className="flex-1 bg-[#D52B1E]" />
        </div>
        <div className="flex flex-col gap-5 p-6 md:p-8">
          {icon ?? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D52B1E]">
              <MapleLeaf className="h-6 w-6 text-white" />
            </span>
          )}
          <div>
            {eyebrow && (
              <p lang="fr" className="text-[14px] font-semibold text-[#D52B1E]">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-1 text-[26px] leading-8 font-semibold tracking-tight">{title}</h1>
            {description && <div className="mt-2 text-on-surface-variant type-body-medium">{description}</div>}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
