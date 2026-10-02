import { ArrowUpRight, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Marquee } from "@/components/motion/marquee";

/** Pied de page : grand bandeau défilant puis informations pratiques. */
export function Footer() {
  return (
    <footer className="mt-32 overflow-hidden border-t-2 border-ink bg-brand-900 text-card">
      <Marquee className="border-b-2 border-ink bg-brand-950 py-6" speed={50}>
        {["Grimpe", "Pagaie", "Respire", "Explore", "Recommence"].map((word) => (
          <span key={word} className="flex items-center text-6xl font-extrabold tracking-tight uppercase md:text-8xl">
            <span className="px-6">{word}</span>
            <em className="font-serif text-lime normal-case" aria-hidden>
              ✳
            </em>
          </span>
        ))}
      </Marquee>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-4xl leading-none font-extrabold tracking-tight">
            Parc <em className="font-serif font-normal text-lime">Évasion</em>
          </p>
          <p className="mt-4 max-w-xs text-card/70">
            Accrobranche, escalade, nautisme et ateliers nature, au cœur de la forêt depuis 1998.
          </p>
        </div>
        <div className="space-y-3 text-sm text-card/80">
          <p className="mb-4 text-xs font-extrabold tracking-widest text-lime uppercase">Infos pratiques</p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4" aria-hidden /> Route de la Forêt, 74000 Annecy
          </p>
          <p className="flex items-center gap-2">
            <Clock className="size-4" aria-hidden /> Tous les jours, 9h – 20h
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4" aria-hidden /> 04 50 00 00 00
          </p>
        </div>
        <nav aria-label="Liens du pied de page" className="flex flex-col gap-3 text-sm">
          <p className="mb-1 text-xs font-extrabold tracking-widest text-lime uppercase">Explorer</p>
          {(
            [
              { href: "/activites", label: "Toutes les activités" },
              { href: "/reservations", label: "Mes réservations" },
              { href: "/profil", label: "Mon compte" },
            ] as const
          ).map((link) => (
            <Link key={link.href} href={link.href} className="group flex items-center gap-1 font-bold text-card/90 hover:text-lime">
              {link.label}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t-2 border-dashed border-card/15 py-6 text-center text-xs text-card/50">
        © {new Date().getFullYear()} Parc Évasion — Projet Next.js
      </p>
    </footer>
  );
}
