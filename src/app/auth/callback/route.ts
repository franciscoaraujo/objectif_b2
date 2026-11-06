import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Destinos internos permitidos após o link do e-mail (evita redirecionamento aberto). */
const ALLOWED_NEXT = new Set(["/", "/redefinir-senha", "/email-confirmado"]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const target = ALLOWED_NEXT.has(next) ? next : "/";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${target}`);
  }
  return NextResponse.redirect(
    target === "/redefinir-senha" ? `${origin}/login?erro=link` : `${origin}/confirmar-email?erro=link`,
  );
}
