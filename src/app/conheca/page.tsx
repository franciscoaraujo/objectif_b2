import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Flags, MapleLeaf, QuebecFlag } from "@/components/flags";
import { CTA_URL, OFFER } from "@/lib/offer";
import {
  DRAW_FALLBACK,
  NEWS_PAGE_URL,
  ROUNDS_PAGE_URL,
  getFrancophoneNews,
  getFrenchDrawStats,
  type DrawStats,
  type NewsItem,
} from "@/lib/canada-data";

export const metadata: Metadata = {
  title: { absolute: "Objectif B2 · Francês B2 para imigrar ao Canadá com o TCF Canada" },
  description:
    "Do A1 ao B2 (NCLC 7) em 26 semanas: rotina pronta, cronômetro, simulados, caderno de erros e vocabulário com repetição espaçada. Até +50 pontos no CRS do Express Entry.",
};

/** Data em que as regras de imigração abaixo foram conferidas nas fontes oficiais. */
const FACTS_CHECKED = "05/11/2026";


/* ───────── Conteúdo ───────── */
const PAINS = [
  {
    icon: "explore_off",
    title: "Estudar sem rumo",
    text: "Um dia é gramática, no outro é série em francês. Sem plano, as semanas passam e o nível não sobe.",
  },
  {
    icon: "hourglass_empty",
    title: "Não saber se está no ritmo",
    text: "Quantas horas você estudou essa semana? E no mês? Sem números, fica impossível ajustar a rota.",
  },
  {
    icon: "replay",
    title: "Repetir os mesmos erros",
    text: "Os erros que você já cometeu voltam no simulado porque ninguém anotou nem revisou.",
  },
];

const FEATURES = [
  { icon: "calendar_view_week", title: "Rotina semanal", text: "Blocos de estudo por dia e habilidade. Marque o que foi feito e veja o que falta." },
  { icon: "timer", title: "Cronômetro de sessões", text: "Dê o play, estude e salve. Cada minuto entra nas suas estatísticas." },
  { icon: "auto_stories", title: "Livros e capítulos", text: "Acompanhe o progresso em cada material, capítulo por capítulo." },
  { icon: "flag", title: "Checkpoints e simulados", text: "Testes de fim de fase e simulados do TCF com data marcada no calendário." },
  { icon: "monitoring", title: "Estatísticas", text: "Horas por semana, por habilidade e a evolução das suas notas." },
  { icon: "spellcheck", title: "Caderno de erros", text: "Registre cada erro com a correção e revise antes da prova." },
  { icon: "style", title: "Vocabulário com SRS", text: "Flashcards com repetição espaçada (SM-2): revise na hora certa e memorize de vez." },
  { icon: "devices", title: "No celular e no PC", text: "Use no navegador de qualquer aparelho. Seus dados ficam salvos na nuvem." },
];

const PHASES = [
  { level: "A1", weeks: "Semanas 1–4", name: "Fundamentos", goals: ["Alfabeto, pronúncia e números", "Presente dos verbos essenciais", "Apresentar-se e vocabulário do dia a dia"] },
  { level: "A2", weeks: "Semanas 5–10", name: "Consolidação", goals: ["Passé composé e imparfait", "Pronomes e preposições", "Textos e áudios curtos"] },
  { level: "B1", weeks: "Semanas 11–18", name: "Construção", goals: ["Subjonctif e condicional", "Argumentar e opinar", "E-mails e textos de 120 palavras"] },
  { level: "B2", weeks: "Semanas 19–26", name: "Preparação TCF", goals: ["Simulados cronometrados", "Escrita e fala no formato TCF", "Revisão dos erros recorrentes"] },
];

const STEPS = [
  { n: "1", title: "Crie sua conta", text: "Em segundos. O plano de 26 semanas, a rotina e os materiais já vêm configurados." },
  { n: "2", title: "Siga a rotina do dia", text: "Abra o app, veja os blocos de hoje, use o cronômetro e marque o que concluiu." },
  { n: "3", title: "Meça e ajuste", text: "Faça os checkpoints, registre as notas e acompanhe sua evolução até o B2." },
];

