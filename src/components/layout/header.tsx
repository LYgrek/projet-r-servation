"use client";

import { CalendarCheck, ChevronDown, LayoutDashboard, LogOut, Menu, TreePine, UserRound, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/actions/auth";
import { LinkButton } from "@/components/ui/button";
import type { PublicUser } from "@/db/schema";
import { cn } from "@/lib/cn";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

interface NavItem {
  href: Route;
  label: string;
}

/** Liens de navigation principaux selon l'état de connexion et le rôle. */
function getNavItems(user: PublicUser | null): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Accueil" },
    { href: "/activites", label: "Activités" },
  ];
  if (user) items.push({ href: "/reservations", label: "Mes billets" });
  if (user?.role === "admin") items.push({ href: "/admin", label: "Admin" });
  return items;
}

/** Un lien est actif si l'URL courante est la sienne ou une sous-page. */
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Initiales de l'utilisateur pour l'avatar. */
function initials(user: PublicUser): string {
  return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
}

/**
 * En-tête du site : barre flottante qui se cache quand on descend dans la
 * page et réapparaît quand on remonte. Une pastille glisse sous le lien
 * actif (ou survolé).
 */
export function Header({ user }: { user: PublicUser | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getNavItems(user);
  const headerRef = useRef<HTMLElement>(null);

  // Ferme le menu mobile à chaque changement de page.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Masque la barre au défilement vers le bas, la réaffiche vers le haut.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const hide = gsap.to(headerRef.current, { yPercent: -130, duration: 0.35, ease: "power2.out", paused: true });
        ScrollTrigger.create({
          start: 120,
          end: "max",
          onUpdate: (self) => (self.direction === 1 ? hide.play() : hide.reverse()),
          onLeaveBack: () => hide.reverse(),
        });
      });
    },
    { scope: headerRef },
  );

  return (
    <header ref={headerRef} className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 rounded-full border-2 border-ink bg-card/90 pr-2 pl-2 shadow-hard backdrop-blur-md">
        <Link href="/" className="group flex items-center gap-2.5 pr-2 font-extrabold text-ink" aria-label="Parc Évasion — accueil">
          <span className="grid size-11 place-items-center rounded-full border-2 border-ink bg-lime">
            <TreePine className="size-5 origin-bottom group-hover:animate-sway" aria-hidden />
          </span>
          <span className="text-lg leading-none tracking-tight">
            Parc <em className="font-serif text-xl font-normal text-brand-700">Évasion</em>
          </span>
        </Link>

        <SlidingNav items={navItems} pathname={pathname} />

        <div className="ml-auto hidden items-center gap-2 md:flex">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <LinkButton href="/connexion" variant="ghost" size="sm">
                Connexion
              </LinkButton>
              <LinkButton href="/inscription" variant="accent" size="sm">
                Créer un compte
              </LinkButton>
            </>
          )}
        </div>

        <button
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-full border-2 border-ink bg-lime md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && <MobileMenu user={user} items={navItems} pathname={pathname} />}
    </header>
  );
}

