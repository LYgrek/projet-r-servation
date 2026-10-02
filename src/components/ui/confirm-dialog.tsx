"use client";

import { AlertTriangle } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { Button } from "./button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  /** Contenu du pied de la boîte (généralement le formulaire de confirmation). */
  children: ReactNode;
}

/**
 * Boîte de dialogue modale de confirmation, basée sur l'élément natif
 * `<dialog>` (focus, touche Échap et arrière-plan gérés par le navigateur).
 * Elle apparaît avec un petit rebond animé par GSAP.
 */
export function ConfirmDialog({ open, onClose, title, description, children }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Synchronise l'état React avec l'ouverture native du dialogue.
  useGSAP(
    () => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (open && !dialog.open) {
        dialog.showModal();
        gsap.matchMedia().add(MOTION_OK, () => {
          gsap.fromTo(
            dialog,
            { scale: 0.85, rotate: -3, autoAlpha: 0 },
            { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" },
          );
        });
      }
      if (!open && dialog.open) dialog.close();
    },
    { dependencies: [open] },
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sur l'arrière-plan (l'élément dialog lui-même) ferme la boîte.
        if (event.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md overflow-visible rounded-3xl border-2 border-ink bg-card p-0 text-ink shadow-hard-lg backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
      aria-labelledby="confirm-title"
    >
      <div className="p-6">
        <div className="flex gap-4">
          <div className="grid size-12 shrink-0 rotate-6 place-items-center rounded-xl border-2 border-ink bg-sun">
            <AlertTriangle className="size-6" aria-hidden />
          </div>
          <div>
            <h2 id="confirm-title" className="text-xl leading-tight font-extrabold">
              {title}
            </h2>
            <div className="mt-2 text-sm text-ink-muted">{description}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 rounded-b-3xl border-t-2 border-ink bg-paper px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        {children}
      </div>
    </dialog>
  );
}