const INCLUDED = [
  "Plano completo de 26 semanas (A1 → B2)",
  "Rotina semanal pronta e personalizável",
  "Cronômetro e histórico de sessões",
  "Acompanhamento de livros e capítulos",
  "Calendário de checkpoints e simulados",
  "Estatísticas de horas e notas",
  "Caderno de erros",
  "Vocabulário com repetição espaçada",
];

/** Notas mínimas no TCF Canada para NCLC 7 (tabela oficial do IRCC). */
const TCF_NCLC7 = [
  { skill: "Compreensão oral", score: "458", max: "699" },
  { skill: "Compreensão escrita", score: "453", max: "699" },
  { skill: "Expressão oral", score: "10", max: "20" },
  { skill: "Expressão escrita", score: "10", max: "20" },
];

const SOURCES = [
  { label: "Critérios do CRS (IRCC)", href: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/admissibilite/criteres-systeme-classement-global.html" },
  { label: "Seleção por categoria (IRCC)", href: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/rondes-invitations/selection-axee-ensembles.html" },
  { label: "Rodadas de convites (IRCC)", href: ROUNDS_PAGE_URL },
  { label: "PSTQ — exigências (Québec.ca)", href: "https://www.quebec.ca/immigration/permanente/travailleurs-qualifies/programme-selection-travailleurs-qualifies/exigences" },
  { label: "Mobilité francophone (IRCC)", href: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada/instructions-speciales/mobilite-francophone.html" },
];

const FAQ = [
  {
    q: "O que é NCLC 7 e por que ele é tão importante?",
    a: "NCLC são os Niveaux de compétence linguistique canadiens, a escala oficial do Canadá para o francês. O NCLC 7 corresponde, na prática, ao nível B2. É ele que dá os pontos extras de francês no Express Entry e que abre a categoria exclusiva de francês, desde que você o atinja nas 4 habilidades.",
  },
  {
    q: "Preciso já saber francês?",
    a: "Não. O plano começa no A1, com alfabeto, pronúncia e verbos essenciais, e avança fase por fase até o B2.",
  },
  {
    q: "Quanto tempo preciso estudar por semana?",
    a: "O plano foi pensado para 20 horas por semana. Você pode ajustar os blocos da rotina ao seu tempo disponível.",
  },
  {
    q: "O sistema inclui aulas ou livros?",
    a: "Não. O Objectif B2 é o seu sistema de organização e acompanhamento: ele diz o que estudar, quando, e mede o seu progresso. Os livros e áudios sugeridos (como Grammaire progressive, Les 500 exercices, TV5Monde e RFI) são adquiridos ou acessados à parte.",
  },
  {
    q: "O Objectif B2 faz consultoria de imigração?",
    a: "Não. Somos uma ferramenta de estudo de francês. As informações sobre imigração desta página vêm de fontes oficiais (IRCC e Québec.ca) e servem só como contexto. Para o seu processo, consulte os sites oficiais ou um representante autorizado (consultor regulamentado pelo CICC ou advogado).",
  },
  {
    q: "O sistema garante minha nota no TCF?",
    a: "Nenhum método garante nota. O que o Objectif B2 garante é clareza: você sabe exatamente o que fazer em cada semana e acompanha se está no ritmo para a meta NCLC 7+.",
  },
];

/* ───────── Utilitários ───────── */
const fmtInt = (n: number) => n.toLocaleString("pt-BR");
const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Toronto",
  });

/* ───────── Peças visuais ───────── */
function CtaButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={CTA_URL}
      className={`inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#D52B1E] px-8 text-[17px] font-semibold text-white shadow-[0_10px_28px_-8px_rgba(213,43,30,0.75)] transition hover:-translate-y-0.5 hover:bg-[#e63b2e] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#D52B1E] ${className}`}
    >
      {children}
      <Icon name="arrow_forward" size={20} />
    </Link>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  dark?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p
        className={`inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] ${
          dark ? "text-[#ff7b70]" : "text-[#D52B1E]"
        }`}
      >
        <MapleLeaf className="h-3.5 w-3.5" />
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-[32px] leading-[40px] font-semibold tracking-tight md:text-[40px] md:leading-[48px] ${
          dark ? "text-white" : "text-on-surface"
        }`}
      >
        {title}
      </h2>
      {text && <p className={`mt-4 type-body-large ${dark ? "text-white/75" : "text-on-surface-variant"}`}>{text}</p>}
    </div>
  );
}

/** Prévia ilustrativa do painel do app (HTML puro, nítida em qualquer tela). */
function AppPreview() {
  const blocks = [
    { icon: "menu_book", label: "Gramática", sub: "Grammaire progressive", time: "1 h", done: true },
    { icon: "headphones", label: "Compreensão oral", sub: "TV5Monde / RFI", time: "1 h", done: true },
    { icon: "translate", label: "Vocabulário", sub: "Flashcards SRS", time: "30 min", done: false },
  ];
  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[40px] bg-[#D52B1E]/25 blur-3xl" />
      <div className="relative rounded-[28px] border border-white/15 bg-white p-5 text-on-surface shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-on-surface-variant">Fase B1 · Construção</p>
            <p className="text-[22px] leading-7 font-semibold">Semana 12 de 26</p>
          </div>
          <Flags className="h-5" />
        </div>

        <div className="mt-4 rounded-2xl bg-primary-container p-4 text-on-primary-container">
          <div className="flex items-baseline justify-between">
            <p className="text-[13px] font-medium">Horas desta semana</p>
            <span className="rounded-full bg-[#d7ecd3] px-2.5 py-0.5 text-[12px] font-semibold text-[#0f3a14]">No ritmo · 80%</span>
          </div>
          <p className="mt-1 text-[40px] leading-[48px] font-light">
            16 <span className="text-[20px]">/ 20 h</span>
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
            <div className="h-full w-4/5 rounded-full bg-primary" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-container p-3">
            <p className="text-[12px] text-on-surface-variant">Dias até o TCF</p>
            <p className="text-[26px] leading-8">98</p>
          </div>
          <div className="rounded-2xl bg-surface-container p-3">
            <p className="text-[12px] text-on-surface-variant">Revisões hoje</p>
            <p className="text-[26px] leading-8">24</p>
          </div>
        </div>

        <p className="mt-4 mb-2 text-[13px] font-semibold">Blocos de hoje</p>
        <ul className="divide-y divide-outline-variant overflow-hidden rounded-2xl bg-surface-container-low">
          {blocks.map((b) => (
            <li key={b.label} className="flex items-center gap-3 px-3 py-2.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-[4px] border-2 ${
                  b.done ? "border-primary bg-primary text-white" : "border-on-surface-variant"
                }`}
              >
                {b.done && <Icon name="check" size={16} />}
              </span>
              <Icon name={b.icon} size={20} className="text-on-surface-variant" />
              <div className="min-w-0 flex-1">
                <p className={`text-[14px] font-medium ${b.done ? "text-on-surface-variant line-through" : ""}`}>{b.label}</p>
                <p className="truncate text-[12px] text-on-surface-variant">{b.sub}</p>
              </div>
              <span className="text-[13px] tabular">{b.time}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cartões flutuantes */}
      <div className="absolute -bottom-10 -left-8 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-on-surface shadow-xl sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fde3e1] text-[#D52B1E]">
          <MapleLeaf className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[12px] text-on-surface-variant">Meta Express Entry</p>
          <p className="text-[15px] font-semibold">NCLC 7 nas 4 habilidades</p>
        </div>
      </div>
      <div className="absolute -top-10 -right-6 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 text-on-surface shadow-xl sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <Icon name="flag" fill size={20} />
        </span>
        <div>
          <p className="text-[12px] text-on-surface-variant">Próximo checkpoint</p>
          <p className="text-[15px] font-semibold">Fim da fase B1</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── Seção: vantagens do B2 ───────── */
