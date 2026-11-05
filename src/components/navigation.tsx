"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";
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

function useActive() {
  const pathname = usePathname();
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

/** Celular: navigation bar inferior com 5 destinos. */
export function NavigationBar() {
  const pathname = usePathname();
  const isActive = useActive();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-30 flex h-20 items-stretch bg-surface-container pb-[env(safe-area-inset-bottom)] md:hidden"
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
              className={`flex h-8 w-16 items-center justify-center rounded-full transition-colors group-focus-visible:outline-2 group-focus-visible:outline-primary ${
                active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
              }`}
            >
              <Icon name={item.icon} fill={active} />
            </span>
            <span
              className={`type-label-medium ${active ? "text-on-surface" : "text-on-surface-variant"}`}
            >
              {item.label}
            </span>
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
      className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center gap-3 bg-surface py-6 md:flex xl:hidden"
    >
      <span className="mb-2 type-title-medium text-primary" aria-label="Objectif B2">
        B2
      </span>
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
              className={`flex h-8 w-14 items-center justify-center rounded-full group-focus-visible:outline-2 group-focus-visible:outline-primary ${
                active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant group-hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} fill={active} />
            </span>
            <span className={`px-1 text-center type-label-small ${active ? "text-on-surface" : "text-on-surface-variant"}`}>
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
          className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"
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
      className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col bg-surface-container-low px-3 py-6 xl:flex"
    >
      <div className="px-4 pb-6">
        <p className="type-title-large text-primary">Objectif B2</p>
        <p className="text-on-surface-variant type-body-small">TCF Canada · maio/2027</p>
      </div>
      <ul className="flex flex-col gap-1">
        {ALL_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 items-center gap-3 rounded-full px-4 type-label-large outline-none focus-visible:outline-2 focus-visible:outline-primary ${
                  active
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <Icon name={item.icon} fill={active} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto border-t border-outline-variant px-4 pt-4">
        <p className="truncate text-on-surface-variant type-body-small" title={email}>
          {email}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 flex h-10 items-center gap-2 rounded-full pr-3 text-primary type-label-large hover:underline"
          >
            <Icon name="logout" size={20} />
            Sair
          </button>
        </form>
      </div>
    </nav>
  );
}

