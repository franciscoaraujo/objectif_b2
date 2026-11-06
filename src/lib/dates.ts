// Datas do plano. Todas as datas são strings ISO "YYYY-MM-DD" tratadas em UTC
// para evitar deslocamento de fuso. A data de início é escolhida pelo aluno
// (`profiles.plan_start`, qualquer dia da semana).
export const TOTAL_WEEKS = 26;

const DAY = 86_400_000;

export function parseISO(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(s: string, n: number): string {
  return toISO(new Date(parseISO(s).getTime() + n * DAY));
}
export function diffDays(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY);
}
/** Data de hoje (ISO) no fuso de Brasília. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
/** Segunda-feira da semana de `s`. */
export function mondayOf(s: string): string {
  const wd = (parseISO(s).getUTCDay() + 6) % 7; // 0 = segunda
  return addDays(s, -wd);
}
/** Dia da semana: 1 = segunda … 7 = domingo. */
export function weekdayOf(s: string): number {
  return ((parseISO(s).getUTCDay() + 6) % 7) + 1;
}
/** Semana do plano (1..26). Retorna 0 antes do início e 27 após o fim. */
export function planWeek(s: string, planStart: string): number {
  const w = Math.floor(diffDays(planStart, s) / 7) + 1;
  if (w < 1) return 0;
  if (w > TOTAL_WEEKS) return TOTAL_WEEKS + 1;
  return w;
}
/** Último dia (domingo) da semana 26. */
export function planEnd(planStart: string): string {
  return addDays(planStart, TOTAL_WEEKS * 7 - 1);
}

export function phaseForWeek<T extends { week_start: number; week_end: number }>(
  phases: T[],
  week: number,
): T | null {
  const w = Math.min(Math.max(week, 1), TOTAL_WEEKS);
  return phases.find((p) => w >= p.week_start && w <= p.week_end) ?? null;
}

const fmtShort = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
const fmtLong = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
export const formatShort = (s: string) => fmtShort.format(parseISO(s)).replace(".", "");
export const formatLong = (s: string) => fmtLong.format(parseISO(s));
export const formatBR = (s: string) => s.split("-").reverse().join("/");

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
export const hours = (min: number) => Math.round((min / 60) * 10) / 10;

