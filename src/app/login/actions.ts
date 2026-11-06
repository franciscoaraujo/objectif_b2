"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/components/ui";

const credentials = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

function parse(formData: FormData) {
  return credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signIn(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error?.code === "email_not_confirmed") {
    redirect(`/confirmar-email?email=${encodeURIComponent(parsed.data.email)}&origem=login`);
  }
  if (error) {
    const messages: Record<string, string> = {
      invalid_credentials: "E-mail ou senha incorretos.",
      over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    };
    return { ok: false, message: messages[error.code ?? ""] ?? "Não foi possível entrar. Tente novamente." };
  }
  redirect("/");
}

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: confirmRedirect(await siteOrigin()) },
  });
  if (error) {
    const messages: Record<string, string> = {
      over_email_send_rate_limit: "Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.",
      over_request_rate_limit: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      user_already_exists: "Já existe uma conta com este e-mail.",
      email_exists: "Já existe uma conta com este e-mail.",
      weak_password: "Senha muito fraca. Escolha uma senha mais forte.",
      email_address_invalid: "Este e-mail não é aceito. Use outro endereço.",
      signup_disabled: "O cadastro de novas contas está desativado.",
    };
    return { ok: false, message: messages[error.code ?? ""] ?? "Não foi possível criar a conta. Tente novamente." };
  }
  if (!data.session) redirect(`/confirmar-email?email=${encodeURIComponent(parsed.data.email)}`);
  redirect("/");
}

/**
 * Base do link de confirmação. O modelo de e-mail (supabase/templates/confirm-signup.html) monta
 * `{{ .RedirectTo }}?token_hash=…&type=email&next=/email-confirmado`, validado em /auth/confirm.
 */
const confirmRedirect = (origin: string) => `${origin}/auth/confirm`;

/** Reenvia o e-mail de confirmação. Resposta neutra (não revela se a conta existe). */
export async function resendConfirmation(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: confirmRedirect(await siteOrigin()) },
  });
  if (error && /rate_limit/.test(error.code ?? "")) {
    return { ok: false, message: "Aguarde alguns minutos antes de pedir um novo e-mail." };
  }
  return { ok: true, message: "Pronto! Se a conta ainda não estiver confirmada, um novo link chegará em instantes." };
}

async function siteOrigin() {
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

/** Envia o link de redefinição. A resposta é a mesma exista ou não a conta (evita descobrir e-mails cadastrados). */
export async function requestPasswordReset(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentials.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/redefinir-senha`,
  });
  if (error && /rate_limit/.test(error.code ?? "")) {
    return { ok: false, message: "Muitas tentativas. Aguarde alguns minutos e tente novamente." };
  }
  return {
    ok: true,
    message: "Se houver uma conta com este e-mail, você vai receber um link para criar uma nova senha.",
  };
}

const newPassword = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "As senhas não coincidem.", path: ["confirm"] });

export async function updatePassword(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = newPassword.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    const messages: Record<string, string> = {
      same_password: "A nova senha precisa ser diferente da atual.",
      weak_password: "Senha muito fraca. Escolha uma senha mais forte.",
      session_not_found: "O link expirou. Peça um novo na tela de login.",
    };
    return { ok: false, message: messages[error.code ?? ""] ?? "Não foi possível alterar a senha. Tente novamente." };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

