"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sm2, type Sm2Quality } from "@/lib/sm2";
import type { ActionState } from "@/components/ui";

/* ───────── utilitários ───────── */
const SKILLS = ["grammaire", "vocabulaire", "CO", "CE", "EE", "EO"] as const;
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.");
const emptyToUndef = (v: unknown) => (v === "" || v === null || v === undefined ? undefined : v);
const optText = (max = 2000) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().trim().max(max).optional());
const optUuid = z.preprocess(emptyToUndef, z.uuid("Identificador inválido.").optional());
const optInt = (min: number, max: number, label: string) =>
  z.preprocess(
    emptyToUndef,
    z.coerce
      .number({ error: `${label}: informe um número.` })
      .int(`${label}: use um número inteiro.`)
      .min(min, `${label}: mínimo ${min}.`)
      .max(max, `${label}: máximo ${max}.`)
      .optional(),
  );

async function context() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return { supabase, userId: data.user.id };
}

function validationError(error: z.ZodError): ActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return { ok: false, message: "Corrija os campos abaixo:", errors };
}

async function run(
  formData: FormData,
  schema: z.ZodType,
  paths: string[],
  op: (ctx: Awaited<ReturnType<typeof context>>, data: never) => Promise<{ message: string } | null>,
): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const ctx = await context();
    const err = await op(ctx, parsed.data as never);
    if (err) return { ok: false, message: err.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  paths.forEach((p) => revalidatePath(p));
  return { ok: true };
}

const fail = (e: { message: string } | null) => (e ? { message: e.message } : null);

/* ───────── Sessões ───────── */
const sessionSchema = z.object({
  id: optUuid,
  date: dateStr,
  duration_min: z.coerce.number({ error: "Informe a duração." }).int().min(1, "Duração mínima: 1 min.").max(1440, "Duração máxima: 24 h."),
  skill: z.enum(SKILLS, { error: "Escolha a habilidade." }),
  material_id: optUuid,
  chapter_id: optUuid,
  pages: optText(60),
  notes: optText(2000),
});

export async function saveSession(_: ActionState, formData: FormData) {
  return run(formData, sessionSchema, ["/", "/sessoes", "/estatisticas", "/rotina"], async ({ supabase }, d: z.infer<typeof sessionSchema>) => {
    const { id, ...values } = d;
    const row = {
      ...values,
      material_id: values.material_id ?? null,
      chapter_id: values.chapter_id ?? null,
      pages: values.pages ?? null,
      notes: values.notes ?? null,
    };
    const { error } = id
      ? await supabase.from("study_sessions").update(row).eq("id", id)
      : await supabase.from("study_sessions").insert(row);
    return fail(error);
  });
}

export async function deleteSession(id: string): Promise<ActionState> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Identificador inválido." };
  try {
    const { supabase } = await context();
    const { error } = await supabase.from("study_sessions").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  ["/", "/sessoes", "/estatisticas"].forEach((p) => revalidatePath(p));
  return { ok: true };
}

/* ───────── Livros ───────── */
const materialSchema = z.object({
  title: z.string().trim().min(2, "Informe o título.").max(120),
  type: z.enum(["gramatica", "exercicios", "metodo", "audio", "simulado"], { error: "Escolha o tipo." }),
  level: z.preprocess(emptyToUndef, z.enum(["A1", "A2", "B1", "B2"]).optional()),
});
export async function saveMaterial(_: ActionState, formData: FormData) {
  return run(formData, materialSchema, ["/livros", "/sessoes"], async ({ supabase }, d: z.infer<typeof materialSchema>) => {
    const { error } = await supabase.from("materials").insert({ ...d, level: d.level ?? null });
    return error?.code === "23505" ? { message: "Já existe um material com esse título." } : fail(error);
  });
}

const chapterSchema = z
  .object({
    id: optUuid,
    material_id: z.uuid("Material inválido."),
    number: z.coerce.number({ error: "Informe o número." }).int().min(0).max(999),
    title: z.string().trim().min(1, "Informe o título.").max(160),
    page_start: optInt(0, 5000, "Página inicial"),
    page_end: optInt(0, 5000, "Página final"),
  })
  .refine((d) => d.page_start === undefined || d.page_end === undefined || d.page_end >= d.page_start, {
    path: ["page_end"],
    message: "A página final deve ser maior ou igual à inicial.",
  });
export async function saveChapter(_: ActionState, formData: FormData) {
  return run(formData, chapterSchema, ["/livros"], async ({ supabase }, d: z.infer<typeof chapterSchema>) => {
    const { id, ...v } = d;
    const row = { ...v, page_start: v.page_start ?? null, page_end: v.page_end ?? null };
    const { error } = id
      ? await supabase.from("chapters").update(row).eq("id", id)
      : await supabase.from("chapters").insert(row);
    return error?.code === "23505" ? { message: "Já existe um capítulo com esse número neste material." } : fail(error);
  });
}

