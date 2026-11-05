import { createClient, must } from "@/lib/queries";
import { todayISO } from "@/lib/dates";
import type { Chapter, Material, StudySession } from "@/lib/types";
import { PageHeader } from "@/components/layout-parts";
import { SessionsClient } from "./sessions-client";

export const metadata = { title: "Sessões" };

export default async function SessionsPage() {
  const supabase = await createClient();
  const [sessions, materials, chapters] = await Promise.all([
    supabase.from("study_sessions").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }).limit(500).then(must<StudySession[]>),
    supabase.from("materials").select("*").order("title").then(must<Material[]>),
    supabase.from("chapters").select("*").order("number").then(must<Chapter[]>),
  ]);
  return (
    <>
      <PageHeader title="Sessões de estudo" subtitle="Registre o tempo estudado e acompanhe o histórico." />
      <SessionsClient sessions={sessions} materials={materials} chapters={chapters} today={todayISO()} />
    </>
  );
}

