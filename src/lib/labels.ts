import type {
  ChapterStatus,
  CheckpointType,
  ErrorCategory,
  MaterialType,
  Skill,
  WordGender,
} from "./types";

export const SKILLS: Skill[] = ["grammaire", "vocabulaire", "CO", "CE", "EE", "EO"];

export const SKILL_LABEL: Record<Skill, string> = {
  grammaire: "Gramática",
  vocabulaire: "Vocabulário",
  CO: "Compreensão oral",
  CE: "Leitura",
  EE: "Escrita",
  EO: "Fala",
};
export const SKILL_SHORT: Record<Skill, string> = {
  grammaire: "Gram.",
  vocabulaire: "Vocab.",
  CO: "CO",
  CE: "CE",
  EE: "EE",
  EO: "EO",
};
export const SKILL_ICON: Record<Skill, string> = {
  grammaire: "menu_book",
  vocabulaire: "translate",
  CO: "headphones",
  CE: "article",
  EE: "edit_note",
  EO: "record_voice_over",
};
/** Cores de gráfico derivadas da paleta M3 (primária, secundária, terciária e variações). */
export const SKILL_COLOR: Record<Skill, string> = {
  grammaire: "#1F4FA0",
  vocabulaire: "#6B5E8F",
  CO: "#00696B",
  CE: "#8A5100",
  EE: "#A23B5C",
  EO: "#4B6A2A",
};

export const MATERIAL_TYPE_LABEL: Record<MaterialType, string> = {
  gramatica: "Gramática",
  exercicios: "Exercícios",
  metodo: "Método",
  audio: "Áudio",
  simulado: "Simulado",
};
export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};
export const CHECKPOINT_TYPE_LABEL: Record<CheckpointType, string> = {
  fim_de_fase: "Fim de fase",
  inscricao: "Inscrição",
  simulado: "Simulado",
};
export const ERROR_CATEGORY_LABEL: Record<ErrorCategory, string> = {
  gramatica: "Gramática",
  conjugacao: "Conjugação",
  vocabulario: "Vocabulário",
  ortografia: "Ortografia",
  preposicao: "Preposição",
  pronuncia: "Pronúncia",
  compreensao: "Compreensão",
  outro: "Outro",
};
export const GENDER_LABEL: Record<WordGender, string> = {
  m: "masculino",
  f: "feminino",
  m_f: "masc./fem.",
  nenhum: "—",
};
export const GENDER_ARTICLE: Record<WordGender, string> = { m: "le", f: "la", m_f: "le/la", nenhum: "" };

export const WEEKDAY_LABEL = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const WEEKDAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
