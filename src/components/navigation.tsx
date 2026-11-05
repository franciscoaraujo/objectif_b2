"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";
import { Flags, MapleLeaf } from "./flags";
import { signOut } from "@/app/login/actions";
import { ALL_ITEMS, type NavItem } from "@/lib/nav";

const BAR_ITEMS: NavItem[] = [
  ALL_ITEMS[0],
  ALL_ITEMS[1],
  ALL_ITEMS[3],
  ALL_ITEMS[4],
  { href: "/mais", label: "Mais", icon: "apps" },
];
const MORE_HREFS = ["/mais", "/livros", "/estatisticas", "/erros", "/vocabulario"];

/* Mesmas cores da página de vendas */
const NAVY = "bg-[#0b1d45]";

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

function Logo() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D52B1E] shadow-md shadow-black/30">
      <MapleLeaf className="h-5 w-5 text-white" />
    </span>
  );
}

/** Faixa vermelho-branco-vermelho (bandeira do Canadá). */
export function FlagStripe({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-1 ${className}`}>
      <span className="flex-1 bg-[#D52B1E]" />
      <span className="flex-[2] bg-white" />
      <span className="flex-1 bg-[#D52B1E]" />
    </div>
  );
}

/** Celular: barra superior com a marca. */
export function MobileTopBar() {
  return (
    <header className={`sticky top-0 z-30 ${NAVY} text-white md:hidden`}>
      <FlagStripe />
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold">
          <Logo />
          Objectif B2
        </Link>
        <Flags className="h-4" />
      </div>
    </header>
  );
}

/** Celular: navigation bar inferior com 5 destinos. */
export function NavigationBar() {
  const pathname = usePathname();
  const isActive = useActive();
  return (
    <nav
      aria-label="Navegação principal"
      className={`fixed inset-x-0 bottom-0 z-30 flex h-20 items-stretch ${NAVY} pb-[env(safe-area-inset-bottom)] text-white shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.4)] md:hidden`}
    >
      {BAR_ITEMS.map((item) => {
        const active =
          item.href === "/mais" ? MORE_HREFS.some((h) => pathname.startsWith(h)) : isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="group flex flex-1 flex-col items-center justify-center gap-1 pt-3 pb-4 outline-none"
          >
            <span
              className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors group-focus-visible:outline-2 group-focus-visible:outline-white ${
                active ? "bg-[#D52B1E] text-white" : "text-white/70"
              }`}
            >
              <Icon name={item.icon} fill={active} />
            </span>
            <span className={`type-label-medium ${active ? "text-white" : "text-white/70"}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Tablet: navigation rail. */
export function NavigationRail() {
  const isActive = useActive();
  return (
    <nav
      aria-label="Navegação principal"
      className={`sticky top-0 hidden h-dvh w-24 shrink-0 flex-col items-center gap-3 ${NAVY} pb-6 text-white md:flex xl:hidden`}
    >
      <FlagStripe className="w-full" />
      <Link href="/" aria-label="Objectif B2 — início" className="mt-4 mb-2">
        <Logo />
      </Link>
      {ALL_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="group flex w-full flex-col items-center gap-1 outline-none"
          >
            <span
              className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors group-focus-visible:outline-2 group-focus-visible:outline-white ${
                active ? "bg-[#D52B1E] text-white" : "text-white/70 group-hover:bg-white/10 group-hover:text-white"
              }`}
            >
              <Icon name={item.icon} fill={active} />
            </span>
            <span className={`px-1 text-center type-label-small ${active ? "text-white" : "text-white/70"}`}>
              {item.label === "Caderno de erros" ? "Erros" : item.label}
            </span>
          </Link>
        );
      })}
      <form action={signOut} className="mt-auto">
        <button
          type="submit"
          aria-label="Sair"
          title="Sair"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Icon name="logout" />
        </button>
      </form>
    </nav>
  );
}

/** Desktop: navigation drawer permanente. */
export function NavigationDrawer({ email }: { email: string }) {
  const isActive = useActive();
  return (
    <nav
      aria-label="Navegação principal"
      className={`sticky top-0 hidden h-dvh w-72 shrink-0 flex-col overflow-hidden ${NAVY} text-white xl:flex`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_40%_at_100%_0%,rgba(31,79,160,0.7),transparent),radial-gradient(70%_35%_at_0%_100%,rgba(213,43,30,0.3),transparent)]"
      />
      <MapleLeaf className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 -rotate-12 text-white/[0.04]" />
      <FlagStripe className="relative" />

      <div className="relative flex flex-1 flex-col px-3 pt-6 pb-5">
        <Link href="/" className="flex items-center gap-3 px-4 pb-2">
          <Logo />
          <span>
            <span className="block text-[19px] leading-6 font-semibold">Objectif B2</span>
            <span className="block text-[12px] text-white/60">TCF Canada · meta NCLC 7+</span>
          </span>
        </Link>
        <div className="px-4 pt-2 pb-6">
          <Flags className="h-4" />
        </div>

        <ul className="flex flex-col gap-1">
          {ALL_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-12 items-center gap-3 rounded-full px-4 type-label-large outline-none transition-colors focus-visible:outline-2 focus-visible:outline-white ${
                    active
                      ? "bg-white/12 text-white before:absolute before:top-1/2 before:left-0 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-[#D52B1E]"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon name={item.icon} fill={active} className={active ? "text-[#ff7b70]" : ""} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="truncate text-white/70 type-body-small" title={email}>
            {email}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 flex h-9 items-center gap-2 rounded-full pr-3 text-[#ff7b70] type-label-large hover:underline"
            >
              <Icon name="logout" size={20} />
              Sair
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
