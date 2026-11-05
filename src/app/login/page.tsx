import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  const configError = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-5xl items-center gap-8 px-4 py-8 md:grid-cols-2 md:px-8">
      <section>
        <p className="text-primary type-label-large">TCF Canada · maio de 2027</p>
        <h1 className="mt-2 type-display-small md:type-display-medium">Objectif B2</h1>
        <p className="mt-4 max-w-md text-on-surface-variant type-body-large">
          26 semanas, 20 horas por semana, do A1 ao B2. Registre as sessões, acompanhe os livros e
          veja a evolução nos simulados.
        </p>
        <dl className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-md bg-outline-variant">
          {[
            ["26", "semanas"],
            ["20 h", "por semana"],
            ["NCLC 7+", "meta"],
          ].map(([v, l]) => (
            <div key={l} className="bg-surface-container-low p-3">
              <dd className="type-title-large tabular">{v}</dd>
              <dt className="text-on-surface-variant type-label-medium">{l}</dt>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-lg bg-surface-container-low p-6">
        <h2 className="mb-4 type-title-large">Acesse sua conta</h2>
        {erro && (
          <p role="alert" className="mb-4 rounded-md bg-error-container px-3 py-2 text-on-error-container type-body-medium">
            Não foi possível confirmar o e-mail. Tente entrar novamente.
          </p>
        )}
        <LoginForm configError={configError} />
      </section>
    </main>
  );
}
