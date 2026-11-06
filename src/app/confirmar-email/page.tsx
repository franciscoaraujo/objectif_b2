import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { Icon } from "@/components/icon";
import { ActionForm, TextField } from "@/components/ui";
import { resendConfirmation } from "@/app/login/actions";

export const metadata: Metadata = { title: "Confirme seu e-mail" };

const STEPS = [
  "Abra o e-mail com o assunto de confirmação de cadastro.",
  "Clique no link de confirmação.",
  "Você volta para cá já conectado para montar seu plano.",
];

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; origem?: string; erro?: string }>;
}) {
  const { email = "", origem, erro } = await searchParams;
  const fromLogin = origem === "login";

  if (erro === "link") {
    return (
      <AuthCard
        eyebrow="Oups !"
        title="Link expirado ou já usado"
        description="O link de confirmação vale por tempo limitado e só pode ser usado uma vez. Se você já confirmou, é só entrar com sua senha. Se não, peça um novo link abaixo."
      >
        <div className="[&_md-filled-button]:w-full">
          <ActionForm action={resendConfirmation} submitLabel="Enviar novo link" pendingLabel="Enviando…">
            <TextField name="email" label="E-mail do cadastro" type="email" required defaultValue={email} />
          </ActionForm>
        </div>
        <Link href="/login" className="flex items-center justify-center gap-1 text-primary type-label-large hover:underline">
          <Icon name="login" size={18} />
          Já confirmei, quero entrar
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Presque fini !"
      title="Confirme seu e-mail"
      description={
        <>
          {fromLogin ? "Sua conta ainda não foi confirmada. " : "Conta criada! "}
          {email ? (
            <>
              Enviamos um link de confirmação para <strong className="text-on-surface">{email}</strong>.
            </>
          ) : (
            "Enviamos um link de confirmação para o seu e-mail."
          )}
        </>
      }
    >
      <ol className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4">
        {STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-3 type-body-medium">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="flex gap-2 text-on-surface-variant type-body-small">
        <Icon name="info" size={18} className="shrink-0" />
        Não chegou? Confira a caixa de spam ou promoções. O link pode levar alguns minutos.
      </p>
      <div className="border-t border-outline-variant pt-4 [&_md-filled-button]:w-full">
        <ActionForm action={resendConfirmation} submitLabel="Reenviar e-mail" pendingLabel="Enviando…">
          {email ? (
            <input type="hidden" name="email" value={email} />
          ) : (
            <TextField name="email" label="E-mail" type="email" required />
          )}
        </ActionForm>
      </div>
      <Link href="/login" className="flex items-center justify-center gap-1 text-primary type-label-large hover:underline">
        <Icon name="arrow_back" size={18} />
        Voltar para o login
      </Link>
    </AuthCard>
  );
}
