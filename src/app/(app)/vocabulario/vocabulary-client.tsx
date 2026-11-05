"use client";

import { useState, useTransition } from "react";
import { deleteWord, reviewWord, saveWord } from "@/app/actions";
import { ActionForm, Button, Dialog, IconButton, SelectField, TextField } from "@/components/ui";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Chip, EmptyState } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { GENDER_ARTICLE, GENDER_LABEL } from "@/lib/labels";
import type { VocabWord, WordGender } from "@/lib/types";

const GENDERS = (Object.keys(GENDER_LABEL) as WordGender[]).map((value) => ({
  value,
  label: value === "nenhum" ? "Sem gênero (verbo, adjetivo…)" : GENDER_LABEL[value],
}));

export function VocabularyClient({ words, now }: { words: VocabWord[]; now: string }) {
  const [tab, setTab] = useState<"revisar" | "lista">("revisar");
  const due = words.filter((w) => w.next_review_at <= now);

  return (
    <>
      <div role="tablist" aria-label="Seções do vocabulário" className="mb-6 flex border-b border-outline-variant">
        {(
          [
            ["revisar", `Revisão (${due.length})`],
            ["lista", `Palavras (${words.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`relative h-12 flex-1 type-title-small sm:flex-none sm:px-8 ${
              tab === id ? "text-primary" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {label}
            {tab === id && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t bg-primary" />}
          </button>
        ))}
      </div>
      {tab === "revisar" ? (
        <Review due={due} total={words.length} onGoList={() => setTab("lista")} />
      ) : (
        <WordList words={words} now={now} />
      )}
    </>
  );
}

/* ───────── Revisão (flashcards + SM-2) ───────── */
function Review({ due, total, onGoList }: { due: VocabWord[]; total: number; onGoList: () => void }) {
  const [queue] = useState(due);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (total === 0) {
    return (
      <EmptyState
        icon="style"
        title="Nenhuma palavra cadastrada"
        description="Adicione palavras para começar a revisar com repetição espaçada."
        action={<Button onClick={onGoList}>Adicionar palavras</Button>}
      />
    );
  }
  if (index >= queue.length) {
    return (
      <EmptyState
        icon="task_alt"
        title={queue.length === 0 ? "Nada para revisar agora" : "Revisão concluída"}
        description={
          queue.length === 0
            ? "As próximas palavras aparecerão conforme o intervalo de cada uma."
            : `Você revisou ${queue.length} ${queue.length === 1 ? "palavra" : "palavras"} nesta sessão.`
        }
      />
    );
  }

  const w = queue[index];
  const answer = (q: 0 | 3 | 4 | 5) =>
    start(async () => {
      const res = await reviewWord(w.id, q);
      if (!res?.ok) {
        setError(res?.message ?? "Não foi possível salvar a revisão.");
        return;
      }
      setError(null);
      setRevealed(false);
      setIndex((i) => i + 1);
    });

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-2 flex items-center justify-between type-label-large text-on-surface-variant tabular">
        <span>
          Cartão {index + 1} de {queue.length}
        </span>
        <span>{w.repetitions === 0 ? "Nova" : `Intervalo atual: ${w.interval_days} d`}</span>
      </div>
      <div className="flex min-h-72 flex-col items-center justify-center rounded-xl bg-surface-container px-6 py-8 text-center">
        <p className="type-label-large text-on-surface-variant">{GENDER_LABEL[w.gender] !== "—" ? GENDER_LABEL[w.gender] : "\u00a0"}</p>
        <p className="mt-2 type-display-small break-words">
          {GENDER_ARTICLE[w.gender] && <span className="text-on-surface-variant">{GENDER_ARTICLE[w.gender]} </span>}
          {w.word}
        </p>
        {revealed ? (
          <div className="mt-6 border-t border-outline-variant pt-6">
            <p className="type-headline-small text-primary">{w.translation}</p>
            {w.example && <p className="mt-3 type-body-large italic text-on-surface-variant">{w.example}</p>}
          </div>
        ) : (
          <div className="mt-8">
            <Button variant="tonal" icon="visibility" onClick={() => setRevealed(true)}>
              Mostrar resposta
            </Button>
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-error-container px-3 py-2 text-on-error-container type-body-medium">
          {error}
        </p>
      )}
      {revealed && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          <Button variant="outlined" disabled={pending} onClick={() => answer(0)}>
            Errei
          </Button>
          <Button variant="outlined" disabled={pending} onClick={() => answer(3)}>
            Difícil
          </Button>
          <Button variant="tonal" disabled={pending} onClick={() => answer(4)}>
            Bom
          </Button>
          <Button disabled={pending} onClick={() => answer(5)}>
            Fácil
          </Button>
        </div>
      )}
    </div>
  );
}

/* ───────── Lista ───────── */
function WordList({ words, now }: { words: VocabWord[]; now: string }) {
  const [dlg, setDlg] = useState<{ open: boolean; draft: Partial<VocabWord>; key: number }>({ open: false, draft: {}, key: 0 });
  const [q, setQ] = useState("");
  const openForm = (draft: Partial<VocabWord> = {}) => setDlg((d) => ({ open: true, draft, key: d.key + 1 }));
  const close = () => setDlg((d) => ({ ...d, open: false }));
  const shown = words.filter((w) => {
    const t = q.trim().toLowerCase();
    return !t || w.word.toLowerCase().includes(t) || w.translation.toLowerCase().includes(t);
  });

  return (
    <>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex-1">
          <md-outlined-text-field
            label="Buscar palavra ou tradução"
            value={q}
            onInput={(e: React.FormEvent<HTMLElement>) => setQ((e.target as HTMLInputElement).value)}
          />
        </div>
        <div className="pt-1.5">
          <Button icon="add" onClick={() => openForm()}>
            Nova palavra
          </Button>
        </div>
      </div>

      {words.length === 0 ? (
        <EmptyState icon="translate" title="Vocabulário vazio" description="Cadastre palavra, gênero, tradução e um exemplo." />
      ) : shown.length === 0 ? (
        <EmptyState icon="search_off" title="Nenhuma palavra encontrada" />
      ) : (
        <ul className="divide-y divide-outline-variant overflow-hidden rounded-lg bg-surface-container-low">
          {shown.map((w) => (
            <li key={w.id} className="flex items-start gap-2 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2 type-title-medium">
                  {GENDER_ARTICLE[w.gender] && <span className="text-on-surface-variant">{GENDER_ARTICLE[w.gender]}</span>}
                  {w.word}
                  <span className="type-body-medium font-normal text-on-surface-variant">— {w.translation}</span>
                </p>
                {w.example && <p className="type-body-small italic text-on-surface-variant">{w.example}</p>}
                <div className="mt-1 flex gap-2">
                  {w.next_review_at <= now ? (
                    <Chip tone="warn">Para revisar</Chip>
                  ) : (
                    <Chip>
                      <Icon name="schedule" size={14} />
                      &nbsp;{w.interval_days} d
                    </Chip>
                  )}
                </div>
              </div>
              <IconButton icon="edit" label="Editar" onClick={() => openForm(w)} />
              <ConfirmDelete action={deleteWord} id={w.id} title="Excluir palavra?" description={`“${w.word}” será removida.`} />
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dlg.open} onClose={close} title={dlg.draft.id ? "Editar palavra" : "Nova palavra"}>
        <ActionForm key={dlg.key} action={saveWord} onDone={close} onCancel={close}>
          {dlg.draft.id && <input type="hidden" name="id" value={dlg.draft.id} />}
          <TextField name="word" label="Palavra (sem artigo)" required defaultValue={dlg.draft.word} maxLength={120} />
          <SelectField name="gender" label="Gênero" required defaultValue={dlg.draft.gender ?? "nenhum"} options={GENDERS} />
          <TextField name="translation" label="Tradução" required defaultValue={dlg.draft.translation} maxLength={200} />
          <TextField name="example" label="Exemplo" type="textarea" rows={2} defaultValue={dlg.draft.example} />
        </ActionForm>
      </Dialog>
    </>
  );
}

