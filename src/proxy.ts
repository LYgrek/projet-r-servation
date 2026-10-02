/**
 * Proxy Next.js (anciennement « middleware »).
 *
 * Vérification OPTIMISTE exécutée avant le rendu : on se contente de lire le
 * cookie de session, sans accès à la base de données.
 * Une page privée demandée sans session valide redirige vers /connexion,
 * en mémorisant la page demandée pour y revenir après connexion.
 *
 * La vérification du rôle administrateur est faite côté serveur dans
 * `src/lib/dal.ts` (`requireAdmin`), à partir des données à jour en base.
 */
import { NextResponse, type NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

/** Préfixes des routes nécessitant d'être connecté. */
const PROTECTED_PREFIXES = ["/profil", "/reservations", "/admin"];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (isProtected && !session) {
    const url = new URL("/connexion", request.url);
    url.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Le proxy ne s'exécute que sur les routes privées.
  matcher: ["/profil/:path*", "/reservations/:path*", "/admin/:path*"],
};
