import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Flags, MapleLeaf } from "@/components/flags";
import { DRAW_FALLBACK, getFrenchDrawStats } from "@/lib/canada-data";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const BENEFITS = [
  { icon: "trending_up", text: "Até +50 pontos no Express Entry com NCLC 7 em francês" },
  { icon: "calendar_view_week", text: "Rotina pronta de 26 semanas, do A1 ao B2" },
  { icon: "task_alt", text: "Simulados, caderno de erros e vocabulário num só lugar" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string; modo?: string }> }) {
  const { erro, modo } = await searchParams;
  const configError = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const draws = (await getFrenchDrawStats()) ?? DRAW_FALLBACK;

  return (
    <main className="grid min-h-dvh bg-surface lg:grid-cols-[1.05fr_1fr]">
      {/* Painel da marca */}
      <section className="relative overflow-hidden bg-[#0b1d45] text-white">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 flex h-1.5">
          <span className="flex-1 bg-[#D52B1E]" />
          <span className="flex-[2] bg-white" />
          <span className="flex-1 bg-[#D52B1E]" />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_15%,rgba(31,79,160,0.9),transparent),radial-gradient(55%_55%_at_0%_100%,rgba(213,43,30,0.45),transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <MapleLeaf className="pointer-events-none absolute -bottom-32 -left-24 h-[460px] w-[460px] -rotate-12 text-white/[0.05]" />
        <MapleLeaf className="pointer-events-none absolute top-24 right-10 hidden h-14 w-14 rotate-12 text-[#D52B1E]/50 lg:block" />

        <div className="relative flex h-full flex-col px-6 pt-8 pb-10 md:px-12 lg:px-16 lg:py-12">
          <Link href="/conheca" className="flex w-fit items-center gap-2 text-[18px] font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D52B1E]">
              <MapleLeaf className="h-5 w-5 text-white" />
            </span>
            Objectif B2
          </Link>

          <div className="my-auto pt-8 lg:pt-0">
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 text-[13px] font-medium">
              <Flags className="h-4" />
              Rumo ao TCF Canada · meta NCLC 7+
            </p>
            <h1 className="mt-5 text-[30px] leading-[36px] font-bold tracking-tight md:text-[44px] md:leading-[52px]">
              Seu caminho até o <span className="text-[#ff7b70]">B2</span> e ao{" "}
              <span className="text-[#ff7b70]">Canadá</span> começa aqui.
            </h1>

            <ul className="mt-8 hidden flex-col gap-4 lg:flex">
              {BENEFITS.map((b) => (
                <li key={b.text} className="flex items-center gap-3 text-[16px] text-white/85">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#ff7b70]">
                    <Icon name={b.icon} size={22} />
                  </span>
                  {b.text}
                </li>
              ))}
            </ul>

            <div className="mt-10 hidden max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex">
              <div className="text-[36px] leading-none font-bold text-[#ff7b70] tabular">{draws.lastFrench.crs}</div>
              <p className="text-[14px] leading-5 text-white/75">
                foi a nota mínima da última rodada do Express Entry para francófonos (
                {new Date(`${draws.lastFrench.date}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}).
                Fonte: IRCC.
              </p>
            </div>
          </div>

          <p className="mt-10 hidden text-[13px] text-white/50 lg:block">
            © {new Date().getFullYear()} Objectif B2 · Ferramenta de estudo; não é consultoria de imigração.
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="relative flex items-start justify-center px-4 py-8 md:px-8 lg:items-center lg:py-12">
        <MapleLeaf className="pointer-events-none absolute right-6 bottom-6 hidden h-40 w-40 rotate-12 text-[#D52B1E]/[0.05] lg:block" />
        <div className="relative w-full max-w-md">
          <Link
            href="/conheca"
            className="mb-5 inline-flex items-center gap-1 text-on-surface-variant type-label-large hover:text-[#D52B1E]"
          >
            <Icon name="arrow_back" size={18} /> Voltar para o site
          </Link>
          <div className="overflow-hidden rounded-[28px] bg-surface-container-lowest shadow-xl ring-1 ring-outline-variant/60">
            <div aria-hidden="true" className="flex h-1.5">
              <span className="flex-1 bg-[#D52B1E]" />
              <span className="flex-[2] bg-surface-container-lowest" />
              <span className="flex-1 bg-[#D52B1E]" />
            </div>
            <div className="p-6 md:p-8">
              {erro && (
                <p role="alert" className="mb-4 rounded-md bg-error-container px-3 py-2 text-on-error-container type-body-medium">
                  Não foi possível confirmar o e-mail. Tente entrar novamente.
                </p>
              )}
              <LoginForm configError={configError} initialMode={modo === "criar" ? "criar" : "entrar"} />
            </div>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-on-surface-variant type-body-small">
            <Icon name="lock" size={16} /> Seus dados ficam protegidos e salvos na nuvem.
          </p>
        </div>
      </section>
    </main>
  );
}
