/**
 * Petits composants d'interface : badge (façon autocollant), carte, alerte,
 * état vide et en-tête de page.
 */
import { AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SplitTitle } from "@/components/motion/split-title";
import { cn } from "@/lib/cn";

/* ---------- Badge ---------- */

export type BadgeTone = "neutral" | "brand" | "amber" | "red" | "blue" | "lime";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-paper-deep text-ink",
  brand: "bg-brand-100 text-brand-900",
  amber: "bg-amber-200 text-amber-950",
  red: "bg-sun text-ink",
  blue: "bg-sky-200 text-sky-950",
  lime: "bg-lime text-ink",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------- Carte ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-3xl border-2 border-ink bg-card shadow-hard", className)}>{children}</div>;
}

/* ---------- Alerte (message global d'un formulaire) ---------- */

export function Alert({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border-2 border-ink px-4 py-3 text-sm font-bold",
        tone === "success" ? "bg-lime" : "bg-sun-soft text-red-900",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/* ---------- État vide ---------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-ink/40 bg-card/60 px-6 py-16 text-center">
      <div className="mb-5 grid size-16 -rotate-6 place-items-center rounded-2xl border-2 border-ink bg-lime shadow-hard">
        <Icon className="size-8" aria-hidden />
      </div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      {description && <p className="mt-2 max-w-md text-ink-muted">{description}</p>}
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}

/* ---------- En-tête de page ---------- */

/**
 * En-tête éditorial : petite étiquette, grand titre animé lettre par lettre.
 * `accent` est ajouté à la fin du titre en italique serif.
 */
export function PageHeader({
  title,
  accent,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  accent?: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lime px-3 py-0.5 text-xs font-extrabold tracking-widest uppercase">
            <span aria-hidden>✳</span> {eyebrow}
          </p>
        )}
        <SplitTitle className="text-4xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-6xl">
          {title}
          {accent && (
            <>
              {" "}
              <em className="font-serif font-normal text-brand-700">{accent}</em>
            </>
          )}
        </SplitTitle>
        {description && <div className="mt-4 max-w-2xl text-lg text-ink-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

/** Pictogramme dans un carré « autocollant », légèrement penché. */
export function IconSticker({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      className={cn("grid size-11 shrink-0 -rotate-3 place-items-center rounded-xl border-2 border-ink bg-lime", className)}
      aria-hidden
    >
      <Icon className="size-5" />
    </span>
  );
}
