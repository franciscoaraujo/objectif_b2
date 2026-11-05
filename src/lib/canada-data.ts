/**
 * Dados oficiais do Governo do Canadá para a página de vendas.
 * - Notícias: API de notícias do GC (IRCC, em francês).
 * - Rodadas do Express Entry: JSON público usado pela própria página do IRCC.
 * Ambos ficam em cache e são revalidados a cada 6 horas. Em caso de falha,
 * as funções retornam null e a página usa os valores de fallback.
 */

const REVALIDATE = 60 * 60 * 6;

const NEWS_URL =
  "https://api.io.canada.ca/io-server/gc/news/fr/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&pick=100&format=json";
const ROUNDS_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";

export const NEWS_PAGE_URL = "https://www.canada.ca/fr/immigration-refugies-citoyennete/nouvelles.html";
export const ROUNDS_PAGE_URL =
  "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/rondes-invitations.html";

/* ───────── Notícias ───────── */
export type NewsItem = { title: string; teaser: string; link: string; date: string };

const TOPIC = /francophon|français|française|Entrée express|bilingue|langues officielles/i;
// Avisos de agenda e documentos auxiliares não são notícia para o leitor.
const SKIP = /annoncera|tiendra|participera|fera une annonce|prononcera|notes d.allocution|^projets visant/i;

export async function getFrancophoneNews(limit = 6): Promise<NewsItem[] | null> {
  try {
    const res = await fetch(NEWS_URL, { next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      feed?: { entry?: { title: string; teaser: string; link: string; publishedDate: string }[] };
    };
    const items = (json.feed?.entry ?? [])
      .filter((e) => TOPIC.test(`${e.title} ${e.teaser}`) && !SKIP.test(e.title))
      .slice(0, limit)
      .map((e) => ({
        title: e.title.trim(),
        // Alguns resumos repetem a data/local no início ("16 octobre 2026 — Ottawa —").
        teaser: e.teaser.replace(/^[^—–]{0,60}[—–][^—–]{0,60}[—–]\s*/, "").trim(),
        link: e.link,
        date: e.publishedDate,
      }));
    return items.length ? items : null;
  } catch {
    return null;
  }
}

/* ───────── Rodadas do Express Entry ───────── */
export type DrawStats = {
  lastFrench: { date: string; size: number; crs: number };
  lastCec: { date: string; crs: number } | null;
  yearFrenchInvitations: number;
  yearFrenchRounds: number;
  year: number;
};

/** Valores verificados em 05/11/2026 (fallback se a API estiver fora do ar). */
export const DRAW_FALLBACK: DrawStats = {
  lastFrench: { date: "2026-10-27", size: 5000, crs: 407 },
  lastCec: { date: "2026-10-15", crs: 519 },
  yearFrenchInvitations: 0,
  yearFrenchRounds: 0,
  year: 2026,
};

const toInt = (v: string | number) => Number(String(v).replace(/[^\d]/g, ""));

export async function getFrenchDrawStats(): Promise<DrawStats | null> {
  try {
    const res = await fetch(ROUNDS_URL, { next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      rounds?: { drawDate: string; drawName: string; drawSize: string; drawCRS: string }[];
    };
    const rounds = (json.rounds ?? []).filter((r) => r.drawDate && r.drawCRS);
    const french = rounds.filter((r) => /french/i.test(r.drawName));
    const cec = rounds.find((r) => /canadian experience class/i.test(r.drawName));
    if (!french.length) return null;

    const last = french[0];
    const year = Number(last.drawDate.slice(0, 4));
    const ofYear = french.filter((r) => r.drawDate.startsWith(String(year)));
    return {
      lastFrench: { date: last.drawDate, size: toInt(last.drawSize), crs: toInt(last.drawCRS) },
      lastCec: cec ? { date: cec.drawDate, crs: toInt(cec.drawCRS) } : null,
      yearFrenchInvitations: ofYear.reduce((s, r) => s + toInt(r.drawSize), 0),
      yearFrenchRounds: ofYear.length,
      year,
    };
  } catch {
    return null;
  }
}