/** Navigation bureau avec une pastille qui glisse sous le lien actif ou survolé. */
function SlidingNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  /** Déplace la pastille sous un lien (ou la masque si aucun). */
  const moveTo = (link: HTMLElement | null | undefined, instant = false) => {
    const pill = pillRef.current;
    if (!pill) return;
    if (!link) {
      gsap.to(pill, { autoAlpha: 0, duration: 0.2 });
      return;
    }
    gsap.to(pill, {
      x: link.offsetLeft,
      width: link.offsetWidth,
      autoAlpha: 1,
      duration: instant ? 0 : 0.45,
      ease: "back.out(1.6)",
    });
  };

  const activeLink = () => navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');

  // Replace la pastille sur le lien actif à chaque changement de page.
  useGSAP(() => moveTo(activeLink(), true), { dependencies: [pathname, items.length], scope: navRef });

  return (
    <nav
      ref={navRef}
      aria-label="Navigation principale"
      className="relative hidden flex-1 items-center md:flex"
      onPointerLeave={() => moveTo(activeLink())}
    >
      <span
        ref={pillRef}
        className="invisible absolute top-1/2 left-0 h-10 -translate-y-1/2 rounded-full border-2 border-ink bg-lime"
        aria-hidden
      />
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          onPointerEnter={(event) => moveTo(event.currentTarget)}
          className="relative z-10 rounded-full px-4 py-2 text-sm font-bold text-ink"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Menu plein écran pour mobile, dont les liens arrivent en cascade. */
function MobileMenu({ user, items, pathname }: { user: PublicUser | null; items: NavItem[]; pathname: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(ref.current, { yPercent: -8, autoAlpha: 0, duration: 0.3, ease: "power2.out" });
        gsap.from("[data-menu-item]", { x: -30, autoAlpha: 0, stagger: 0.06, duration: 0.5, ease: "power3.out", delay: 0.1 });
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      id="mobile-menu"
      className="mx-auto mt-2 max-w-6xl rounded-3xl border-2 border-ink bg-card p-4 shadow-hard md:hidden"
    >
      <nav aria-label="Navigation mobile" className="flex flex-col">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-menu-item
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            className={cn(
              "rounded-2xl px-4 py-3 text-2xl font-extrabold",
              isActive(pathname, item.href) ? "bg-lime" : "text-ink",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3" data-menu-item>
        {user ? (
          <div className="flex flex-col gap-1">
            <p className="px-4 pb-1 text-sm text-ink-subtle">
              Connecté en tant que <strong className="text-ink">{user.prenom} {user.nom}</strong>
            </p>
            <Link href="/profil" className="rounded-2xl px-4 py-2.5 font-bold">
              Mon profil
            </Link>
            <form action={logout}>
              <button type="submit" className="w-full rounded-2xl px-4 py-2.5 text-left font-bold text-red-700">
                Se déconnecter
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <LinkButton href="/connexion" variant="secondary">
              Connexion
            </LinkButton>
            <LinkButton href="/inscription" variant="accent">
              S&apos;inscrire
            </LinkButton>
          </div>
        )}
      </div>
    </div>
  );
}

/** Menu déroulant de l'utilisateur connecté (bureau). */
function UserMenu({ user }: { user: PublicUser }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic extérieur ou à la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Petite entrée « ressort » du panneau.
  useGSAP(
    () => {
      if (!open) return;
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from(panelRef.current, { y: -10, scale: 0.94, autoAlpha: 0, duration: 0.35, ease: "back.out(2)", transformOrigin: "top right" });
      });
    },
    { dependencies: [open] },
  );

  const itemClass = "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-ink hover:bg-lime";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border-2 border-ink bg-card py-1 pr-3 pl-1 text-sm font-bold transition hover:bg-paper-deep"
      >
        <span className="grid size-8 place-items-center rounded-full border-2 border-ink bg-sun text-xs font-extrabold">
          {initials(user)}
        </span>
        <span className="max-w-32 truncate">{user.prenom}</span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          className="absolute right-0 mt-3 w-64 rounded-3xl border-2 border-ink bg-card p-2 shadow-hard-lg"
        >
          <div className="border-b-2 border-dashed border-ink/20 px-3 pt-1 pb-3">
            <p className="truncate font-extrabold">
              {user.prenom} {user.nom}
            </p>
            <p className="truncate text-sm text-ink-subtle">{user.email}</p>
          </div>
          <div className="py-1">
            <Link href="/profil" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <UserRound className="size-4" aria-hidden /> Mon profil
            </Link>
            <Link href="/reservations" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              <CalendarCheck className="size-4" aria-hidden /> Mes réservations
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
                <LayoutDashboard className="size-4" aria-hidden /> Administration
              </Link>
            )}
          </div>
          <form action={logout} className="border-t-2 border-dashed border-ink/20 pt-1">
            <button type="submit" role="menuitem" className={cn(itemClass, "text-red-700 hover:bg-sun-soft")}>
              <LogOut className="size-4" aria-hidden /> Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
