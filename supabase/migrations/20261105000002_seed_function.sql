-- Seed idempotente chamado no primeiro login: select public.seed_user_data();
-- Plano: 09/11/2026 (segunda) a 09/05/2027, 26 semanas.

create or replace function public.seed_user_data()
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  plan_start date := date '2026-11-09';
begin
  if uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  if exists (select 1 from phases where user_id = uid) then
    return false; -- já semeado
  end if;

  insert into phases (user_id, name, level, week_start, week_end, start_date, end_date, goals) values
    (uid, 'Fundamentos A1', 'A1', 1, 4,
      plan_start, plan_start + (4*7 - 1),
      array['Alfabeto, pronúncia e números','Presente dos verbos essenciais','Apresentar-se e vocabulário do dia a dia']),
    (uid, 'Consolidação A2', 'A2', 5, 10,
      plan_start + 4*7, plan_start + (10*7 - 1),
      array['Passé composé e imparfait','Pronomes e preposições','Compreender textos e áudios curtos']),
    (uid, 'Construção B1', 'B1', 11, 18,
      plan_start + 10*7, plan_start + (18*7 - 1),
      array['Subjonctif e condicional','Argumentar e expressar opinião','Escrita de e-mails e textos de 120 palavras']),
    (uid, 'B2 / Preparação TCF', 'B2', 19, 26,
      plan_start + 18*7, plan_start + (26*7 - 1),
      array['Simulados completos cronometrados','Escrita e fala no formato TCF','Revisão dos erros recorrentes']);

  insert into materials (user_id, title, type, level) values
    (uid, 'Grammaire progressive du français A2-B1', 'gramatica', 'A2'),
    (uid, 'Les 500 exercices A1', 'exercicios', 'A1'),
    (uid, 'Les 500 exercices A2', 'exercicios', 'A2'),
    (uid, 'Les 500 exercices B1', 'exercicios', 'B1'),
    (uid, 'Défi 1', 'metodo', 'A1'),
    (uid, 'Défi 2', 'metodo', 'A2'),
    (uid, 'TV5Monde (áudios)', 'audio', null),
    (uid, 'RFI (áudios)', 'audio', null),
    (uid, 'Simulados TCF', 'simulado', 'B2');

  -- Checkpoints: data = domingo da semana indicada
  insert into checkpoints (user_id, week, date, type, title) values
    (uid, 4,  plan_start + (4*7 - 1),  'fim_de_fase', 'Teste de fim da fase A1'),
    (uid, 10, plan_start + (10*7 - 1), 'fim_de_fase', 'Teste de fim da fase A2'),
    (uid, 14, plan_start + (14*7 - 1), 'inscricao',   'Inscrição no TCF Canada'),
    (uid, 18, plan_start + (18*7 - 1), 'fim_de_fase', 'Teste de fim da fase B1'),
    (uid, 20, plan_start + (20*7 - 1), 'simulado',    'Simulado TCF 1'),
    (uid, 22, plan_start + (22*7 - 1), 'simulado',    'Simulado TCF 2'),
    (uid, 24, plan_start + (24*7 - 1), 'simulado',    'Simulado TCF 3'),
    (uid, 26, plan_start + (26*7 - 1), 'simulado',    'Simulado TCF 4');

  -- Rotina semanal padrão: 20 h (1200 min)
  insert into weekly_blocks (user_id, weekday, position, skill, duration_min, description)
  select uid, d, 1, 'grammaire'::skill, 60, 'Grammaire progressive' from generate_series(1,5) d
  union all
  select uid, d, 2, 'vocabulaire'::skill, 30, 'Vocabulário e flashcards' from generate_series(1,5) d
  union all
  select uid, d, 3, 'CO'::skill, 60, 'TV5Monde / RFI' from generate_series(1,5) d;

  insert into weekly_blocks (user_id, weekday, position, skill, duration_min, description) values
    (uid, 6, 1, 'CE', 90, 'Leitura de textos e questões'),
    (uid, 6, 2, 'EE', 60, 'Redação com correção'),
    (uid, 6, 3, 'EO', 60, 'Fala gravada e autoavaliação'),
    (uid, 7, 1, 'CE', 60, 'Leitura de revisão'),
    (uid, 7, 2, 'CO', 60, 'Áudio longo com transcrição'),
    (uid, 7, 3, 'EE', 60, 'Reescrita dos textos'),
    (uid, 7, 4, 'EO', 60, 'Conversação / shadowing');

  return true;
end;
$$;

grant execute on function public.seed_user_data() to authenticated;
