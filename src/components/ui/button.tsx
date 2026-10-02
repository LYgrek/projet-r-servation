import Link, { type LinkProps } from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost"
  | "danger"
  | "danger-ghost"
  | "inverse"
  | "light"
  | "ghost-light";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Zone de survol invisible, un peu plus grande que le bouton (pseudo-élément
 * `::before`). Sans elle, quand la souris est sur le bord, le bouton qui se
 * soulève « s'échappe » de sous le curseur, perd le survol, revient… et vibre.
 */
const stableHitArea = "relative before:absolute before:-inset-1.5 before:rounded-[inherit] before:content-['']";

/**
 * Les boutons « pleins » ont un contour encre et une ombre décalée :
 * au survol ils se soulèvent, au clic ils s'enfoncent dans la page.
 */
const pressable = cn(
  stableHitArea,
  "border-2 border-ink shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
);

const variants: Record<ButtonVariant, string> = {
  primary: cn(pressable, "bg-brand-700 text-card hover:bg-brand-800"),
  secondary: cn(pressable, "bg-card text-ink hover:bg-paper-deep"),
  accent: cn(pressable, "bg-lime text-ink"),
  ghost: "text-ink-muted hover:bg-ink/5 hover:text-ink",
  danger: cn(pressable, "bg-sun text-ink"),
  "danger-ghost": "text-red-700 hover:bg-red-50",
  // Texte vert sur fond blanc, couleurs inversées au survol.
  inverse: cn(pressable, "bg-card text-brand-800 hover:bg-brand-700 hover:text-card"),
  // Variantes pour fond sombre : texte vert sur fond blanc, inversé au survol.
  light: cn(
    stableHitArea,
    "border-2 border-card bg-card text-brand-800 shadow-[4px_4px_0_0_var(--color-lime)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-brand-700 hover:text-card hover:shadow-[7px_7px_0_0_var(--color-lime)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  ),
  "ghost-light": "text-card ring-2 ring-card/40 hover:bg-card/10 hover:ring-card",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
};

/** Classes d'un bouton : réutilisables sur un `<button>` comme sur un `<Link>`. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap cursor-pointer",
    "transition-[translate,box-shadow,background-color,color] duration-150",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Bouton standard de l'application. */
export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}

type LinkButtonProps<T extends string> = LinkProps<T> &
  Omit<ComponentProps<"a">, keyof LinkProps<T>> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  };

/**
 * Lien de navigation ayant l'apparence d'un bouton.
 * Générique pour conserver la vérification des routes typées (`typedRoutes`).
 */
export function LinkButton<T extends string>({ variant, size, className, ...props }: LinkButtonProps<T>) {
  return <Link<T> className={buttonStyles({ variant, size, className })} {...props} />;
}
