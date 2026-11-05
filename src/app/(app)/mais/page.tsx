import Link from "next/link";
import { ALL_ITEMS } from "@/lib/nav";
import { PageHeader } from "@/components/layout-parts";
import { Icon } from "@/components/icon";
import { signOut } from "@/app/login/actions";

export const metadata = { title: "Mais" };

const MORE = ALL_ITEMS.filter((i) => ["/livros", "/estatisticas", "/erros", "/vocabulario"].includes(i.href));

export default function MorePage() {
  return (
    <>
      <PageHeader eyebrow="Objectif B2" title="Mais" />
      <ul className="divide-y divide-outline-variant overflow-hidden rounded-[24px] bg-surface-container-lowest ring-1 ring-outline-variant/60">
        {MORE.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="flex h-16 items-center gap-4 px-4 hover:bg-surface-container">
              <Icon name={i.icon} className="text-on-surface-variant" />
              <span className="flex-1 type-body-large">{i.label}</span>
              <Icon name="chevron_right" className="text-on-surface-variant" />
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut} className="mt-6">
        <button type="submit" className="flex h-12 items-center gap-2 rounded-full px-4 text-primary type-label-large hover:bg-surface-container-low">
          <Icon name="logout" size={20} />
          Sair da conta
        </button>
      </form>
    </>
  );
}
