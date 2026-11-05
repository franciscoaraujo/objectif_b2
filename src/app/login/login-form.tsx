"use client";

import { useState } from "react";
import { ActionForm, TextField, Button } from "@/components/ui";
import { signIn, signUp } from "./actions";

export function LoginForm({ configError }: { configError: boolean }) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");

  if (configError) {
    return (
      <div role="alert" className="rounded-md bg-error-container p-4 text-on-error-container type-body-medium">
        Variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> não
        configuradas. Veja o README.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ActionForm
        key={mode}
        action={mode === "entrar" ? signIn : signUp}
        submitLabel={mode === "entrar" ? "Entrar" : "Criar conta"}
      >
        <TextField name="email" label="E-mail" type="email" required />
        <TextField name="password" label="Senha" type="password" required supporting="Mínimo de 6 caracteres" />
      </ActionForm>
      <div className="flex items-center justify-between border-t border-outline-variant pt-4">
        <span className="text-on-surface-variant type-body-medium">
          {mode === "entrar" ? "Ainda não tem conta?" : "Já tem conta?"}
        </span>
        <Button variant="text" onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}>
          {mode === "entrar" ? "Criar conta" : "Entrar"}
        </Button>
      </div>
    </div>
  );
}
