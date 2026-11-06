-- Objectif B2 — esquema inicial
-- Todas as tabelas: id uuid, user_id (auth.users), created_at e RLS por usuário.

create extension if not exists pgcrypto;

-- ───────────────────────── Enums ─────────────────────────
do $$ begin
  create type public.skill as enum ('grammaire', 'vocabulaire', 'CO', 'CE', 'EE', 'EO');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.cefr_level as enum ('A1', 'A2', 'B1', 'B2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.material_type as enum ('gramatica', 'exercicios', 'metodo', 'audio', 'simulado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.chapter_status as enum ('nao_iniciado', 'em_andamento', 'concluido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.checkpoint_type as enum ('fim_de_fase', 'inscricao', 'simulado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.error_category as enum
    ('gramatica', 'conjugacao', 'vocabulario', 'ortografia', 'preposicao', 'pronuncia', 'compreensao', 'outro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.word_gender as enum ('m', 'f', 'm_f', 'nenhum');
exception when duplicate_object then null; end $$;

-- ───────────────────────── Tabelas ─────────────────────────
-- Perfil: datas definidas pelo próprio aluno no primeiro acesso (tela /comecar).
create table if not exists public.profiles (
  user_id          uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  plan_start       date not null,
  exam_date        date,
  weekly_goal_min  integer not null default 1200 check (weekly_goal_min between 60 and 4200),
  check (exam_date is null or exam_date >= plan_start)
);

create table if not exists public.phases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  name        text not null,
  level       public.cefr_level not null,
  week_start  smallint not null check (week_start >= 1),
  week_end    smallint not null,
  start_date  date not null,
  end_date    date not null,
  goals       text[] not null default '{}',
  check (week_end >= week_start),
  check (end_date >= start_date),
  unique (user_id, level)
);

create table if not exists public.materials (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  title       text not null check (length(trim(title)) > 0),
  type        public.material_type not null,
  level       public.cefr_level,
  unique (user_id, title)
);

create table if not exists public.chapters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  material_id   uuid not null references public.materials (id) on delete cascade,
  number        smallint not null check (number >= 0),
  title         text not null check (length(trim(title)) > 0),
  page_start    integer check (page_start >= 0),
  page_end      integer,
  status        public.chapter_status not null default 'nao_iniciado',
  completed_at  timestamptz,
  check (page_end is null or page_start is null or page_end >= page_start),
  unique (material_id, number)
);

create table if not exists public.study_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  date          date not null,
  duration_min  integer not null check (duration_min > 0 and duration_min <= 1440),
  skill         public.skill not null,
  material_id   uuid references public.materials (id) on delete set null,
  chapter_id    uuid references public.chapters (id) on delete set null,
  pages         text,
  notes         text
);

create table if not exists public.weekly_blocks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  weekday       smallint not null check (weekday between 1 and 7), -- 1 = segunda … 7 = domingo
  position      smallint not null default 1 check (position >= 1),
  skill         public.skill not null,
  duration_min  integer not null check (duration_min > 0 and duration_min <= 1440),
  description   text not null default '',
  unique (user_id, weekday, position)
);

create table if not exists public.block_completions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  block_id         uuid not null references public.weekly_blocks (id) on delete cascade,
  week_start_date  date not null,
  done             boolean not null default true,
  unique (block_id, week_start_date)
);

create table if not exists public.checkpoints (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  week      smallint not null check (week between 1 and 26),
  date      date not null,
  type      public.checkpoint_type not null,
  title     text not null,
  done      boolean not null default false,
  done_at   timestamptz,
  unique (user_id, week, type, title)
);

create table if not exists public.mock_exams (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  checkpoint_id uuid references public.checkpoints (id) on delete set null,
  date        date not null,
  co          smallint check (co between 0 and 699),
  ce          smallint check (ce between 0 and 699),
  ee          smallint check (ee between 0 and 20),
  eo          smallint check (eo between 0 and 20),
  notes       text
);

create table if not exists public.error_log (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  category     public.error_category not null default 'outro',
  wrong        text not null check (length(trim(wrong)) > 0),
  correct      text not null check (length(trim(correct)) > 0),
  explanation  text,
  reviewed     boolean not null default false
);

create table if not exists public.vocabulary (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now(),
  word             text not null check (length(trim(word)) > 0),
  gender           public.word_gender not null default 'nenhum',
  translation      text not null,
  example          text,
  ease             numeric(4,2) not null default 2.5 check (ease >= 1.3),
  repetitions      smallint not null default 0 check (repetitions >= 0),
  interval_days    integer not null default 0 check (interval_days >= 0),
  next_review_at   timestamptz not null default now(),
  unique (user_id, word)
);

-- ───────────────────────── Índices ─────────────────────────
create index if not exists idx_chapters_user_material  on public.chapters (user_id, material_id, number);
create index if not exists idx_sessions_user_date      on public.study_sessions (user_id, date desc);
create index if not exists idx_sessions_user_skill     on public.study_sessions (user_id, skill);
create index if not exists idx_sessions_chapter        on public.study_sessions (chapter_id);
create index if not exists idx_blocks_user_weekday     on public.weekly_blocks (user_id, weekday, position);
create index if not exists idx_completions_user_week   on public.block_completions (user_id, week_start_date);
create index if not exists idx_checkpoints_user_week   on public.checkpoints (user_id, week);
create index if not exists idx_mock_user_date          on public.mock_exams (user_id, date);
create index if not exists idx_errors_user_reviewed    on public.error_log (user_id, reviewed, created_at desc);
create index if not exists idx_vocab_user_next         on public.vocabulary (user_id, next_review_at);
create index if not exists idx_phases_user             on public.phases (user_id, week_start);
create index if not exists idx_materials_user          on public.materials (user_id);

-- ───────────────────────── RLS ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','phases','materials','chapters','study_sessions','weekly_blocks',
    'block_completions','checkpoints','mock_exams','error_log','vocabulary'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own_select" on public.%I', t);
    execute format('drop policy if exists "own_insert" on public.%I', t);
    execute format('drop policy if exists "own_update" on public.%I', t);
    execute format('drop policy if exists "own_delete" on public.%I', t);
    execute format('create policy "own_select" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "own_insert" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "own_update" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "own_delete" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

