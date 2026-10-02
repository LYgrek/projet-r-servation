"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "./button";

interface SubmitButtonProps {
  children: React.ReactNode;
  /** Texte affiché pendant l'envoi du formulaire. */
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
}

/**
 * Bouton de soumission qui se désactive et affiche un indicateur de
 * chargement pendant l'exécution de la Server Action du formulaire parent.
 */
export function SubmitButton({ children, pendingLabel, variant, size, className, disabled }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
