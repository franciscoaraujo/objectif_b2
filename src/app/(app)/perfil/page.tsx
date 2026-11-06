import { getProfile } from "@/lib/profile";
import { TOTAL_WEEKS, formatBR, hours, planEnd, planWeek, todayISO } from "@/lib/dates";
import { PageHeader, SectionTitle, Surface } from "@/components/layout-parts";
import { ActionForm, DateField, TextField } from "@/components/ui";
import { Icon } from "@/components/icon";
import { saveProfile } from "@/app/actions";

export const metadata = { title: "Meu plano" };

export default async function ProfilePage() {
  const profile = await getProfile();
  const today = todayISO();
  const week = planWeek(today, profile.plan_start);
  // Datas já passadas podem ser mantidas, mas não é possível escolher outra data no passado.
  const minStart = profile.plan_start < today ? profile.plan_start : today;
  const minExam = profile.exam_date && profile.exam_date < today ? profile.exam_date : today;
  const status =
    week === 0 ? "Ainda não começou" : week > TOTAL_WEEKS ? "Plano concluído" : `Semana ${week} de ${TOTAL_WEEKS}`;

  return (
    <>
      <PageHeader
        eyebrow="Configurações"
        title="Meu plano"
        subtitle="Ajuste o calendário ao seu ritmo. O plano de 26 semanas é uma metodologia sugerida."
      />

      <div className="grid gap-6 md:grid-cols-5">
        <Surface tone="container" className="md:col-span-2">
          <p className="text-on-surface-variant type-label-medium">Situação</p>
          <p className="mt-1 type-title-large">{status}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 type-body-medium">
            <dt className="text-on-surface-variant">Início</dt>
            <dd className="tabular">{formatBR(profile.plan_start)}</dd>
            <dt className="text-on-surface-variant">Fim da semana 26</dt>
            <dd className="tabular">{formatBR(planEnd(profile.plan_start))}</dd>
            <dt className="text-on-surface-variant">Data da prova</dt>
            <dd className="tabular">{profile.exam_date ? formatBR(profile.exam_date) : "Não informada"}</dd>
            <dt className="text-on-surface-variant">Meta semanal</dt>
            <dd className="tabular">{hours(profile.weekly_goal_min)} h</dd>
          </dl>
        </Surface>

        <section className="md:col-span-3">
          <SectionTitle>Calendário e meta</SectionTitle>
          <div className="rounded-[24px] bg-surface-container-lowest p-4 ring-1 ring-outline-variant/60 md:p-6">
            <ActionForm action={saveProfile} submitLabel="Salvar plano">
              <DateField
                name="plan_start"
                label="Início do plano"
                required
                min={minStart}
                defaultValue={profile.plan_start}
                supporting={
                  profile.plan_start < today
                    ? "Seu plano já começou. Você pode manter esta data ou escolher hoje ou uma data futura."
                    : "Dia 1 da semana 1 do seu plano. A partir de hoje."
                }
              />
              <DateField
                name="exam_date"
                label="Data da prova TCF Canada"
                min={minExam}
                defaultValue={profile.exam_date}
                supporting="Opcional. Sem data, a contagem usa o fim da semana 26."
              />
              <TextField
                name="weekly_goal_h"
                label="Meta de estudo por semana"
                type="number"
                min={1}
                max={70}
                step={0.5}
                suffix="h"
                required
                defaultValue={hours(profile.weekly_goal_min)}
              />
              <p className="flex gap-2 text-on-surface-variant type-body-small">
                <Icon name="info" size={18} className="shrink-0" />
                Mudar o início desloca as fases e os checkpoints pelo mesmo número de dias, mantendo os ajustes que você
                fez. Sessões, notas e blocos já concluídos não mudam. A data de cada checkpoint pode ser alterada em Provas.
              </p>
            </ActionForm>
          </div>
        </section>
      </div>
    </>
  );
}
