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
  if (error) {
    const messages: Record<string, string> = {
      email_not_confirmed: "Confirme seu e-mail antes de entrar (verifique a caixa de entrada).",
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

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${origin}/auth/callback` },
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
  if (!data.session) {
    return { ok: false, message: "Conta criada. Enviamos um link de confirmação para o seu e-mail." };
  }
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

