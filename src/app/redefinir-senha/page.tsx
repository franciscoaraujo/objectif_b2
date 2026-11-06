import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthCard } from "@/components/auth-card";
import { ActionForm, TextField } from "@/components/ui";
import { updatePassword } from "@/app/login/actions";

export const metadata: Metadata = { title: "Nova senha" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?erro=link");

  return (
    <AuthCard title="Crie uma nova senha" description={`Para a conta ${data.user.email}.`}>
      <div className="[&_md-filled-button]:w-full">
        <ActionForm action={updatePassword} submitLabel="Salvar nova senha">
          <TextField name="password" label="Nova senha" type="password" required supporting="Mínimo de 6 caracteres" />
          <TextField name="confirm" label="Repita a nova senha" type="password" required />
        </ActionForm>
      </div>
    </AuthCard>
  );
}
