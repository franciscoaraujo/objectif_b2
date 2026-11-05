"use client";

import { useMemo, useState } from "react";
import { saveSession, deleteSession } from "@/app/actions";
import { ActionForm, Button, Dialog, IconButton, SelectField, TextField } from "@/components/ui";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Chip, EmptyState } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { SKILLS, SKILL_ICON, SKILL_LABEL } from "@/lib/labels";
import { addDays, formatBR, formatDuration } from "@/lib/dates";
import type { Chapter, Material, StudySession } from "@/lib/types";
import { StudyTimer } from "./timer";

type Draft = Partial<StudySession> & { duration_min?: number };

export function SessionsClient({
  sessions,
  materials,
  chapters,
  today,
}: {
  sessions: StudySession[];
  materials: Material[];
  chapters: Chapter[];
  today: string;
}) {
  const [dialog, setDialog] = useState<{ open: boolean; draft: Draft; key: number }>({
    open: false,
    draft: {},
    key: 0,
  });
  const [skill, setSkill] = useState("");
  const [material, setMaterial] = useState("");
  const [period, setPeriod] = useState("30");

  const matById = useMemo(() => new Map(materials.map((m) => [m.id, m])), [materials]);
  const chapById = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);

  const filtered = sessions.filter((s) => {
    if (skill && s.skill !== skill) return false;
    if (material && s.material_id !== material) return false;
    if (period !== "all" && s.date < addDays(today, -Number(period) + 1)) return false;
    return true;
  });
  const total = filtered.reduce((sum, s) => sum + s.duration_min, 0);

  const openNew = (draft: Draft = {}) => setDialog((d) => ({ open: true, draft, key: d.key + 1 }));
  const close = () => setDialog((d) => ({ ...d, open: false }));

  return (
    <>
      <StudyTimer onFinish={(min) => openNew({ duration_min: min })} />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SelectField
          name="f_skill"
          label="Habilidade"
          defaultValue=""
          allowEmpty="Todas"
          options={SKILLS.map((s) => ({ value: s, label: SKILL_LABEL[s] }))}
          onChange={setSkill}
        />
        <SelectField
          name="f_material"
          label="Material"
          defaultValue=""
          allowEmpty="Todos"
          options={materials.map((m) => ({ value: m.id, label: m.title }))}
          onChange={setMaterial}
        />
        <SelectField
          name="f_period"
          label="Período"
          defaultValue="30"
          options={[
            { value: "7", label: "Últimos 7 dias" },
            { value: "30", label: "Últimos 30 dias" },
            { value: "90", label: "Últimos 90 dias" },
            { value: "all", label: "Tudo" },
          ]}
          onChange={setPeriod}
        />
      </div>

      <div className="mt-4 mb-2 flex items-center justify-between gap-2">
        <p className="text-on-surface-variant type-body-medium tabular">
          {filtered.length} {filtered.length === 1 ? "sessão" : "sessões"} · {formatDuration(total)}
        </p>
        <Button icon="add" onClick={() => openNew()}>
          Registrar estudo
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="history_edu"
          title={sessions.length === 0 ? "Nenhuma sessão registrada" : "Nada encontrado com esses filtros"}
          description={
            sessions.length === 0
              ? "Use o cronômetro ou registre manualmente o que você estudou."
              : "Ajuste os filtros ou amplie o período."
          }
          action={sessions.length === 0 ? <Button onClick={() => openNew()}>Registrar estudo</Button> : undefined}
        />
      ) : (
        <ul className="divide-y divide-outline-variant overflow-hidden rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60">
          {filtered.map((s) => {
            const mat = s.material_id ? matById.get(s.material_id) : undefined;
            const ch = s.chapter_id ? chapById.get(s.chapter_id) : undefined;
            return (
              <li key={s.id} className="flex items-start gap-3 px-4 py-3">
                <Icon name={SKILL_ICON[s.skill]} className="mt-0.5 text-on-surface-variant" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="type-title-small">{SKILL_LABEL[s.skill]}</p>
                    <Chip>{formatDuration(s.duration_min)}</Chip>
                    <span className="text-on-surface-variant type-body-small tabular">{formatBR(s.date)}</span>
                  </div>
                  {(mat || ch || s.pages) && (
                    <p className="text-on-surface-variant type-body-small">
                      {[mat?.title, ch ? `cap. ${ch.number}` : null, s.pages ? `p. ${s.pages}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {s.notes && <p className="mt-1 type-body-small">{s.notes}</p>}
                </div>
                <div className="flex shrink-0">
                  <IconButton icon="edit" label="Editar" onClick={() => openNew(s)} />
                  <ConfirmDelete
                    action={deleteSession}
                    id={s.id}
                    title="Excluir sessão?"
                    description={`${SKILL_LABEL[s.skill]} · ${formatDuration(s.duration_min)} em ${formatBR(s.date)}.`}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={dialog.open}
        onClose={close}
        title={dialog.draft.id ? "Editar sessão" : "Registrar estudo"}
      >
        <SessionForm
          key={dialog.key}
          draft={dialog.draft}
          today={today}
          materials={materials}
          chapters={chapters}
          onDone={close}
        />
      </Dialog>
    </>
  );
}

function SessionForm({
  draft,
  today,
  materials,
  chapters,
  onDone,
}: {
  draft: Draft;
  today: string;
  materials: Material[];
  chapters: Chapter[];
  onDone: () => void;
}) {
  const [materialId, setMaterialId] = useState(draft.material_id ?? "");
  const options = chapters
    .filter((c) => c.material_id === materialId)
    .map((c) => ({ value: c.id, label: `${c.number}. ${c.title}` }));

  return (
    <ActionForm action={saveSession} onDone={onDone} onCancel={onDone}>
      {draft.id && <input type="hidden" name="id" value={draft.id} />}
      <div className="grid grid-cols-2 gap-4">
        <TextField name="date" label="Data" type="date" required defaultValue={draft.date ?? today} />
        <TextField
          name="duration_min"
          label="Duração"
          type="number"
          min={1}
          max={1440}
          required
          suffix="min"
          defaultValue={draft.duration_min ?? 30}
        />
      </div>
      <SelectField
        name="skill"
        label="Habilidade"
        required
        defaultValue={draft.skill ?? "grammaire"}
        options={SKILLS.map((s) => ({ value: s, label: SKILL_LABEL[s] }))}
      />
      <SelectField
        name="material_id"
        label="Material"
        defaultValue={draft.material_id ?? ""}
        allowEmpty="Nenhum"
        options={materials.map((m) => ({ value: m.id, label: m.title }))}
        onChange={setMaterialId}
      />
      <div key={materialId}>
        <SelectField
          name="chapter_id"
          label="Capítulo"
          defaultValue={materialId === draft.material_id ? (draft.chapter_id ?? "") : ""}
          allowEmpty={options.length ? "Nenhum" : "Sem capítulos cadastrados"}
          options={options}
        />
      </div>
      <TextField name="pages" label="Páginas" placeholder="ex.: 42-47" defaultValue={draft.pages} maxLength={60} />
      <TextField name="notes" label="Observações" type="textarea" rows={3} defaultValue={draft.notes} />
    </ActionForm>
  );
}

