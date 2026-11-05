"use client";

import { useState } from "react";
import { ActionForm, TextField, Button } from "@/components/ui";
import { signIn, signUp } from "./actions";

/** Componentes Material com a cor de destaque do tema (vermelho do Canadá). */
const THEMED = {
  "--md-filled-button-container-color": "#D52B1E",
  "--md-filled-button-container-height": "48px",
  "--md-filled-button-label-text-size": "16px",
  "--md-text-button-label-text-color": "#D52B1E",
  "--md-text-button-hover-label-text-color": "#b0231a",
  "--md-text-button-focus-label-text-color": "#b0231a",
  "--md-text-button-pressed-label-text-color": "#b0231a",
} as React.CSSProperties;

export function LoginForm({
  configError,
  initialMode = "entrar",
}: {
  configError: boolean;
  initialMode?: "entrar" | "criar";
}) {
  const [mode, setMode] = useState<"entrar" | "criar">(initialMode);

  if (configError) {
    return (
      <div role="alert" className="rounded-md bg-error-container p-4 text-on-error-container type-body-medium">
        Variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> não
        configuradas. Veja o README.
      </div>
    );
  }

  const signup = mode === "criar";

  return (
    <div className="flex flex-col gap-5" style={THEMED}>
      <div>
        <p lang="fr" className="text-[14px] font-semibold text-[#D52B1E]">
          {signup ? "Bienvenue !" : "Bon retour !"}
        </p>
        <h2 className="mt-1 text-[26px] leading-8 font-semibold tracking-tight">
          {signup ? "Crie sua conta" : "Acesse sua conta"}
        </h2>
        <p className="mt-1 text-on-surface-variant type-body-medium">
          {signup
            ? "Seu plano de 26 semanas é configurado na hora."
            : "Continue de onde parou no seu plano de estudos."}
        </p>
      </div>
      {/* O botão de enviar ocupa a largura toda nesta tela. */}
      <div className="[&_md-filled-button]:w-full">
        <ActionForm key={mode} action={signup ? signUp : signIn} submitLabel={signup ? "Criar conta" : "Entrar"}>
          <TextField name="email" label="E-mail" type="email" required />
          <TextField name="password" label="Senha" type="password" required supporting="Mínimo de 6 caracteres" />
        </ActionForm>
      </div>
      <div className="flex items-center justify-center gap-1 border-t border-outline-variant pt-4">
        <span className="text-on-surface-variant type-body-medium">
          {signup ? "Já tem conta?" : "Ainda não tem conta?"}
        </span>
        <Button variant="text" onClick={() => setMode(signup ? "entrar" : "criar")}>
          {signup ? "Entrar" : "Criar conta"}
        </Button>
      </div>
    </div>
  );
}
