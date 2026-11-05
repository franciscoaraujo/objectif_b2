import { createClient, must } from "@/lib/queries";
import type { ErrorEntry } from "@/lib/types";
import { PageHeader } from "@/components/layout-parts";
import { ErrorsClient } from "./errors-client";

export const metadata = { title: "Caderno de erros" };

export default async function ErrorsPage() {
  const supabase = await createClient();
  const entries = await supabase
    .from("error_log")
    .select("*")
    .order("created_at", { ascending: false })
    .then(must<ErrorEntry[]>);
  return (
    <>
      <PageHeader title="Caderno de erros" subtitle="Erro, forma correta e explicação. Marque o que já revisou." />
      <ErrorsClient entries={entries} />
    </>
  );
}