const bulkSchema = z.object({
  material_id: z.uuid(),
  count: z.coerce.number({ error: "Informe a quantidade." }).int().min(1).max(100, "Máximo de 100 capítulos."),
  prefix: z.string().trim().min(1, "Informe o prefixo.").max(40),
});
export async function bulkCreateChapters(_: ActionState, formData: FormData) {
  return run(formData, bulkSchema, ["/livros"], async ({ supabase }, d: z.infer<typeof bulkSchema>) => {
    const { data: last } = await supabase
      .from("chapters")
      .select("number")
      .eq("material_id", d.material_id)
      .order("number", { ascending: false })
      .limit(1);
    const start = (last?.[0]?.number ?? 0) + 1;
    const rows = Array.from({ length: d.count }, (_, i) => ({
      material_id: d.material_id,
      number: start + i,
      title: `${d.prefix} ${start + i}`,
    }));
    const { error } = await supabase.from("chapters").insert(rows);
    return fail(error);
  });
}

export async function setChapterStatus(id: string, status: string): Promise<ActionState> {
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(["nao_iniciado", "em_andamento", "concluido"]) })
    .safeParse({ id, status });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  try {
    const { supabase } = await context();
    const { error } = await supabase
      .from("chapters")
      .update({
        status: parsed.data.status,
        completed_at: parsed.data.status === "concluido" ? new Date().toISOString() : null,
      })
      .eq("id", parsed.data.id);
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/livros");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteChapter(id: string): Promise<ActionState> {
  return simpleDelete("chapters", id, ["/livros"]);
}

