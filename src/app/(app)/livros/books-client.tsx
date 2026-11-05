"use client";

import { useState, useTransition } from "react";
import {
  bulkCreateChapters,
  deleteChapter,
  saveChapter,
  saveMaterial,
  setChapterStatus,
} from "@/app/actions";
import { ActionForm, Button, Dialog, IconButton, Progress, SelectField, TextField } from "@/components/ui";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Chip, EmptyState } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { CHAPTER_STATUS_LABEL, MATERIAL_TYPE_LABEL } from "@/lib/labels";
import type { Chapter, ChapterStatus, Material } from "@/lib/types";

const NEXT: Record<ChapterStatus, ChapterStatus> = {
  nao_iniciado: "em_andamento",
  em_andamento: "concluido",
  concluido: "nao_iniciado",
};
const STATUS_ICON: Record<ChapterStatus, string> = {
  nao_iniciado: "radio_button_unchecked",
  em_andamento: "timelapse",
  concluido: "check_circle",
};

type DialogState =
  | { kind: "material" }
  | { kind: "chapter"; materialId: string; chapter?: Chapter }
  | { kind: "bulk"; materialId: string }
  | null;

export function BooksClient({ materials, chapters }: { materials: Material[]; chapters: Chapter[] }) {
  const [dlg, setDlg] = useState<DialogState>(null);
  const [key, setKey] = useState(0);
  const open = (d: DialogState) => {
    setKey((k) => k + 1);
    setDlg(d);
  };
  const close = () => setDlg(null);

  const title =
    dlg?.kind === "material"
      ? "Novo material"
      : dlg?.kind === "bulk"
        ? "Gerar capítulos em lote"
        : dlg?.kind === "chapter"
          ? dlg.chapter
            ? "Editar capítulo"
            : "Novo capítulo"
          : "";

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="tonal" icon="add" onClick={() => open({ kind: "material" })}>
          Novo material
        </Button>
      </div>

      {materials.length === 0 ? (
        <EmptyState icon="auto_stories" title="Nenhum material cadastrado" description="Cadastre um livro ou fonte de áudio para controlar os capítulos." />
      ) : (
        <div className="flex flex-col gap-3">
          {materials.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              chapters={chapters.filter((c) => c.material_id === m.id)}
              onAdd={() => open({ kind: "chapter", materialId: m.id })}
              onBulk={() => open({ kind: "bulk", materialId: m.id })}
              onEdit={(c) => open({ kind: "chapter", materialId: m.id, chapter: c })}
            />
          ))}
        </div>
      )}

      <Dialog open={dlg !== null} onClose={close} title={title}>
        {dlg?.kind === "material" && (
          <ActionForm key={key} action={saveMaterial} onDone={close} onCancel={close}>
            <TextField name="title" label="Título" required maxLength={120} />
            <SelectField
              name="type"
              label="Tipo"
              required
              defaultValue="gramatica"
              options={Object.entries(MATERIAL_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
            />
            <SelectField
              name="level"
              label="Nível"
              defaultValue=""
              allowEmpty="Sem nível"
              options={["A1", "A2", "B1", "B2"].map((v) => ({ value: v, label: v }))}
            />
          </ActionForm>
        )}
        {dlg?.kind === "chapter" && (
          <ActionForm key={key} action={saveChapter} onDone={close} onCancel={close}>
            <input type="hidden" name="material_id" value={dlg.materialId} />
            {dlg.chapter && <input type="hidden" name="id" value={dlg.chapter.id} />}
            <div className="grid grid-cols-3 gap-4">
              <TextField
                name="number"
                label="Número"
                type="number"
                min={0}
                required
                defaultValue={
                  dlg.chapter?.number ??
                  Math.max(0, ...chapters.filter((c) => c.material_id === dlg.materialId).map((c) => c.number)) + 1
                }
              />
              <div className="col-span-2">
                <TextField name="title" label="Título" required defaultValue={dlg.chapter?.title} maxLength={160} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField name="page_start" label="Página inicial" type="number" min={0} defaultValue={dlg.chapter?.page_start} />
              <TextField name="page_end" label="Página final" type="number" min={0} defaultValue={dlg.chapter?.page_end} />
            </div>
          </ActionForm>
        )}
        {dlg?.kind === "bulk" && (
          <ActionForm key={key} action={bulkCreateChapters} onDone={close} onCancel={close} submitLabel="Gerar">
            <input type="hidden" name="material_id" value={dlg.materialId} />
            <p className="text-on-surface-variant type-body-medium">
              Cria capítulos numerados em sequência. Depois você pode renomear cada um.
            </p>
            <TextField name="prefix" label="Prefixo do título" defaultValue="Unité" required />
            <TextField name="count" label="Quantidade" type="number" min={1} max={100} defaultValue={10} required />
          </ActionForm>
        )}
      </Dialog>
    </>
  );
}

