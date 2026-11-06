import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Destinos internos permitidos após a confirmação (evita redirecionamento aberto). */
const ALLOWED_NEXT = new Set(["/", "/email-confirmado", "/redefinir-senha"]);
const OTP_TYPES = new Set<EmailOtpType>(["signup", "email", "recovery", "invite", "magiclink", "email_change"]);

/**
 * Link do e-mail de confirmação: /auth/confirm?token_hash=…&type=email&next=/email-confirmado
 * Valida o token no Supabase e abre a sessão. Diferente do fluxo com `code`, funciona mesmo
 * se o e-mail for aberto em outro navegador ou aparelho.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/email-confirmado";
  const target = ALLOWED_NEXT.has(next) ? next : "/email-confirmado";

  if (tokenHash && type && OTP_TYPES.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${target}`);
  }
  // Link expirado, já usado ou incompleto: oferece reenviar.
  return NextResponse.redirect(`${origin}/confirmar-email?erro=link`);
}
