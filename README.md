# Objectif B2

Aplicativo web (mobile-first) para acompanhar os estudos de francês rumo ao **TCF Canada** (meta B2 / NCLC 7+, prova em maio/2027, 26 semanas de 09/11/2026 a 09/05/2027, 20 h/semana).

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS v4 · Material Web (`@material/web`, Material Design 3) · Supabase (Postgres + Auth por e-mail, `@supabase/ssr`) · Recharts · Zod.

## Telas

Início · Sessões (com cronômetro) · Livros · Rotina · Checkpoints e simulados · Estatísticas · Caderno de erros · Vocabulário (flashcards com SM-2).

Navegação: *navigation bar* no celular (5 destinos; "Mais" reúne Livros, Estatísticas, Erros e Vocabulário), *navigation rail* no tablet (≥ 768 px) e *navigation drawer* no desktop (≥ 1280 px).

### Planejado (ainda não implementado)

> **Livros — PDF + IA:** no item **Livros**, permitir adicionar livros em PDF e usar uma IA para gerar, a partir do conteúdo do livro:
>
> - **Exercícios** (por capítulo ou tema);
> - **Áudios** (para treinar a compreensão oral);
> - **Simulações** (no formato do TCF Canada).
>
> Observação apenas de planejamento — nada disso foi implementado ainda.

## 1. Criar o projeto no Supabase

1. Em <https://supabase.com/dashboard>, crie um projeto novo e guarde a senha do banco.
2. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
3. Em **Authentication → Providers**, mantenha **Email** habilitado.
   - Para testar sem confirmar e-mail, desative *Confirm email*. Com a confirmação ativa, o link enviado volta para `/auth/callback`.
4. Em **Authentication → URL Configuration**, defina *Site URL* (`http://localhost:3000` em desenvolvimento e a URL da Vercel em produção) e adicione `…/auth/callback` em *Redirect URLs*.

## 2. Rodar as migrações

As migrações ficam em `supabase/migrations`:

| Arquivo | Conteúdo |
| --- | --- |
| `20261105000001_schema.sql` | enums, tabelas, constraints, índices e políticas RLS |
| `20261105000002_seed_function.sql` | função `seed_user_data()` (fases, materiais, checkpoints e rotina padrão) |

Duas opções:

**a) SQL Editor do Supabase** — cole e execute cada arquivo, em ordem.

**b) Script local** — usa a string de conexão (**Project Settings → Database → Connection string**):

```powershell
# PowerShell — a senha precisa estar codificada em URL (% -> %25, @ -> %40, * -> %2A)
$env:DATABASE_URL = "postgresql://postgres:SENHA_CODIFICADA@db.SEU-PROJETO.supabase.co:5432/postgres"
npm run db:migrate
```

```bash
# bash
DATABASE_URL="postgresql://postgres:SENHA_CODIFICADA@db.SEU-PROJETO.supabase.co:5432/postgres" npm run db:migrate
```

O script registra o que já foi aplicado em `public._app_migrations` e pode ser repetido com segurança. Se sua rede não tiver IPv6, use a string do *Session pooler* no lugar do host `db.*`.

> Nunca grave a senha do banco em arquivos versionados. `DATABASE_URL` é usada só pelo script de migração.

### Modelo de dados

Todas as tabelas têm `id uuid`, `user_id` (→ `auth.users`, `default auth.uid()`), `created_at` e RLS (`select/insert/update/delete` apenas quando `user_id = auth.uid()`).

`phases`, `materials` → `chapters` → `study_sessions` (também → `materials`), `weekly_blocks` → `block_completions` (único por bloco + semana), `checkpoints` ← `mock_exams`, `error_log`, `vocabulary`.

Decisões de normalização: enums para habilidade (`grammaire, vocabulaire, CO, CE, EE, EO`), nível, tipo de material, status, tipo de checkpoint, categoria de erro e gênero; `chapters.number` único por material; `mock_exams.checkpoint_id` opcional liga a nota ao checkpoint; `CHECK` de faixa (CO/CE 0–699, EE/EO 0–20). `vocabulary` guarda também `repetitions` (necessário ao SM-2).

### Seed no primeiro login

Ao abrir qualquer tela autenticada, o app verifica se o usuário tem fases; se não tiver, chama `rpc('seed_user_data')`, que cria (de forma idempotente):

- 4 fases: A1 (sem. 1–4), A2 (5–10), B1 (11–18), B2/TCF (19–26);
- 9 materiais (Grammaire progressive, Les 500 exercices A1/A2/B1, Défi 1 e 2, TV5Monde, RFI, Simulados TCF);
- 8 checkpoints: testes de fim de fase (sem. 4, 10, 18), inscrição (sem. 14) e simulados (sem. 20, 22, 24, 26);
- rotina semanal padrão de 20 h.

Os capítulos não vêm no seed (os títulos e páginas dependem da sua edição): cadastre em **Livros** um a um ou use **Em lote**.

## 3. Rodar localmente

```bash
npm install
cp .env.example .env.local     # no Windows: copy .env.example .env.local
# edite .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Abra <http://localhost:3000>, crie uma conta e comece a registrar.

Outros scripts: `npm run build`, `npm run lint`, `npm run tokens` (regenera `src/app/tokens.css` a partir da cor-semente `#1F4FA0`).

## 4. Publicar na Vercel

1. Envie o repositório ao GitHub.
2. Na Vercel: **Add New → Project** e importe o repositório (preset Next.js detectado automaticamente).
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. **Não** adicione `DATABASE_URL`.
4. Faça o deploy.
5. No Supabase, atualize *Site URL* e *Redirect URLs* (`https://SEU-APP.vercel.app/auth/callback`).

## Design

- Tema claro, M3, semente `#1F4FA0`. Os tokens `--md-sys-color-*` (`src/app/tokens.css`, gerados com `@material/material-color-utilities`) alimentam o Material Web e são mapeados no Tailwind em `globals.css` (`bg-primary`, `bg-surface-container`, `text-on-surface`…).
- Roboto Flex e escala tipográfica M3 (classes `type-display-*`, `type-headline-*`, `type-title-*`, `type-body-*`, `type-label-*`).
- Ícones: Material Symbols Outlined (fonte carregada do Google Fonts).
- Os web components são carregados somente no cliente, por import dinâmico em `src/components/md-loader.tsx`; tipos JSX das tags `<md-*>` em `src/types/material-web.d.ts`.

## Estrutura

```
src/app/(app)/…        telas autenticadas (cada uma com page, loading e error)
src/app/actions.ts     Server Actions com validação Zod
src/app/login/         autenticação por e-mail e senha
src/lib/supabase/      clientes browser/servidor e renovação de sessão (proxy.ts)
src/lib/sm2.ts         repetição espaçada
supabase/migrations/   SQL
```
