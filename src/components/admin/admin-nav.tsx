"use client";

import { CalendarRange, LayoutDashboard, Tags, Ticket, Users } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS: { href: Route; label: string; icon: typeof LayoutDashboard }[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/activites", label: "Activités", icon: CalendarRange },
  { href: "/admin/types", label: "Types d'activité", icon: Tags },
  { href: "/admin/reservations", label: "Réservations", icon: Ticket },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
];

/** Navigation latérale de l'espace d'administration. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-bold transition-colors",
              active ? "border-2 border-ink bg-lime text-ink shadow-hard-sm" : "border-2 border-transparent text-ink-muted hover:bg-card hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
