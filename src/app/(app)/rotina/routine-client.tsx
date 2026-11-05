"use client";

import { useState } from "react";
import { deleteBlock, saveBlock } from "@/app/actions";
import { ActionForm, Button, Dialog, SelectField, TextField } from "@/components/ui";
import { ConfirmDelete } from "@/components/confirm-delete";
import { BlockCheck } from "@/components/block-check";
import { EmptyState, Chip } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { SKILLS, SKILL_ICON, SKILL_LABEL, WEEKDAY_LABEL } from "@/lib/labels";
import { addDays, formatDuration, formatShort } from "@/lib/dates";
import type { BlockCompletion, WeeklyBlock } from "@/lib/types";

export function RoutineClient({
  blocks,
  completions,
  monday,
  today,
}: {
  blocks: WeeklyBlock[];
  completions: BlockCompletion[];
  monday: string;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);
  const [weekday, setWeekday] = useState(1);
  const done = new Set(completions.filter((c) => c.done).map((c) => c.block_id));

  const totalPlanned = blocks.reduce((s, b) => s + b.duration_min, 0);
  const totalDone = blocks.filter((b) => done.has(b.id)).reduce((s, b) => s + b.duration_min, 0);

  const show = (d: number) => {
    setWeekday(d);
    setKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-on-surface-variant type-body-medium tabular">
          Semana de {formatShort(monday)} a {formatShort(addDays(monday, 6))} · {formatDuration(totalDone)} de{" "}
          {formatDuration(totalPlanned)} feitos
        </p>
        <Button variant="tonal" icon="add" onClick={() => show(1)}>
          Novo bloco
        </Button>
      </div>

      {blocks.length === 0 ? (
        <EmptyState
          icon="calendar_view_week"
          title="Sua rotina está vazia"
          description="Planeje blocos de estudo para cada dia da semana."
          action={<Button onClick={() => show(1)}>Criar bloco</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {WEEKDAY_LABEL.map((label, i) => {
            const weekdayN = i + 1;
            const date = addDays(monday, i);
            const isToday = date === today;
            const dayBlocks = blocks.filter((b) => b.weekday === weekdayN);
            const planned = dayBlocks.reduce((s, b) => s + b.duration_min, 0);
            return (
              <section
                key={label}
                aria-label={label}
                className={`flex flex-col rounded-lg ${
                  isToday ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-low"
                }`}
              >
                <header className="flex items-baseline justify-between gap-2 px-3 pt-3 pb-1">
                  <div>
                    <h2 className="type-title-small">{label}</h2>
                    <p className="type-label-small opacity-70 tabular">{formatShort(date)}</p>
                  </div>
                  <span className="type-label-medium tabular opacity-80">{formatDuration(planned)}</span>
                </header>
                <ul className="flex flex-1 flex-col px-1 pb-1">
                  {dayBlocks.length === 0 && (
                    <li className="px-2 py-3 type-body-small opacity-70">Descanso</li>
                  )}
                  {dayBlocks.map((b) => (
                    <li key={b.id} className="flex items-center gap-0.5 rounded-md py-0.5">
                      <BlockCheck
                        blockId={b.id}
                        weekStart={monday}
                        done={done.has(b.id)}
                        label={`${SKILL_LABEL[b.skill]}, ${formatDuration(b.duration_min)}, ${label}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`flex items-center gap-1 type-label-large ${done.has(b.id) ? "line-through opacity-60" : ""}`}
                        >
                          <Icon name={SKILL_ICON[b.skill]} size={16} />
                          {SKILL_LABEL[b.skill]}
                        </p>
                        <p className="truncate type-body-small opacity-70" title={b.description}>
                          {formatDuration(b.duration_min)}
                          {b.description && ` · ${b.description}`}
                        </p>
                      </div>
                      <ConfirmDelete
                        action={deleteBlock}
                        id={b.id}
                        title="Remover bloco?"
                        description={`${SKILL_LABEL[b.skill]} de ${label} será removido da rotina.`}
                        label="Remover bloco"
                      />
                    </li>
                  ))}
                </ul>
                <div className="px-2 pb-2">
                  <button
                    type="button"
                    onClick={() => show(weekdayN)}
                    className="flex h-8 w-full items-center justify-center gap-1 rounded-full type-label-medium opacity-80 hover:bg-black/5"
                  >
                    <Icon name="add" size={16} /> Adicionar
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
      <p className="mt-4 flex items-center gap-2 text-on-surface-variant type-body-small">
        <Chip tone="primary">Hoje</Chip> destacado em azul. As marcações valem apenas para a semana atual.
      </p>

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo bloco de estudo">
        <ActionForm key={key} action={saveBlock} onDone={() => setOpen(false)} onCancel={() => setOpen(false)}>
          <SelectField
            name="weekday"
            label="Dia da semana"
            required
            defaultValue={String(weekday)}
            options={WEEKDAY_LABEL.map((l, i) => ({ value: String(i + 1), label: l }))}
          />
          <SelectField
            name="skill"
            label="Habilidade"
            required
            defaultValue="grammaire"
            options={SKILLS.map((s) => ({ value: s, label: SKILL_LABEL[s] }))}
          />
          <TextField name="duration_min" label="Duração" type="number" min={5} max={600} suffix="min" defaultValue={60} required />
          <TextField name="description" label="Descrição" placeholder="ex.: Grammaire progressive, unités 5–6" maxLength={160} />
        </ActionForm>
      </Dialog>
    </>
  );
}

