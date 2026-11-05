import { createClient, must } from "@/lib/queries";
import { mondayOf, todayISO } from "@/lib/dates";
import type { BlockCompletion, WeeklyBlock } from "@/lib/types";
import { PageHeader } from "@/components/layout-parts";
import { RoutineClient } from "./routine-client";

export const metadata = { title: "Rotina" };

export default async function RoutinePage() {
  const supabase = await createClient();
  const today = todayISO();
  const monday = mondayOf(today);
  const [blocks, completions] = await Promise.all([
    supabase.from("weekly_blocks").select("*").order("weekday").order("position").then(must<WeeklyBlock[]>),
    supabase.from("block_completions").select("*").eq("week_start_date", monday).then(must<BlockCompletion[]>),
  ]);
  return (
    <>
      <PageHeader title="Rotina semanal" subtitle="Marque os blocos concluídos na semana atual." />
      <RoutineClient blocks={blocks} completions={completions} monday={monday} today={today} />
    </>
  );
}

