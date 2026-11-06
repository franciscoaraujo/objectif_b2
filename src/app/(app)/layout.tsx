import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/profile";
import { MobileTopBar, NavigationBar, NavigationDrawer, NavigationRail } from "@/components/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  // Sem perfil (primeiro acesso), redireciona para /comecar.
  await getProfile();

  return (
    <div className="flex min-h-dvh">
      <NavigationRail />
      <NavigationDrawer email={data.user.email ?? ""} />
      <div className="min-w-0 flex-1">
        <MobileTopBar />
        <main className="px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-12">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
      <NavigationBar />
    </div>
  );
}

