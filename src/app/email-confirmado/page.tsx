import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { findProfile } from "@/lib/profile";
import { AuthCard } from "@/components/auth-card";
import { Flags } from "@/components/flags";
import { Icon } from "@/components/icon";

export const metadata: Metadata = { title: "E-mail confirmado" };

const NEXT_STEPS = [
  { icon: "event", text: "Escolha quando começar e a data da sua prova." },
  { icon: "calendar_view_week", text: "Siga a rotina do dia e registre suas sessões." },
  { icon: "monitoring", text: "Acompanhe sua evolução rumo ao NCLC 7." },
];

export default async function EmailConfirmedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/confirmar-email?erro=link");
  const hasPlan = !!(await findProfile());

  return (
    <AuthCard
      icon={
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#d7ecd3] text-[#1b5e20]">
          <Icon name="mark_email_read" size={36} fill />
        </span>
      }
      eyebrow="Félicitations !"
      title="E-mail confirmado"
      description={
        <>
          A conta <strong className="text-on-surface">{data.user.email}</strong> está ativa e você já está conectado.
        </>
      }
    >
      {!hasPlan && (
        <div className="rounded-2xl bg-surface-container-low p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="type-title-small">O que vem agora</p>
            <Flags className="h-3.5" />
          </div>
          <ol className="flex flex-col gap-3">
            {NEXT_STEPS.map((s, i) => (
              <li key={s.text} className="flex items-start gap-3 type-body-medium">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
                  {i + 1}
                </span>
                {s.text}
              </li>
            ))}
          </ol>
        </div>
      )}
      <Link
        href={hasPlan ? "/" : "/comecar"}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-medium text-on-primary hover:opacity-90"
      >
        {hasPlan ? "Ir para o meu plano" : "Montar meu plano"}
        <Icon name="arrow_forward" size={20} />
      </Link>
    </AuthCard>
  );
}
