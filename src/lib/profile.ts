import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { planEnd } from "@/lib/dates";
import type { Profile } from "@/lib/types";

/** Perfil do usuário logado, ou `null` se ele ainda não montou o plano (uma consulta por requisição). */
export const findProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id,plan_start,exam_date,weekly_goal_min")
    .maybeSingle<Profile>();
  if (error) throw new Error(error.message);
  return data;
});

/**
 * Perfil obrigatório para as telas do app. Sem perfil, o aluno vai para /comecar
 * escolher as datas do plano (o app não define datas por conta própria).
 */
export async function getProfile(): Promise<Profile & { exam: string }> {
  const profile = await findProfile();
  if (!profile) redirect("/comecar");
  // Data-alvo: a prova informada pelo aluno ou, na falta, o fim da semana 26.
  return { ...profile, exam: profile.exam_date ?? planEnd(profile.plan_start) };
}
