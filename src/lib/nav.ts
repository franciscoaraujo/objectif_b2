export type NavItem = { href: string; label: string; icon: string };

export const ALL_ITEMS: NavItem[] = [
  { href: "/", label: "Início", icon: "home" },
  { href: "/sessoes", label: "Sessões", icon: "timer" },
  { href: "/livros", label: "Livros", icon: "auto_stories" },
  { href: "/rotina", label: "Rotina", icon: "calendar_view_week" },
  { href: "/checkpoints", label: "Provas", icon: "flag" },
  { href: "/estatisticas", label: "Estatísticas", icon: "monitoring" },
  { href: "/erros", label: "Caderno de erros", icon: "spellcheck" },
  { href: "/vocabulario", label: "Vocabulário", icon: "style" },
  { href: "/perfil", label: "Meu plano", icon: "tune" },
];
