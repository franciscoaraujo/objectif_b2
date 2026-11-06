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

## Ambientes

| Ambiente | Branch | Banco Supabase | Variáveis |
| --- | --- | --- | --- |
| Desenvolvimento | `dev` | local, no Docker (Supabase CLI) | `.env.local` |
| Homologação | `hml` | projeto `ogcrrcnmguxkmuodfbci` | `.env.hml.local` e Vercel (Preview, branch `hml`) |
| Produção | `master` | projeto `ppqkixwlkxxehijoxmoi` | Vercel (Production) |

Fluxo: desenvolva na `dev` → merge na `hml` para testar → merge na `master` para publicar.

### Desenvolvimento local (Docker)

Requer o Docker Desktop aberto.

```bash
npm run db:start    # sobe Postgres, Auth, API, Studio e Mailpit e aplica as migrações
npm run dev         # app em http://localhost:3000
```

| Serviço | Endereço |
| --- | --- |
| Studio (painel do banco) | http://127.0.0.1:54323 |
| Mailpit (e-mails de confirmação) | http://127.0.0.1:54324 |
| API | http://127.0.0.1:54321 |

- `.env.local` aponta para o Supabase local (`npm run db:status` mostra URL e chaves).
- `npm run db:reset` recria o banco local do zero e reaplica as migrações.
- `npm run db:stop` desliga os containers.
- A configuração local fica em `supabase/config.toml`: confirmação de e-mail ligada, modelo de e-mail em português e nenhum dado fictício.

### Homologação

`npm run db:migrate:hml` aplica as migrações no projeto de homologação usando `.env.hml.local`.

## 1. Criar o projeto no Supabase

1. Em <https://supabase.com/dashboard>, crie um projeto novo e guarde a senha do banco.
2. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public**.
3. Em **Authentication → Providers**, mantenha **Email** habilitado.
   - Para testar sem confirmar e-mail, desative *Confirm email*. Com a confirmação ativa, o link enviado volta para `/auth/callback`.
4. Em **Authentication → URL Configuration**, defina *Site URL* (`http://localhost:3000` em desenvolvimento e a URL da Vercel em produção) e adicione `…/auth/callback**` em *Redirect URLs* (o `**` cobre o `?next=/redefinir-senha` da recuperação de senha).

5. Em **Authentication → Email Templates → Confirm signup**, use o modelo em português:
   - *Subject*: `Confirme seu e-mail · Objectif B2`
   - *Body*: cole o conteúdo de `supabase/templates/confirm-signup.html`. O link usa `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`, validado em `/auth/confirm` (funciona mesmo se o e-mail for aberto em outro navegador ou aparelho) e leva a `/email-confirmado`.

## 2. Rodar as migrações

As migrações ficam em `supabase/migrations`:

| Arquivo | Conteúdo |
| --- | --- |
| `20261105000001_schema.sql` | enums, tabelas (incluindo `profiles`), constraints, índices e políticas RLS |
| `20261105000002_seed_function.sql` | `seed_user_data(início, prova, meta)` (perfil, fases, materiais, checkpoints e rotina) e `update_plan()` |

Para recomeçar do zero, execute `supabase/reset.sql` no SQL Editor (apaga todos os dados do app, mantém as contas de login) e rode as migrações de novo.

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

### Primeiro acesso: o aluno define as datas

O app não impõe datas. Sem perfil, qualquer tela autenticada redireciona para **/comecar**, onde o aluno informa o início do plano (qualquer dia), a data da prova (opcional) e a meta semanal. Então `rpc('seed_user_data')` cria (de forma idempotente):

- o perfil com essas datas;
- 4 fases: A1 (sem. 1–4), A2 (5–10), B1 (11–18), B2/TCF (19–26);
- 9 materiais (Grammaire progressive, Les 500 exercices A1/A2/B1, Défi 1 e 2, TV5Monde, RFI, Simulados TCF);
- 8 checkpoints sugeridos: testes de fim de fase (sem. 4, 10, 18), inscrição (sem. 14) e simulados (sem. 20, 22, 24, 26). O aluno muda a data de cada um em **Provas**;
- rotina semanal padrão de 20 h.

Em **Meu plano**, o aluno muda início, prova e meta; `update_plan()` desloca fases e checkpoints pelo mesmo intervalo, preservando os ajustes feitos.

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
