-- Objectif B2 — ZERA o banco do app (irreversível).
-- Apaga todas as tabelas, tipos e funções do app e o registro de migrações.
-- As contas de login (auth.users) são mantidas: no próximo acesso, cada uma
-- passa pela tela de boas-vindas (/comecar) e monta um plano novo.
--
-- Uso: cole no SQL Editor do Supabase e execute; depois rode `npm run db:migrate`
-- (ou cole os arquivos de supabase/migrations em ordem).

drop table if exists
  public.block_completions,
  public.weekly_blocks,
  public.study_sessions,
  public.chapters,
  public.materials,
  public.mock_exams,
  public.checkpoints,
  public.phases,
  public.error_log,
  public.vocabulary,
  public.profiles,
  public._app_migrations
cascade;

drop function if exists public.seed_user_data();
drop function if exists public.seed_user_data(date, date, integer);
drop function if exists public.set_plan_start(date);
drop function if exists public.update_plan(date, date, integer);
drop function if exists public.default_plan_start();

drop type if exists
  public.skill,
  public.cefr_level,
  public.material_type,
  public.chapter_status,
  public.checkpoint_type,
  public.error_category,
  public.word_gender
cascade;

-- Opcional: apagar também as contas de login (descomente se quiser).
-- delete from auth.users;
