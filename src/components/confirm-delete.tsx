"use client";

import { useState, useTransition } from "react";
import { Button, Dialog, IconButton, type ActionState } from "./ui";

export function ConfirmDelete({
  action,
  id,
  title = "Excluir item?",
  description = "Esta ação não pode ser desfeita.",
  label = "Excluir",
}: {
  action: (id: string) => Promise<ActionState>;
  id: string;
  title?: string;
  description?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <>
      <IconButton icon="delete" label={label} onClick={() => setOpen(true)} />
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <p className="type-body-medium text-on-surface-variant">{description}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-md bg-error-container px-3 py-2 text-on-error-container type-body-medium">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="text" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await action(id);
                if (res?.ok) setOpen(false);
                else setError(res?.message ?? "Não foi possível excluir.");
              })
            }
          >
            {pending ? "Excluindo…" : "Excluir"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
