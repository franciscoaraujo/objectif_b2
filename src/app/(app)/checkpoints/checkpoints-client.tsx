"use client";

import { useState, useTransition } from "react";
import { deleteMockExam, saveMockExam, toggleCheckpoint } from "@/app/actions";
import { ActionForm, Button, Dialog, IconButton, TextField } from "@/components/ui";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Chip, EmptyState, SectionTitle } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { CHECKPOINT_TYPE_LABEL } from "@/lib/labels";
import { diffDays, formatBR } from "@/lib/dates";
import type { Checkpoint, MockExam } from "@/lib/types";

type Draft = Partial<MockExam>;

export function CheckpointsClient({
  checkpoints,
  exams,
  today,
}: {
  checkpoints: Checkpoint[];
  exams: MockExam[];
  today: string;
}) {
  const [dlg, setDlg] = useState<{ open: boolean; draft: Draft; key: number }>({ open: false, draft: {}, key: 0 });
  const openExam = (draft: Draft = {}) => setDlg((d) => ({ open: true, draft, key: d.key + 1 }));
  const close = () => setDlg((d) => ({ ...d, open: false }));
  const cpById = new Map(checkpoints.map((c) => [c.id, c]));

  return (
    <>
      <section>
        <SectionTitle>Calendário do plano</SectionTitle>
        {checkpoints.length === 0 ? (
          <EmptyState icon="flag" title="Nenhum checkpoint cadastrado" />
        ) : (
          <ol className="divide-y divide-outline-variant overflow-hidden rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60">
            {checkpoints.map((c) => (
              <CheckpointRow key={c.id} cp={c} today={today} onRecord={() => openExam({ checkpoint_id: c.id })} />
            ))}
          </ol>
        )}
      </section>

      <section className="mt-8">
        <SectionTitle
          action={
            <Button variant="tonal" icon="add" onClick={() => openExam()}>
              Registrar notas
            </Button>
          }
        >
          Notas registradas
        </SectionTitle>
        {exams.length === 0 ? (
          <EmptyState
            icon="grading"
            title="Nenhuma nota registrada"
            description="Registre as notas dos testes de fase e dos simulados para acompanhar a evolução."
          />
        ) : (
          <div className="overflow-x-auto rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant type-label-medium">
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-2 py-2 font-medium">Prova</th>
                  <th className="px-2 py-2 text-right font-medium">CO /699</th>
                  <th className="px-2 py-2 text-right font-medium">CE /699</th>
                  <th className="px-2 py-2 text-right font-medium">EE /20</th>
                  <th className="px-2 py-2 text-right font-medium">EO /20</th>
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.id} className="border-b border-outline-variant/60 last:border-0 type-body-medium tabular">
                    <td className="px-4 py-2">{formatBR(e.date)}</td>
                    <td className="px-2 py-2">
                      {e.checkpoint_id ? (cpById.get(e.checkpoint_id)?.title ?? "—") : "Avulso"}
                      {e.notes && <p className="max-w-56 truncate text-on-surface-variant type-body-small">{e.notes}</p>}
                    </td>
                    <td className="px-2 py-2 text-right">{e.co ?? "—"}</td>
                    <td className="px-2 py-2 text-right">{e.ce ?? "—"}</td>
                    <td className="px-2 py-2 text-right">{e.ee ?? "—"}</td>
                    <td className="px-2 py-2 text-right">{e.eo ?? "—"}</td>
                    <td className="pr-2">
                      <div className="flex justify-end">
                        <IconButton icon="edit" label="Editar notas" onClick={() => openExam(e)} />
                        <ConfirmDelete
                          action={deleteMockExam}
                          id={e.id}
                          title="Excluir notas?"
                          description={`Registro de ${formatBR(e.date)}.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog open={dlg.open} onClose={close} title={dlg.draft.id ? "Editar notas" : "Registrar notas"}>
        <ActionForm key={dlg.key} action={saveMockExam} onDone={close} onCancel={close}>
          {dlg.draft.id && <input type="hidden" name="id" value={dlg.draft.id} />}
          {dlg.draft.checkpoint_id && <input type="hidden" name="checkpoint_id" value={dlg.draft.checkpoint_id} />}
          {dlg.draft.checkpoint_id && (
            <p className="type-title-small">{cpById.get(dlg.draft.checkpoint_id)?.title}</p>
          )}
          <TextField name="date" label="Data" type="date" required defaultValue={dlg.draft.date ?? today} />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="co" label="CO" type="number" min={0} max={699} supporting="0 a 699" defaultValue={dlg.draft.co} />
            <TextField name="ce" label="CE" type="number" min={0} max={699} supporting="0 a 699" defaultValue={dlg.draft.ce} />
            <TextField name="ee" label="EE" type="number" min={0} max={20} supporting="0 a 20" defaultValue={dlg.draft.ee} />
            <TextField name="eo" label="EO" type="number" min={0} max={20} supporting="0 a 20" defaultValue={dlg.draft.eo} />
          </div>
          <TextField name="notes" label="Observações" type="textarea" rows={3} defaultValue={dlg.draft.notes} />
        </ActionForm>
      </Dialog>
    </>
  );
}

function CheckpointRow({ cp, today, onRecord }: { cp: Checkpoint; today: string; onRecord: () => void }) {
  const [pending, start] = useTransition();
  const days = diffDays(today, cp.date);
  const canScore = cp.type !== "inscricao";
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await toggleCheckpoint(cp.id, !cp.done)))}
        aria-label={cp.done ? `Desmarcar ${cp.title}` : `Marcar ${cp.title} como concluído`}
        aria-pressed={cp.done}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-container-high ${
          cp.done ? "text-primary" : "text-on-surface-variant"
        } ${pending ? "opacity-50" : ""}`}
      >
        <Icon name={cp.done ? "check_circle" : "radio_button_unchecked"} fill={cp.done} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={`type-title-small ${cp.done ? "text-on-surface-variant line-through" : ""}`}>{cp.title}</p>
          <Chip>{CHECKPOINT_TYPE_LABEL[cp.type]}</Chip>
        </div>
        <p className="text-on-surface-variant type-body-small tabular">
          Semana {cp.week} · {formatBR(cp.date)}
          {!cp.done && (days > 0 ? ` · em ${days} dias` : days === 0 ? " · hoje" : ` · atrasado há ${-days} dias`)}
        </p>
      </div>
      {canScore && (
        <Button variant="text" icon="edit_note" onClick={onRecord}>
          Notas
        </Button>
      )}
    </li>
  );
}

