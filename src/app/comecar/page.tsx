import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { findProfile } from "@/lib/profile";
import { Flags, MapleLeaf } from "@/components/flags";
import { Icon } from "@/components/icon";
import { ActionForm, DateField, TextField } from "@/components/ui";
import { todayISO } from "@/lib/dates";
import { startPlan } from "@/app/actions";

export const metadata: Metadata = { title: "Monte seu plano" };

const PHASES = [
  ["A1", "Fundamentos", "semanas 1–4"],
  ["A2", "Consolidação", "semanas 5–10"],
  ["B1", "Construção", "semanas 11–18"],
  ["B2", "Preparação TCF", "semanas 19–26"],
];

export default async function StartPage() {
  if (await findProfile()) redirect("/");
  const today = todayISO();

  return (
    <main className="min-h-dvh bg-surface-container-low">
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-[#D52B1E]" />
        <span className="flex-[2] bg-white" />
        <span className="flex-1 bg-[#D52B1E]" />
      </div>
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:px-8 lg:grid-cols-[1fr_1.1fr] lg:py-16">
        <section>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D52B1E]">
            <MapleLeaf className="h-6 w-6 text-white" />
          </span>
          <p lang="fr" className="mt-6 text-[14px] font-semibold text-[#D52B1E]">
            Bienvenue !
          </p>
          <h1 className="mt-1 text-[30px] leading-9 font-semibold tracking-tight md:text-[36px] md:leading-[44px]">
            Monte o seu plano de estudos
          </h1>
          <p className="mt-3 text-on-surface-variant type-body-large">
            Você decide quando começar e quando quer fazer a prova. O Objectif B2 organiza as fases, a rotina e os
            checkpoints a partir das suas datas.
          </p>
          <ol className="mt-6 flex flex-col gap-2">
            {PHASES.map(([level, name, weeks]) => (
              <li key={level} className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/60">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1d45] text-[13px] font-bold text-white">
                  {level}
                </span>
                <span className="flex-1 type-title-small">{name}</span>
                <span className="text-on-surface-variant type-body-small">{weeks}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex gap-2 text-on-surface-variant type-body-small">
            <Icon name="info" size={18} className="shrink-0" />
            As 26 semanas são uma metodologia sugerida. O tempo real depende do seu nível inicial e da sua dedicação, e
            você pode mudar todas as datas depois, em Meu plano.
          </p>
        </section>

        <section className="overflow-hidden rounded-[28px] bg-surface-container-lowest shadow-xl ring-1 ring-outline-variant/60">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <p className="type-title-medium">Suas datas</p>
            <Flags className="h-4" />
          </div>
          <div className="p-6 [&_md-filled-button]:w-full">
            <ActionForm action={startPlan} submitLabel="Criar meu plano" pendingLabel="Criando plano…">
              <DateField
                name="plan_start"
                label="Quando você começa?"
                required
                min={today}
                supporting="Dia 1 da semana 1 do seu plano. A partir de hoje."
              />
              <DateField
                name="exam_date"
                label="Data da prova TCF Canada"
                min={today}
                supporting="Opcional. Se ainda não marcou, deixe em branco e preencha depois."
              />
              <TextField
                name="weekly_goal_h"
                label="Quantas horas por semana?"
                type="number"
                min={1}
                max={70}
                step={0.5}
                suffix="h"
                required
                defaultValue={20}
                supporting="A rotina sugerida tem 20 h; ajuste ao seu tempo disponível."
              />
            </ActionForm>
          </div>
        </section>
      </div>
    </main>
  );
}
