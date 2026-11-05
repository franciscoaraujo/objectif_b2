import Link from "next/link";
import { createClient, must } from "@/lib/queries";
import {
  PLAN_END,
  PLAN_START,
  TOTAL_WEEKS,
  WEEKLY_GOAL_MIN,
  addDays,
  diffDays,
  formatBR,
  formatDuration,
  formatLong,
  formatShort,
  hours,
  mondayOf,
  phaseForWeek,
  planWeek,
  todayISO,
  weekdayOf,
} from "@/lib/dates";
import { SKILL_ICON, SKILL_LABEL, CHECKPOINT_TYPE_LABEL } from "@/lib/labels";
import type { BlockCompletion, Checkpoint, Phase, StudySession, WeeklyBlock } from "@/lib/types";
import { Chip, EmptyState, PageHeader, SectionTitle, Surface } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { Progress } from "@/components/ui";
import { BlockCheck } from "@/components/block-check";

export const metadata = { title: "Início" };

export default async function HomePage() {
  const supabase = await createClient();
  const today = todayISO();
  const monday = mondayOf(today);
  const rawWeek = planWeek(today);
  const week = Math.min(Math.max(rawWeek, 1), TOTAL_WEEKS);
  const weekdayToday = weekdayOf(today);

  const [phases, checkpoints, sessions, blocks, completions] = await Promise.all([
    supabase.from("phases").select("*").order("week_start").then(must<Phase[]>),
    supabase.from("checkpoints").select("*").order("week").then(must<Checkpoint[]>),
    supabase.from("study_sessions").select("*").gte("date", monday).lte("date", addDays(monday, 6)).then(must<StudySession[]>),
    supabase.from("weekly_blocks").select("*").eq("weekday", weekdayToday).order("position").then(must<WeeklyBlock[]>),
    supabase.from("block_completions").select("*").eq("week_start_date", monday).then(must<BlockCompletion[]>),
  ]);

  const phase = phaseForWeek(phases, week);
  const weekMin = sessions.reduce((s, x) => s + x.duration_min, 0);
  const todayMin = sessions.filter((s) => s.date === today).reduce((s, x) => s + x.duration_min, 0);
  const daysToExam = diffDays(today, PLAN_END);
  const nextCheckpoint = checkpoints.find((c) => !c.done && c.date >= today) ?? checkpoints.find((c) => !c.done);
  const done = new Set(completions.filter((c) => c.done).map((c) => c.block_id));
  const planned = blocks.reduce((s, b) => s + b.duration_min, 0);
  const doneBlocks = blocks.filter((b) => done.has(b.id)).length;
  const ratio = weekMin / WEEKLY_GOAL_MIN;

  const notStarted = rawWeek === 0;
  const subtitle = notStarted
    ? `O plano começa em ${formatBR(PLAN_START)} (${diffDays(today, PLAN_START)} dias)`
    : rawWeek > TOTAL_WEEKS
      ? "Plano concluído"
      : `${formatShort(monday)} a ${formatShort(addDays(monday, 6))}`;

  return (
    <>
      <PageHeader
        eyebrow="Rumo ao NCLC 7"
        title={notStarted ? "Antes da semana 1" : `Semana ${week} de ${TOTAL_WEEKS}`}
        subtitle={subtitle}
        actions={
          phase && (
            <Chip tone="primary">
              Fase {phase.level} · sem. {phase.week_start}–{phase.week_end}
            </Chip>
          )
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <Surface tone="primary" className="md:col-span-2">
          <div className="flex items-baseline justify-between gap-2">
            <p className="type-label-large">Horas desta semana</p>
            <p className="type-label-medium opacity-80 tabular">{Math.round(ratio * 100)}% da meta</p>
          </div>
          <p className="mt-2 tabular">
            <span className="type-display-small">{hours(weekMin)}</span>
            <span className="type-title-large opacity-80"> / {hours(WEEKLY_GOAL_MIN)} h</span>
          </p>
          <div className="mt-4">
            <Progress value={ratio} label="Horas da semana em relação à meta" />
          </div>
          <p className="mt-3 type-body-small opacity-80">
            {weekMin >= WEEKLY_GOAL_MIN
              ? "Meta da semana atingida."
              : `Faltam ${formatDuration(WEEKLY_GOAL_MIN - weekMin)} para a meta.`}
          </p>
        </Surface>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <Surface tone="container">
            <p className="text-on-surface-variant type-label-medium">Dias até a prova</p>
            <p className="mt-1 type-headline-medium tabular">{Math.max(daysToExam, 0)}</p>
            <p className="text-on-surface-variant type-body-small">até {formatBR(PLAN_END)}</p>
          </Surface>
          <Surface tone="container">
            <p className="text-on-surface-variant type-label-medium">Hoje</p>
            <p className="mt-1 type-headline-medium tabular">{formatDuration(todayMin)}</p>
            <p className="text-on-surface-variant type-body-small">estudados</p>
          </Surface>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-5">
        <section className="md:col-span-3">
          <SectionTitle
            action={
              <Link href="/rotina" className="text-primary type-label-large hover:underline">
                Ver rotina
              </Link>
            }
          >
            Blocos de hoje
          </SectionTitle>
          <p className="mb-3 text-on-surface-variant type-body-small capitalize">{formatLong(today)}</p>
          {blocks.length === 0 ? (
            <EmptyState
              icon="event_available"
              title="Nenhum bloco planejado para hoje"
              description="Adicione blocos à rotina semanal para vê-los aqui."
            />
          ) : (
            <>
              <ul className="divide-y divide-outline-variant overflow-hidden rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60">
                {blocks.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 px-4 py-2">
                    <BlockCheck
                      blockId={b.id}
                      weekStart={monday}
                      done={done.has(b.id)}
                      label={`${SKILL_LABEL[b.skill]}, ${formatDuration(b.duration_min)}`}
                    />
                    <Icon name={SKILL_ICON[b.skill]} className="text-on-surface-variant" />
                    <div className="min-w-0 flex-1">
                      <p className={`type-title-small ${done.has(b.id) ? "text-on-surface-variant line-through" : ""}`}>
                        {SKILL_LABEL[b.skill]}
                      </p>
                      {b.description && (
                        <p className="truncate text-on-surface-variant type-body-small">{b.description}</p>
                      )}
                    </div>
                    <span className="type-label-large tabular text-on-surface-variant">
                      {formatDuration(b.duration_min)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-on-surface-variant type-body-small tabular">
                {doneBlocks} de {blocks.length} blocos feitos · {formatDuration(planned)} planejados
              </p>
            </>
          )}
        </section>

        <div className="flex flex-col gap-6 md:col-span-2">
          <section>
            <SectionTitle>Próximo checkpoint</SectionTitle>
            {nextCheckpoint ? (
              <Surface tone="container">
                <div className="flex items-center justify-between gap-2">
                  <Chip>{CHECKPOINT_TYPE_LABEL[nextCheckpoint.type]}</Chip>
                  <span className="type-label-medium text-on-surface-variant tabular">
                    semana {nextCheckpoint.week}
                  </span>
                </div>
                <p className="mt-2 type-title-medium">{nextCheckpoint.title}</p>
                <p className="text-on-surface-variant type-body-small tabular">
                  {formatBR(nextCheckpoint.date)} · em {Math.max(diffDays(today, nextCheckpoint.date), 0)} dias
                </p>
              </Surface>
            ) : (
              <EmptyState icon="flag" title="Nenhum checkpoint pendente" />
            )}
          </section>

          {phase && (
            <section>
              <SectionTitle>Metas da fase {phase.level}</SectionTitle>
              {phase.goals.length === 0 ? (
                <p className="text-on-surface-variant type-body-medium">Sem metas cadastradas.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {phase.goals.map((g) => (
                    <li key={g} className="flex gap-2 type-body-medium">
                      <Icon name="check_small" className="text-primary" size={20} />
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}