function MaterialCard({
  material,
  chapters,
  onAdd,
  onBulk,
  onEdit,
}: {
  material: Material;
  chapters: Chapter[];
  onAdd: () => void;
  onBulk: () => void;
  onEdit: (c: Chapter) => void;
}) {
  const done = chapters.filter((c) => c.status === "concluido").length;
  const ongoing = chapters.filter((c) => c.status === "em_andamento").length;
  const ratio = chapters.length ? done / chapters.length : 0;

  return (
    <details className="group overflow-hidden rounded-lg bg-surface-container-low" open={ongoing > 0}>
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 outline-none focus-visible:bg-surface-container [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="type-title-medium">{material.title}</h2>
            <Chip>{MATERIAL_TYPE_LABEL[material.type]}</Chip>
            {material.level && <Chip tone="primary">{material.level}</Chip>}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1">
              <Progress value={ratio} label={`Progresso de ${material.title}`} />
            </div>
            <span className="type-label-medium text-on-surface-variant tabular">
              {chapters.length ? `${done}/${chapters.length}` : "sem capítulos"}
            </span>
          </div>
        </div>
        <Icon name="expand_more" className="text-on-surface-variant transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-outline-variant">
        {chapters.length === 0 ? (
          <p className="px-4 py-4 text-on-surface-variant type-body-medium">
            Nenhum capítulo cadastrado para este material.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant/60">
            {chapters.map((c) => (
              <ChapterRow key={c.id} chapter={c} onEdit={() => onEdit(c)} />
            ))}
          </ul>
        )}
        <div className="flex flex-wrap justify-end gap-2 px-3 py-2">
          <Button variant="text" icon="add" onClick={onAdd}>
            Capítulo
          </Button>
          <Button variant="text" icon="playlist_add" onClick={onBulk}>
            Em lote
          </Button>
        </div>
      </div>
    </details>
  );
}

function ChapterRow({ chapter: c, onEdit }: { chapter: Chapter; onEdit: () => void }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex items-center gap-1 px-2 py-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await setChapterStatus(c.id, NEXT[c.status])))}
        aria-label={`${CHAPTER_STATUS_LABEL[c.status]}. Alterar status do capítulo ${c.number}`}
        title={`${CHAPTER_STATUS_LABEL[c.status]} — toque para avançar`}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-surface-container-high ${
          c.status === "concluido" ? "text-primary" : c.status === "em_andamento" ? "text-[#8a5100]" : "text-on-surface-variant"
        } ${pending ? "opacity-50" : ""}`}
      >
        <Icon name={STATUS_ICON[c.status]} fill={c.status !== "nao_iniciado"} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate type-body-large">
          <span className="text-on-surface-variant tabular">{c.number}. </span>
          {c.title}
        </p>
        <p className="text-on-surface-variant type-body-small">
          {CHAPTER_STATUS_LABEL[c.status]}
          {c.page_start != null && ` · p. ${c.page_start}${c.page_end != null ? `–${c.page_end}` : ""}`}
        </p>
      </div>
      <IconButton icon="edit" label="Editar capítulo" onClick={onEdit} />
      <ConfirmDelete
        action={deleteChapter}
        id={c.id}
        title="Excluir capítulo?"
        description="As sessões que apontam para ele serão mantidas, sem o vínculo."
      />
    </li>
  );
}
