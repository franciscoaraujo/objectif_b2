"use client";

import { useState } from "react";
import { ActionForm, TextField, Button } from "@/components/ui";
import { requestPasswordReset, signIn, signUp } from "./actions";

/** Botão principal mais alto nesta tela; as cores seguem o azul primário do tema. */
const THEMED = {
  "--md-filled-button-container-height": "48px",
  "--md-filled-button-label-text-size": "16px",
} as React.CSSProperties;

export function LoginForm({
  configError,
  initialMode = "entrar",
}: {
  configError: boolean;
  initialMode?: "entrar" | "criar";
}) {
  const [mode, setMode] = useState<"entrar" | "criar" | "recuperar">(initialMode);

  if (configError) {
    return (
      <div role="alert" className="rounded-md bg-error-container p-4 text-on-error-container type-body-medium">
        Variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> não
        configuradas. Veja o README.
      </div>
    );
  }

  if (mode === "recuperar") {
    return (
      <div className="flex flex-col gap-5" style={THEMED}>
        <div>
          <p lang="fr" className="text-[14px] font-semibold text-[#D52B1E]">
            Pas de souci !
          </p>
          <h2 className="mt-1 text-[26px] leading-8 font-semibold tracking-tight">Recuperar senha</h2>
          <p className="mt-1 text-on-surface-variant type-body-medium">
            Informe o e-mail da conta. Enviaremos um link para você criar uma nova senha.
          </p>
        </div>
        <div className="[&_md-filled-button]:w-full">
          <ActionForm key={mode} action={requestPasswordReset} submitLabel="Enviar link" pendingLabel="Enviando…">
            <TextField name="email" label="E-mail" type="email" required />
          </ActionForm>
        </div>
        <div className="flex justify-center border-t border-outline-variant pt-4">
          <Button variant="text" icon="arrow_back" onClick={() => setMode("entrar")}>
            Voltar para o login
          </Button>
        </div>
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
            ? "No primeiro acesso, você escolhe as datas do seu plano."
            : "Continue de onde parou no seu plano de estudos."}
        </p>
      </div>
      {/* O botão de enviar ocupa a largura toda nesta tela. */}
      <div className="[&_md-filled-button]:w-full">
        <ActionForm key={mode} action={signup ? signUp : signIn} submitLabel={signup ? "Criar conta" : "Entrar"}
          pendingLabel={signup ? "Criando conta…" : "Entrando…"}>
          <TextField name="email" label="E-mail" type="email" required />
          <TextField name="password" label="Senha" type="password" required supporting="Mínimo de 6 caracteres" />
        </ActionForm>
      </div>
      {!signup && (
        <div className="-mt-3 flex justify-center">
          <Button variant="text" onClick={() => setMode("recuperar")}>
            Esqueci minha senha
          </Button>
        </div>
      )}
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
