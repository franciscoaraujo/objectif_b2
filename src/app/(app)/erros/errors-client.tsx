"use client";

import { useState, useTransition } from "react";
import { deleteError, saveError, toggleErrorReviewed } from "@/app/actions";
import { ActionForm, Button, Dialog, IconButton, SelectField, TextField } from "@/components/ui";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Chip, EmptyState } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { ERROR_CATEGORY_LABEL } from "@/lib/labels";
import type { ErrorCategory, ErrorEntry } from "@/lib/types";

const CATS = Object.entries(ERROR_CATEGORY_LABEL).map(([value, label]) => ({ value, label }));

export function ErrorsClient({ entries }: { entries: ErrorEntry[] }) {
  const [dlg, setDlg] = useState<{ open: boolean; draft: Partial<ErrorEntry>; key: number }>({ open: false, draft: {}, key: 0 });
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("pending");
  const openForm = (draft: Partial<ErrorEntry> = {}) => setDlg((d) => ({ open: true, draft, key: d.key + 1 }));
  const close = () => setDlg((d) => ({ ...d, open: false }));

  const filtered = entries.filter((e) => {
    if (cat && e.category !== cat) return false;
    if (status === "pending" && e.reviewed) return false;
    if (status === "reviewed" && !e.reviewed) return false;
    return true;
  });
  const pending = entries.filter((e) => !e.reviewed).length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField name="f_cat" label="Categoria" defaultValue="" allowEmpty="Todas" options={CATS} onChange={setCat} />
        <SelectField
          name="f_status"
          label="Situação"
          defaultValue="pending"
          options={[
            { value: "pending", label: "A revisar" },
            { value: "reviewed", label: "Revisados" },
            { value: "all", label: "Todos" },
          ]}
          onChange={setStatus}
        />
      </div>
      <div className="mt-4 mb-2 flex items-center justify-between gap-2">
        <p className="text-on-surface-variant type-body-medium tabular">
          {pending} a revisar · {entries.length} no total
        </p>
        <Button icon="add" onClick={() => openForm()}>
          Novo erro
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={entries.length === 0 ? "spellcheck" : "task_alt"}
          title={entries.length === 0 ? "Seu caderno está vazio" : "Nada por aqui"}
          description={
            entries.length === 0
              ? "Anote os erros dos exercícios e das redações com a forma correta e a regra."
              : "Nenhum erro corresponde aos filtros atuais."
          }
          action={entries.length === 0 ? <Button onClick={() => openForm()}>Registrar primeiro erro</Button> : undefined}
        />
      ) : (
        <ul className="divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low">
          {filtered.map((e) => (
            <ErrorRow key={e.id} entry={e} onEdit={() => openForm(e)} />
          ))}
        </ul>
      )}

      <Dialog open={dlg.open} onClose={close} title={dlg.draft.id ? "Editar erro" : "Novo erro"}>
        <ActionForm key={dlg.key} action={saveError} onDone={close} onCancel={close}>
          {dlg.draft.id && <input type="hidden" name="id" value={dlg.draft.id} />}
          <SelectField
            name="category"
            label="Categoria"
            required
            defaultValue={dlg.draft.category ?? ("gramatica" as ErrorCategory)}
            options={CATS}
          />
          <TextField name="wrong" label="Erro (como escrevi/falei)" required defaultValue={dlg.draft.wrong} maxLength={500} />
          <TextField name="correct" label="Forma correta" required defaultValue={dlg.draft.correct} maxLength={500} />
          <TextField name="explanation" label="Explicação" type="textarea" rows={3} defaultValue={dlg.draft.explanation} />
        </ActionForm>
      </Dialog>
    </>
  );
}

function ErrorRow({ entry: e, onEdit }: { entry: ErrorEntry; onEdit: () => void }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex items-start gap-2 px-2 py-3 sm:px-3">
      <button
        type="button"
        disabled={pending}
        aria-pressed={e.reviewed}
        aria-label={e.reviewed ? "Marcar como não revisado" : "Marcar como revisado"}
        title={e.reviewed ? "Revisado" : "Marcar como revisado"}
        onClick={() => start(async () => void (await toggleErrorReviewed(e.id, !e.reviewed)))}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-container-high ${
          e.reviewed ? "text-primary" : "text-on-surface-variant"
        } ${pending ? "opacity-50" : ""}`}
      >
        <Icon name={e.reviewed ? "check_circle" : "radio_button_unchecked"} fill={e.reviewed} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Chip>{ERROR_CATEGORY_LABEL[e.category]}</Chip>
        </div>
        <p className="type-body-large text-error line-through decoration-1">{e.wrong}</p>
        <p className="type-body-large">{e.correct}</p>
        {e.explanation && <p className="mt-1 text-on-surface-variant type-body-small">{e.explanation}</p>}
      </div>
      <IconButton icon="edit" label="Editar" onClick={onEdit} />
      <ConfirmDelete action={deleteError} id={e.id} title="Excluir erro?" description={`“${e.wrong}” será removido do caderno.`} />
    </li>
  );
}