/* ───────── Rotina ───────── */
export async function toggleBlock(blockId: string, weekStart: string, done: boolean): Promise<ActionState> {
  const parsed = z.object({ blockId: z.uuid(), weekStart: dateStr, done: z.boolean() }).safeParse({ blockId, weekStart, done });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  try {
    const { supabase, userId } = await context();
    const { error } = await supabase.from("block_completions").upsert(
      { user_id: userId, block_id: blockId, week_start_date: weekStart, done },
      { onConflict: "block_id,week_start_date" },
    );
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/rotina");
  revalidatePath("/");
  return { ok: true };
}

const blockSchema = z.object({
  weekday: z.coerce.number().int().min(1, "Escolha o dia.").max(7),
  skill: z.enum(SKILLS, { error: "Escolha a habilidade." }),
  duration_min: z.coerce.number({ error: "Informe a duração." }).int().min(5, "Mínimo 5 min.").max(600, "Máximo 10 h."),
  description: optText(160),
});
export async function saveBlock(_: ActionState, formData: FormData) {
  return run(formData, blockSchema, ["/rotina", "/"], async ({ supabase }, d: z.infer<typeof blockSchema>) => {
    const { data: last } = await supabase
      .from("weekly_blocks")
      .select("position")
      .eq("weekday", d.weekday)
      .order("position", { ascending: false })
      .limit(1);
    const { error } = await supabase.from("weekly_blocks").insert({
      ...d,
      description: d.description ?? "",
      position: (last?.[0]?.position ?? 0) + 1,
    });
    return fail(error);
  });
}
export async function deleteBlock(id: string): Promise<ActionState> {
  return simpleDelete("weekly_blocks", id, ["/rotina", "/"]);
}

/* ───────── Checkpoints e simulados ───────── */
export async function toggleCheckpoint(id: string, done: boolean): Promise<ActionState> {
  const parsed = z.object({ id: z.uuid(), done: z.boolean() }).safeParse({ id, done });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  try {
    const { supabase } = await context();
    const { error } = await supabase
      .from("checkpoints")
      .update({ done, done_at: done ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/checkpoints");
  revalidatePath("/");
  return { ok: true };
}

const examSchema = z
  .object({
    id: optUuid,
    checkpoint_id: optUuid,
    date: dateStr,
    co: optInt(0, 699, "CO"),
    ce: optInt(0, 699, "CE"),
    ee: optInt(0, 20, "EE"),
    eo: optInt(0, 20, "EO"),
    notes: optText(1000),
  })
  .refine((d) => [d.co, d.ce, d.ee, d.eo].some((v) => v !== undefined), {
    path: ["co"],
    message: "Informe ao menos uma nota.",
  });
export async function saveMockExam(_: ActionState, formData: FormData) {
  return run(formData, examSchema, ["/checkpoints", "/estatisticas", "/"], async ({ supabase }, d: z.infer<typeof examSchema>) => {
    const { id, ...v } = d;
    const row = {
      checkpoint_id: v.checkpoint_id ?? null,
      date: v.date,
      co: v.co ?? null,
      ce: v.ce ?? null,
      ee: v.ee ?? null,
      eo: v.eo ?? null,
      notes: v.notes ?? null,
    };
    const { error } = id
      ? await supabase.from("mock_exams").update(row).eq("id", id)
      : await supabase.from("mock_exams").insert(row);
    if (error) return fail(error);
    if (row.checkpoint_id) {
      await supabase
        .from("checkpoints")
        .update({ done: true, done_at: new Date().toISOString() })
        .eq("id", row.checkpoint_id);
    }
    return null;
  });
}
export async function deleteMockExam(id: string): Promise<ActionState> {
  return simpleDelete("mock_exams", id, ["/checkpoints", "/estatisticas"]);
}

/* ───────── Caderno de erros ───────── */
const errorSchema = z.object({
  id: optUuid,
  category: z.enum(["gramatica", "conjugacao", "vocabulario", "ortografia", "preposicao", "pronuncia", "compreensao", "outro"], {
    error: "Escolha a categoria.",
  }),
  wrong: z.string().trim().min(1, "Informe o erro.").max(500),
  correct: z.string().trim().min(1, "Informe a forma correta.").max(500),
  explanation: optText(2000),
});
export async function saveError(_: ActionState, formData: FormData) {
  return run(formData, errorSchema, ["/erros"], async ({ supabase }, d: z.infer<typeof errorSchema>) => {
    const { id, ...v } = d;
    const row = { ...v, explanation: v.explanation ?? null };
    const { error } = id
      ? await supabase.from("error_log").update(row).eq("id", id)
      : await supabase.from("error_log").insert(row);
    return fail(error);
  });
}
export async function toggleErrorReviewed(id: string, reviewed: boolean): Promise<ActionState> {
  const parsed = z.object({ id: z.uuid(), reviewed: z.boolean() }).safeParse({ id, reviewed });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  try {
    const { supabase } = await context();
    const { error } = await supabase.from("error_log").update({ reviewed }).eq("id", id);
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/erros");
  return { ok: true };
}
export async function deleteError(id: string): Promise<ActionState> {
  return simpleDelete("error_log", id, ["/erros"]);
}

/* ───────── Vocabulário ───────── */
const wordSchema = z.object({
  id: optUuid,
  word: z.string().trim().min(1, "Informe a palavra.").max(120),
  gender: z.enum(["m", "f", "m_f", "nenhum"], { error: "Escolha o gênero." }),
  translation: z.string().trim().min(1, "Informe a tradução.").max(200),
  example: optText(500),
});
export async function saveWord(_: ActionState, formData: FormData) {
  return run(formData, wordSchema, ["/vocabulario"], async ({ supabase }, d: z.infer<typeof wordSchema>) => {
    const { id, ...v } = d;
    const row = { ...v, example: v.example ?? null };
    const { error } = id
      ? await supabase.from("vocabulary").update(row).eq("id", id)
      : await supabase.from("vocabulary").insert(row);
    return error?.code === "23505" ? { message: "Essa palavra já está no vocabulário." } : fail(error);
  });
}
export async function deleteWord(id: string): Promise<ActionState> {
  return simpleDelete("vocabulary", id, ["/vocabulario"]);
}

export async function reviewWord(id: string, quality: number): Promise<ActionState> {
  const parsed = z.object({ id: z.uuid(), quality: z.union([z.literal(0), z.literal(3), z.literal(4), z.literal(5)]) }).safeParse({ id, quality });
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  try {
    const { supabase } = await context();
    const { data: w, error: e1 } = await supabase
      .from("vocabulary")
      .select("ease, repetitions, interval_days")
      .eq("id", id)
      .single();
    if (e1 || !w) return { ok: false, message: e1?.message ?? "Palavra não encontrada." };
    const next = sm2(
      { ease: Number(w.ease), repetitions: w.repetitions, interval_days: w.interval_days },
      parsed.data.quality as Sm2Quality,
    );
    const { error } = await supabase.from("vocabulary").update(next).eq("id", id);
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  revalidatePath("/vocabulario");
  return { ok: true };
}

/* ───────── comum ───────── */
async function simpleDelete(
  table: "chapters" | "weekly_blocks" | "mock_exams" | "error_log" | "vocabulary",
  id: string,
  paths: string[],
): Promise<ActionState> {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Identificador inválido." };
  try {
    const { supabase } = await context();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erro inesperado." };
  }
  paths.forEach((p) => revalidatePath(p));
  return { ok: true };
}

