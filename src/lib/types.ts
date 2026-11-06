export type Skill = "grammaire" | "vocabulaire" | "CO" | "CE" | "EE" | "EO";
export type CefrLevel = "A1" | "A2" | "B1" | "B2";
export type MaterialType = "gramatica" | "exercicios" | "metodo" | "audio" | "simulado";
export type ChapterStatus = "nao_iniciado" | "em_andamento" | "concluido";
export type CheckpointType = "fim_de_fase" | "inscricao" | "simulado";
export type ErrorCategory =
  | "gramatica"
  | "conjugacao"
  | "vocabulario"
  | "ortografia"
  | "preposicao"
  | "pronuncia"
  | "compreensao"
  | "outro";
export type WordGender = "m" | "f" | "m_f" | "nenhum";

export type Phase = {
  id: string;
  name: string;
  level: CefrLevel;
  week_start: number;
  week_end: number;
  start_date: string;
  end_date: string;
  goals: string[];
};
export type Material = { id: string; title: string; type: MaterialType; level: CefrLevel | null };
export type Chapter = {
  id: string;
  material_id: string;
  number: number;
  title: string;
  page_start: number | null;
  page_end: number | null;
  status: ChapterStatus;
  completed_at: string | null;
};
export type StudySession = {
  id: string;
  date: string;
  duration_min: number;
  skill: Skill;
  material_id: string | null;
  chapter_id: string | null;
  pages: string | null;
  notes: string | null;
};
export type WeeklyBlock = {
  id: string;
  weekday: number;
  position: number;
  skill: Skill;
  duration_min: number;
  description: string;
};
export type BlockCompletion = { id: string; block_id: string; week_start_date: string; done: boolean };
export type Checkpoint = {
  id: string;
  week: number;
  date: string;
  type: CheckpointType;
  title: string;
  done: boolean;
  done_at: string | null;
};
export type MockExam = {
  id: string;
  checkpoint_id: string | null;
  date: string;
  co: number | null;
  ce: number | null;
  ee: number | null;
  eo: number | null;
  notes: string | null;
};
export type ErrorEntry = {
  id: string;
  category: ErrorCategory;
  wrong: string;
  correct: string;
  explanation: string | null;
  reviewed: boolean;
  created_at: string;
};
export type VocabWord = {
  id: string;
  word: string;
  gender: WordGender;
  translation: string;
  example: string | null;
  ease: number;
  repetitions: number;
  interval_days: number;
  next_review_at: string;
};

export type Profile = {
  user_id: string;
  plan_start: string;
  exam_date: string | null;
  weekly_goal_min: number;
};
