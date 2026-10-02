import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration · Parc Évasion" },
  description: "Espace d'administration du Parc Évasion.",
  robots: { index: false, follow: false },
};

/**
 * Gabarit de l'espace d'administration.
 * `requireAdmin()` bloque l'accès aux utilisateurs non administrateurs pour
 * TOUTES les pages de /admin (chaque action serveur revérifie aussi le rôle).
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden px-3 text-xs font-semibold tracking-wide text-ink-subtle uppercase lg:block">
            Administration
          </p>
          <AdminNav />
          <p className="mt-6 hidden px-3 text-xs text-ink-subtle lg:block">
            Connecté en tant que
            <br />
            <strong className="text-ink-muted">
              {admin.prenom} {admin.nom}
            </strong>
          </p>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