function AdvantagesSection({ draws, live }: { draws: DrawStats; live: boolean }) {
  const gap = draws.lastCec ? draws.lastCec.crs - draws.lastFrench.crs : null;
  return (
    <section id="vantagens" className="relative scroll-mt-16 overflow-hidden bg-surface py-24">
      <MapleLeaf className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 text-[#D52B1E]/[0.05]" />
      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Por que o B2"
          title="Francês B2 é o atalho mais forte para imigrar ao Canadá"
          text="Para o governo canadense, o seu nível de francês vale pontos, abre filas exclusivas e é exigido nos principais programas do Quebec."
        />

        {/* Destaque: pontos + rodadas */}
        <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
          <div className="relative overflow-hidden rounded-[28px] bg-[#D52B1E] p-8 text-white">
            <MapleLeaf className="pointer-events-none absolute -right-10 -bottom-12 h-56 w-56 text-white/10" />
            <p className="text-[14px] font-semibold tracking-wide text-white/85 uppercase">Express Entry · CRS</p>
            <p className="mt-3 text-[64px] leading-none font-bold tracking-tight">+50</p>
            <p className="mt-1 text-[20px] font-semibold">pontos extras por francês</p>
            <p className="relative mt-4 max-w-md text-[16px] leading-6 text-white/90">
              Com <strong>NCLC 7 ou mais nas 4 habilidades</strong> em francês você ganha <strong>+50 pontos</strong> se também
              tiver inglês CLB 5+, ou <strong>+25 pontos</strong> mesmo sem inglês. Além dos pontos normais de idioma.
            </p>
          </div>

          <div className="rounded-[28px] bg-[#0b1d45] p-8 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[14px] font-semibold tracking-wide text-white/70 uppercase">Categoria exclusiva de francês</p>
                <p className="mt-1 text-[15px] text-white/80">Rodadas de convite só para quem tem NCLC 7 nas 4 habilidades</p>
              </div>
              {live && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" /> Dados oficiais
                </span>
              )}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[13px] text-white/70">Nota mínima · francês</p>
                <p className="mt-1 text-[40px] leading-none font-bold text-[#ff7b70] tabular">{draws.lastFrench.crs}</p>
                <p className="mt-2 text-[12px] text-white/60">{fmtDate(draws.lastFrench.date)} · {fmtInt(draws.lastFrench.size)} convites</p>
              </div>
              {draws.lastCec && (
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-[13px] text-white/70">Nota mínima · Canadian Experience</p>
                  <p className="mt-1 text-[40px] leading-none font-bold text-white/90 tabular">{draws.lastCec.crs}</p>
                  <p className="mt-2 text-[12px] text-white/60">{fmtDate(draws.lastCec.date)}</p>
                </div>
              )}
            </div>
            {gap !== null && gap > 0 && (
              <p className="mt-5 flex items-center gap-2 text-[15px]">
                <Icon name="trending_down" className="text-[#4ade80]" />
                <span>
                  Na última rodada, a nota de corte de francês ficou <strong>{gap} pontos abaixo</strong>.
                </span>
              </p>
            )}
            {draws.yearFrenchRounds > 0 && (
              <p className="mt-2 text-[14px] text-white/70">
                Em {draws.year}: {draws.yearFrenchRounds} rodadas de francês e {fmtInt(draws.yearFrenchInvitations)} convites.
              </p>
            )}
          </div>
        </div>

        {/* Outras vantagens */}
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] bg-surface-container-low p-7">
            <span className="flex h-12 items-center">
              <QuebecFlag className="h-10 w-auto rounded-md shadow ring-1 ring-black/10" />
            </span>
            <h3 className="mt-5 text-[20px] font-semibold">Quebec: PSTQ</h3>
            <p className="mt-2 text-on-surface-variant type-body-large">
              No Volet 1 do Programa de Seleção de Trabalhadores Qualificados (profissões qualificadas), o Quebec exige
              francês oral <strong className="text-on-surface">nível 7</strong> e escrito nível 5. O francês também soma
              pontos na seleção.
            </p>
          </div>
          <div className="rounded-[28px] bg-surface-container-low p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary">
              <Icon name="groups" />
            </span>
            <h3 className="mt-5 text-[20px] font-semibold">Prioridade francófona</h3>
            <p className="mt-2 text-on-surface-variant type-body-large">
              O Canadá quer mais francófonos fora do Quebec: a meta é <strong className="text-on-surface">9% dos novos residentes em 2026</strong>,
              10,5% em 2028. Em 2025 foram mais de 29.500 admitidos.
            </p>
          </div>
          <div className="rounded-[28px] bg-surface-container-low p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary">
              <Icon name="work" />
            </span>
            <h3 className="mt-5 text-[20px] font-semibold">Mobilité francophone</h3>
            <p className="mt-2 text-on-surface-variant type-body-large">
              Permissão de trabalho fora do Quebec sem LMIA para quem fala francês (oral NCLC 5+). Com B2 você passa
              <strong className="text-on-surface"> com folga</strong> desse requisito.
            </p>
          </div>
        </div>

        {/* Meta no TCF */}
        <div className="mt-5 rounded-[28px] border border-outline-variant p-7 md:flex md:items-center md:gap-10">
          <div className="md:w-72 md:shrink-0">
            <p className="text-[14px] font-semibold text-[#D52B1E] uppercase tracking-wide">Sua meta no TCF Canada</p>
            <h3 className="mt-1 text-[22px] leading-7 font-semibold">Notas mínimas para <span className="whitespace-nowrap">NCLC 7</span></h3>
            <p className="mt-2 text-on-surface-variant type-body-medium">O Objectif B2 acompanha você até elas.</p>
          </div>
          <dl className="mt-6 grid flex-1 grid-cols-2 gap-3 md:mt-0 lg:grid-cols-4">
            {TCF_NCLC7.map((t) => (
              <div key={t.skill} className="rounded-2xl bg-surface-container-low p-4">
                <dt className="text-on-surface-variant type-label-large">{t.skill}</dt>
                <dd className="mt-1 text-[32px] leading-10 font-bold text-primary tabular">
                  {t.score}
                  <span className="text-[15px] font-normal text-on-surface-variant"> / {t.max}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 text-center text-on-surface-variant type-body-small">
          Fontes oficiais, conferidas em {FACTS_CHECKED}
          {live ? "; rodadas do Express Entry atualizadas automaticamente" : ""}:{" "}
          {SOURCES.map((s, i) => (
            <span key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                {s.label}
              </a>
              {i < SOURCES.length - 1 ? " · " : "."}
            </span>
          ))}{" "}
          As regras de imigração mudam com frequência. Esta página não é consultoria de imigração.
        </p>
      </div>
    </section>
  );
}

/* ───────── Seção: notícias ───────── */
function NewsSection({ news }: { news: NewsItem[] | null }) {
  return (
    <section id="noticias" className="scroll-mt-16 bg-surface-container-low py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <SectionHeading
          eyebrow="Notícias oficiais"
          title="Imigração francófona: o que há de novo"
          text="Comunicados recentes do IRCC (Imigração, Refugiados e Cidadania Canadá), em francês. Ler já é treino para o TCF."
        />
        {news ? (
          <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n, i) => (
              <li key={n.link} className={i === 0 ? "md:col-span-2" : ""}>
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  lang="fr"
                  className={`group flex h-full flex-col rounded-[24px] p-6 ring-1 transition hover:-translate-y-1 hover:shadow-lg ${
                    i === 0
                      ? "bg-[#0b1d45] text-white ring-transparent"
                      : "bg-surface-container-lowest ring-outline-variant/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                        i === 0 ? "bg-[#D52B1E] text-white" : "bg-[#fde3e1] text-[#9b1c13]"
                      }`}
                    >
                      <MapleLeaf className="h-3 w-3" />
                      {i === 0 ? "Mais recente" : "IRCC"}
                    </span>
                    <time dateTime={n.date} className={`text-[13px] ${i === 0 ? "text-white/70" : "text-on-surface-variant"}`}>
                      {fmtDate(n.date)}
                    </time>
                  </div>
                  <h3 className={`mt-4 font-semibold ${i === 0 ? "text-[24px] leading-8" : "text-[17px] leading-6"}`}>{n.title}</h3>
                  {i === 0 && (!n.teaser || n.teaser === n.title) && (
                    <p className="mt-3 text-[16px] leading-6 text-white/70">
                      Comunicado oficial do Immigration, Refugees and Citizenship Canada (IRCC).
                    </p>
                  )}
                  {n.teaser && n.teaser !== n.title && (
                    <p
                      className={`mt-3 ${i === 0 ? "line-clamp-4 text-[16px] leading-6 text-white/80" : "line-clamp-3 text-on-surface-variant type-body-medium"}`}
                    >
                      {n.teaser}
                    </p>
                  )}
                  <span
                    className={`mt-auto inline-flex items-center gap-1 pt-5 text-[14px] font-semibold ${
                      i === 0 ? "text-[#ff7b70]" : "text-primary"
                    }`}
                  >
                    Lire sur Canada.ca
                    <Icon name="open_in_new" size={16} className="transition group-hover:translate-x-0.5" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-12 max-w-xl rounded-[24px] bg-surface-container-lowest p-8 text-center ring-1 ring-outline-variant/60">
            <Icon name="newspaper" size={40} className="text-on-surface-variant" />
            <p className="mt-3 type-title-medium">Não foi possível carregar as notícias agora.</p>
          </div>
        )}
        <p className="mt-8 text-center">
          <a
            href={NEWS_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            Todas as notícias do IRCC <Icon name="open_in_new" size={16} />
          </a>
        </p>
      </div>
    </section>
  );
}

/* ───────── Página ───────── */
export default async function LandingPage() {
  const [news, liveDraws] = await Promise.all([getFrancophoneNews(5), getFrenchDrawStats()]);
  const draws = liveDraws ?? DRAW_FALLBACK;

  return (
    <div className="bg-surface text-on-surface">
      {/* Faixa com as cores do Canadá */}
      <div aria-hidden="true" className="flex h-1.5">
        <span className="flex-1 bg-[#D52B1E]" />
        <span className="flex-[2] bg-white" />
        <span className="flex-1 bg-[#D52B1E]" />
      </div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1d45]/90 text-white backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href="/conheca" className="flex items-center gap-2 text-[18px] font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D52B1E]">
              <MapleLeaf className="h-5 w-5 text-white" />
            </span>
            Objectif B2
          </Link>
          <nav aria-label="Seções" className="hidden items-center gap-6 text-[14px] text-white/80 lg:flex">
            <a href="#vantagens" className="hover:text-white">Por que o B2</a>
            <a href="#recursos" className="hover:text-white">Recursos</a>
            <a href="#plano" className="hover:text-white">O plano</a>
            <a href="#preco" className="hover:text-white">Preço</a>
            <a href="#noticias" className="hover:text-white">Notícias</a>
            <a href="#faq" className="hover:text-white">Dúvidas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-full px-4 py-2 text-[14px] font-medium text-white/90 hover:bg-white/10">
              Entrar
            </Link>
            <Link
              href={CTA_URL}
              className="hidden rounded-full bg-[#D52B1E] px-5 py-2 text-[14px] font-semibold text-white hover:bg-[#e63b2e] sm:inline-flex"
            >
              Quero acesso
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b1d45] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,rgba(31,79,160,0.9),transparent),radial-gradient(45%_55%_at_5%_95%,rgba(213,43,30,0.45),transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px]"
        />
        <MapleLeaf className="pointer-events-none absolute -bottom-40 -left-32 h-[520px] w-[520px] rotate-[-14deg] text-white/[0.04]" />
        <MapleLeaf className="pointer-events-none absolute top-16 right-[46%] hidden h-16 w-16 rotate-12 text-[#D52B1E]/40 lg:block" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-14 pb-24 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-32">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 py-1.5 pr-4 pl-2 text-[13px] font-medium">
              <Flags className="h-4" />
              Rumo ao TCF Canada · meta NCLC 7+
            </p>
            <h1 className="mt-6 text-[38px] leading-[44px] font-bold tracking-tight md:text-[54px] md:leading-[60px]">
              Do <span className="text-[#ff7b70]">A1</span> ao <span className="text-[#ff7b70]">B2</span> em 26 semanas,
              com um plano que diz o que estudar hoje.
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-[28px] text-white/80">
              O francês B2 vale até <strong className="text-white">+50 pontos no Express Entry</strong> e abre a fila exclusiva
              para francófonos. O Objectif B2 organiza sua preparação para o TCF Canada: rotina pronta, cronômetro,
              simulados, caderno de erros e vocabulário com repetição espaçada.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaButton>Quero meu acesso</CtaButton>
              <a
                href="#vantagens"
                className="inline-flex h-14 items-center justify-center rounded-full border border-white/30 px-7 text-[16px] font-medium hover:bg-white/10"
              >
                Por que o B2?
              </a>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {[
                ["26", "semanas de plano"],
                ["+50", "pontos no CRS"],
                [String(draws.lastFrench.crs), "último corte (francês)"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dd className="text-[32px] leading-10 font-bold tabular">{v}</dd>
                  <dt className="text-[13px] text-white/70">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <AppPreview />
        </div>
      </section>

      <AdvantagesSection draws={draws} live={liveDraws !== null} />

      {/* Dores */}
      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <SectionHeading
            eyebrow="O problema"
            title="Querer o Canadá não basta. Falta método."
            text="A maioria desiste do francês ou chega no TCF despreparada pelos mesmos três motivos:"
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PAINS.map((p) => (
              <div key={p.title} className="rounded-3xl bg-surface-container-lowest p-7 ring-1 ring-outline-variant/60">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error-container text-on-error-container">
                  <Icon name={p.icon} />
                </span>
                <h3 className="mt-5 text-[20px] font-semibold">{p.title}</h3>
                <p className="mt-2 text-on-surface-variant type-body-large">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 md:px-8">
        <SectionHeading
          eyebrow="A solução"
          title="Tudo o que você precisa para chegar ao B2"
          text="Um sistema feito para a rotina de quem estuda francês com um objetivo claro: imigrar para o Canadá."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/60 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary transition group-hover:bg-[#D52B1E]">
                <Icon name={f.icon} />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold">{f.title}</h3>
              <p className="mt-2 text-on-surface-variant type-body-medium">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plano */}
      <section id="plano" className="scroll-mt-16 bg-surface-container-low py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <SectionHeading
            eyebrow="O plano"
            title="4 fases. 26 semanas. Uma meta: NCLC 7."
            text="Cada fase tem objetivos definidos e termina com um checkpoint para você medir o avanço."
          />
          <div className="relative mt-14">
            <div
              aria-hidden="true"
              className="absolute top-7 right-[12%] left-[12%] hidden h-1 rounded-full bg-gradient-to-r from-primary-container via-primary to-[#D52B1E] md:block"
            />
            <ol className="relative grid gap-5 md:grid-cols-4">
              {PHASES.map((p, i) => (
                <li key={p.level} className="relative">
                  <div
                    className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full text-[18px] font-bold ring-8 ring-surface-container-low ${
                      i === PHASES.length - 1 ? "bg-[#D52B1E] text-white" : "bg-primary text-on-primary"
                    }`}
                  >
                    {p.level}
                  </div>
                  <div className="mt-5 rounded-3xl bg-surface-container-lowest p-6 ring-1 ring-outline-variant/60">
                    <p className="text-[13px] font-medium text-primary">{p.weeks}</p>
                    <h3 className="mt-1 text-[19px] font-semibold">{p.name}</h3>
                    <ul className="mt-3 flex flex-col gap-2">
                      {p.goals.map((g) => (
                        <li key={g} className="flex gap-2 text-on-surface-variant type-body-medium">
                          <Icon name="check" size={18} className="mt-0.5 shrink-0 text-primary" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="relative overflow-hidden bg-[#0b1d45] py-24 text-white">
        <MapleLeaf className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rotate-12 text-white/[0.04]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <SectionHeading eyebrow="Como funciona" title="Comece hoje em 3 passos" dark />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <span className="text-[48px] leading-none font-bold text-[#ff7b70]">{s.n}</span>
                <h3 className="mt-4 text-[20px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-6 text-white/75">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section id="preco" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-24 md:px-8">
        <SectionHeading eyebrow="Preço" title="Invista no seu passaporte francófono" text="Um pagamento. Acesso a todo o sistema." />
        <div className="mx-auto mt-14 max-w-md">
          <div className="relative overflow-hidden rounded-[32px] bg-surface-container-lowest shadow-2xl ring-2 ring-[#D52B1E]">
            <div aria-hidden="true" className="flex h-2">
              <span className="flex-1 bg-[#D52B1E]" />
              <span className="flex-[2] bg-white" />
              <span className="flex-1 bg-[#D52B1E]" />
            </div>
            <div className="p-8">
              <div className="flex items-center justify-center gap-2">
                <Flags className="h-4" />
                <p className="text-[18px] font-semibold">{OFFER.planName}</p>
              </div>
              <div className="mt-4 text-center">
                {OFFER.priceFrom && <p className="text-on-surface-variant line-through type-body-large">{OFFER.priceFrom}</p>}
                <p className="text-[52px] leading-[60px] font-bold tracking-tight text-[#D52B1E]">{OFFER.price}</p>
                {OFFER.installments && <p className="text-on-surface-variant type-body-medium">{OFFER.installments}</p>}
                <p className="mt-1 text-[13px] font-medium text-on-surface-variant">{OFFER.accessPeriod}</p>
              </div>
              <ul className="mt-8 flex flex-col gap-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3 type-body-large">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d7ecd3] text-[#0f3a14]">
                      <Icon name="check" size={16} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <CtaButton className="mt-8 w-full">Quero meu acesso</CtaButton>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-on-surface-variant">
                <Icon name="lock" size={16} /> Acesso imediato após o cadastro
              </p>
            </div>
          </div>
        </div>
      </section>

      <NewsSection news={news} />

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
          <div className="mt-12 flex flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-surface-container-lowest p-5 ring-1 ring-outline-variant/60 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="expand_more" className="shrink-0 text-on-surface-variant transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-on-surface-variant type-body-large">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-4 pb-24 md:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-gradient-to-br from-[#1f4fa0] to-[#0b1d45] px-6 py-16 text-center text-white md:px-16">
          <MapleLeaf className="pointer-events-none absolute -right-16 -bottom-20 h-72 w-72 -rotate-12 text-[#D52B1E]/35" />
          <div className="relative flex justify-center">
            <Flags className="h-7" />
          </div>
          <h2 className="relative mt-6 text-[32px] leading-[40px] font-bold tracking-tight md:text-[44px] md:leading-[52px]">
            Sua vida no Canadá começa com o B2.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-[18px] leading-7 text-white/80">
            Pare de estudar no improviso. Tenha um plano, acompanhe cada hora e chegue ao TCF sabendo que fez o
            necessário.
          </p>
          <CtaButton className="relative mt-9">Começar agora</CtaButton>
        </div>
      </section>

      <footer className="border-t border-outline-variant">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center text-on-surface-variant type-body-small md:flex-row md:text-left md:px-8">
          <p className="flex items-center gap-2">
            <MapleLeaf className="h-4 w-4 text-[#D52B1E]" />© {new Date().getFullYear()} Objectif B2. Todos os direitos reservados.
          </p>
          <p className="max-w-xl">
            Não somos afiliados ao Governo do Canadá, ao Governo do Quebec nem à France Éducation international (TCF).
            Ferramenta de estudo; não é consultoria de imigração.
          </p>
        </div>
      </footer>
    </div>
  );
}
