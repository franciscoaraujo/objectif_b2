import { createClient } from "@/lib/supabase/server";

type Res<T> = { data: T | null; error: { message: string } | null };

/** Lança em caso de erro, para que o `error.tsx` da rota exiba o estado de erro. */
export function must<T>(res: Res<T>): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export { createClient };

