import { createClient, must } from "@/lib/queries";
import { TOTAL_WEEKS, formatShort, hours, planWeek, todayISO } from "@/lib/dates";
import { getProfile } from "@/lib/profile";
import { SKILLS, SKILL_COLOR, SKILL_LABEL } from "@/lib/labels";
import type { MockExam, Skill } from "@/lib/types";
import { EmptyState, PageHeader, SectionTitle, Surface } from "@/components/layout-parts";
import { ExamChart, SkillHoursChart, WeeklyHoursChart } from "./charts";

export const metadata = { title: "Estatísticas" };

export default async function StatsPage() {
  const supabase = await createClient();
  const { plan_start: start, weekly_goal_min: goalMin } = await getProfile();
  const [sessions, exams] = await Promise.all([
    supabase.from("study_sessions").select("date,duration_min,skill").limit(10000).then(must<{ date: string; duration_min: number; skill: Skill }[]>),
    supabase.from("mock_exams").select("*").order("date").then(must<MockExam[]>),
  ]);

  const currentWeek = Math.min(Math.max(planWeek(todayISO(), start), 1), TOTAL_WEEKS);
  const byWeek = new Map<number, number>();
  const bySkill = new Map<Skill, number>();
  let outside = 0;
  for (const s of sessions) {
    const w = planWeek(s.date, start);
    if (w >= 1 && w <= TOTAL_WEEKS) byWeek.set(w, (byWeek.get(w) ?? 0) + s.duration_min);
    else outside += s.duration_min;
    bySkill.set(s.skill, (bySkill.get(s.skill) ?? 0) + s.duration_min);
  }
  const total = sessions.reduce((s, x) => s + x.duration_min, 0);
  const weekly = Array.from({ length: Math.max(currentWeek, 4) }, (_, i) => ({
    week: String(i + 1),
    horas: hours(byWeek.get(i + 1) ?? 0),
  }));
  const skillData = SKILLS.map((s) => ({
    skill: SKILL_LABEL[s],
    horas: hours(bySkill.get(s) ?? 0),
    color: SKILL_COLOR[s],
  }));
  const weeksWithStudy = [...byWeek.values()].filter((m) => m > 0);
  const avg = weeksWithStudy.length ? weeksWithStudy.reduce((a, b) => a + b, 0) / weeksWithStudy.length : 0;
  const metWeeks = weeksWithStudy.filter((m) => m >= goalMin).length;

  const examRows = exams.map((e) => ({ date: formatShort(e.date), CO: e.co, CE: e.ce, EE: e.ee, EO: e.eo }));
  const hasCoCe = exams.some((e) => e.co != null || e.ce != null);
  const hasEeEo = exams.some((e) => e.ee != null || e.eo != null);

  return (
    <>
      <PageHeader eyebrow="Seu progresso" title="Estatísticas" subtitle="Volume de estudo e evolução nas provas." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total estudado", `${hours(total)} h`],
          ["Média por semana", `${hours(avg)} h`],
          ["Semanas na meta", `${metWeeks}`],
          ["Simulados e testes", `${exams.length}`],
        ].map(([l, v]) => (
          <Surface key={l} tone="container">
            <p className="text-on-surface-variant type-label-medium">{l}</p>
            <p className="mt-1 type-headline-small tabular">{v}</p>
          </Surface>
        ))}
      </div>
      {outside > 0 && (
        <p className="mt-2 text-on-surface-variant type-body-small">
          {hours(outside)} h registradas fora do período do plano não entram no gráfico semanal.
        </p>
      )}

      {sessions.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon="monitoring" title="Sem dados de estudo ainda" description="Registre sessões para ver horas por semana e por habilidade." />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60 p-4">
            <SectionTitle>Horas por semana</SectionTitle>
            <WeeklyHoursChart data={weekly} goal={goalMin / 60} />
          </section>
          <section className="rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60 p-4">
            <SectionTitle>Horas por habilidade</SectionTitle>
            <SkillHoursChart data={skillData} />
          </section>
        </div>
      )}

      <h2 className="mt-8 mb-3 text-[18px] leading-6 font-semibold tracking-tight">Evolução dos simulados</h2>
      {exams.length === 0 ? (
        <EmptyState icon="show_chart" title="Nenhuma nota registrada" description="Registre notas em Provas para acompanhar a evolução." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {hasCoCe && (
            <section className="rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60 p-4">
              <SectionTitle>CO e CE (0–699)</SectionTitle>
              <ExamChart data={examRows} keys={["CO", "CE"]} max={699} colors={["var(--md-sys-color-primary)", "#8A5100"]} />
            </section>
          )}
          {hasEeEo && (
            <section className="rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60 p-4">
              <SectionTitle>EE e EO (0–20)</SectionTitle>
              <ExamChart data={examRows} keys={["EE", "EO"]} max={20} colors={["#A23B5C", "#00696B"]} />
            </section>
          )}
        </div>
      )}
    </>
  );
}

