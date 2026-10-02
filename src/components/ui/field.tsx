import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Style commun des champs de saisie (input, select, textarea). */
export const controlStyles = cn(
  "block w-full rounded-2xl border-2 border-ink bg-card px-4 text-[15px] text-ink transition",
  "placeholder:text-ink-subtle/70",
  "focus:shadow-hard focus:outline-none focus:-translate-x-px focus:-translate-y-px",
  "aria-invalid:border-red-600 aria-invalid:bg-red-50/60",
  "disabled:cursor-not-allowed disabled:bg-paper-deep",
);

interface FieldProps {
  /** Identifiant du champ : relie le label, l'aide et le message d'erreur. */
  id: string;
  label: string;
  /** Messages d'erreur de validation (seul le premier est affiché). */
  errors?: string[];
  hint?: string;
  className?: string;
  children: (aria: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}

/**
 * Enveloppe accessible d'un champ de formulaire : label, aide et erreur.
 * Les attributs ARIA sont transmis au contrôle via une fonction enfant.
 */
export function Field({ id, label, errors, hint, className, children }: FieldProps) {
  const error = errors?.[0];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs font-bold text-red-700" role="alert">
          <span aria-hidden>✶</span> {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlStyles, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlStyles, "min-h-36 py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlStyles, "h-12 pr-9", className)} {...props} />;
}
