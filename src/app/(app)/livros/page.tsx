import { createClient, must } from "@/lib/queries";
import type { Chapter, Material } from "@/lib/types";
import { PageHeader } from "@/components/layout-parts";
import { BooksClient } from "./books-client";

export const metadata = { title: "Livros" };

export default async function BooksPage() {
  const supabase = await createClient();
  const [materials, chapters] = await Promise.all([
    supabase.from("materials").select("*").order("created_at").then(must<Material[]>),
    supabase.from("chapters").select("*").order("number").then(must<Chapter[]>),
  ]);
  return (
    <>
      <PageHeader title="Livros e materiais" subtitle="Capítulos, status e progresso de cada material." />
      <BooksClient materials={materials} chapters={chapters} />
    </>
  );
}
