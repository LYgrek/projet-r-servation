import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { FlashMessages } from "@/components/layout/flash-messages";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/dal";
import "./globals.css";

/** Police principale : grotesque expressive (titres et texte). */
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
/** Police d'accent : serif italique pour quelques mots mis en valeur. */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/** Métadonnées par défaut ; chaque page définit son propre titre via le gabarit. */
export const metadata: Metadata = {
  title: {
    default: "Parc Évasion — Réservez vos activités en plein air",
    template: "%s · Parc Évasion",
  },
  description:
    "Accrobranche, escalade, canoë, paintball, ateliers nature : découvrez les activités du Parc Évasion et réservez votre place en ligne.",
  applicationName: "Parc Évasion",
  keywords: ["parc d'activités", "réservation", "accrobranche", "escalade", "loisirs"],
};

export const viewport: Viewport = {
  themeColor: "#f2ede1",
};

/**
 * Ajoute la classe `js` sur <html> avant l'affichage : les éléments animés
 * peuvent ainsi être masqués en attendant GSAP, sans rien cacher si le
 * JavaScript est désactivé.
 */
const enableJsClass = "document.documentElement.classList.add('js')";

/** Gabarit racine : en-tête, contenu de la page, pied de page et notifications. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html lang="fr" className={`${bricolage.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableJsClass }} />
      </head>
      <body className="flex min-h-dvh flex-col overflow-x-clip">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:border-2 focus:border-ink focus:bg-lime focus:px-4 focus:py-2 focus:font-bold"
        >
          Aller au contenu
        </a>
        <Header user={user} />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              border: "2px solid var(--color-ink)",
              borderRadius: "1.25rem",
              boxShadow: "4px 4px 0 0 var(--color-ink)",
              background: "var(--color-card)",
              color: "var(--color-ink)",
              fontFamily: "var(--font-bricolage)",
              fontWeight: 600,
            },
          }}
        />
        <Suspense fallback={null}>
          <FlashMessages />
        </Suspense>
      </body>
    </html>
  );
}
