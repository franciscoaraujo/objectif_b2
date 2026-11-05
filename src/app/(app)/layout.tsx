import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavigationBar, NavigationDrawer, NavigationRail } from "@/components/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");

  // Seed no primeiro login (função idempotente no banco).
  const { count } = await supabase.from("phases").select("id", { count: "exact", head: true });
  if (count === 0) await supabase.rpc("seed_user_data");

  return (
    <div className="flex min-h-dvh">
      <NavigationRail />
      <NavigationDrawer email={data.user.email ?? ""} />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-28 md:px-8 md:pt-8 md:pb-10">
        <div className="mx-auto w-full max-w-5xl">{children}</div>
      </main>
      <NavigationBar />
    </div>
  );
}
