"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Messages « flash » transmis dans l'URL après une redirection serveur
 * (ex. `/?erreur=acces-refuse`). Le message est affiché sous forme de toast
 * puis le paramètre est retiré de l'URL.
 */
const FLASH_MESSAGES: Record<string, Record<string, { type: "success" | "error"; text: string }>> = {
  erreur: {
    "acces-refuse": { type: "error", text: "Accès refusé : cette page est réservée aux administrateurs." },
  },
  compte: {
    supprime: { type: "success", text: "Votre compte a bien été supprimé. À bientôt !" },
  },
  succes: {
    creee: { type: "success", text: "L'activité a bien été créée." },
    modifiee: { type: "success", text: "L'activité a bien été modifiée." },
  },
};

export function FlashMessages() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let shown = false;

    for (const [key, messages] of Object.entries(FLASH_MESSAGES)) {
      const message = messages[params.get(key) ?? ""];
      if (message) {
        toast[message.type](message.text, { id: `${key}-${params.get(key)}` });
        params.delete(key);
        shown = true;
      }
    }

    if (shown) {
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}` as Route, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  return null;
}
