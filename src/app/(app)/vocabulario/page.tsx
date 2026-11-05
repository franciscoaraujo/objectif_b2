import { createClient, must } from "@/lib/queries";
import type { VocabWord } from "@/lib/types";
import { PageHeader } from "@/components/layout-parts";
import { VocabularyClient } from "./vocabulary-client";

export const metadata = { title: "Vocabulário" };

export default async function VocabularyPage() {
  const supabase = await createClient();
  const words = await supabase.from("vocabulary").select("*").order("next_review_at").then(must<VocabWord[]>);
  return (
    <>
      <PageHeader eyebrow="Memorização" title="Vocabulário" subtitle="Palavras, gênero e revisão com repetição espaçada (SM-2)." />
      <VocabularyClient words={words} now={new Date().toISOString()} />
    </>
  );
}
