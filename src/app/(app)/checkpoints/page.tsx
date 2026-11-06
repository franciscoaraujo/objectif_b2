import { createClient, must } from "@/lib/queries";
import { todayISO } from "@/lib/dates";
import type { Checkpoint, MockExam } from "@/lib/types";
import { PageHeader } from "@/components/layout-parts";
import { CheckpointsClient } from "./checkpoints-client";

export const metadata = { title: "Checkpoints e simulados" };

export default async function CheckpointsPage() {
  const supabase = await createClient();
  const [checkpoints, exams] = await Promise.all([
    supabase.from("checkpoints").select("*").order("date").then(must<Checkpoint[]>),
    supabase.from("mock_exams").select("*").order("date", { ascending: false }).then(must<MockExam[]>),
  ]);
  return (
    <>
      <PageHeader
        eyebrow="Provas"
        title="Checkpoints e simulados"
        subtitle="Testes de fim de fase, inscrição e simulados. As datas são suas: ajuste cada uma quando quiser."
      />
      <CheckpointsClient checkpoints={checkpoints} exams={exams} today={todayISO()} />
    </>
  );
}

