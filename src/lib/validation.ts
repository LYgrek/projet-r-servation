/**
 * Schémas de validation (Zod) partagés par les Server Actions.
 *
 * Toute donnée provenant d'un formulaire est validée côté serveur, même si
 * les champs HTML ont déjà leurs propres contraintes (`required`, `min`...).
 */
import { z } from "zod";
import { parseParkDateTime } from "./dates";

/* ---------- Champs réutilisables ---------- */

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} est obligatoire.`)
    .max(50, `${label} ne doit pas dépasser 50 caractères.`);

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Adresse email invalide."));

/** Mot de passe : 8 caractères minimum, avec au moins une lettre et un chiffre. */
const passwordField = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .max(72, "Le mot de passe ne doit pas dépasser 72 caractères.")
  .regex(/[a-zA-Z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre.");

/** Identifiant numérique positif reçu sous forme de chaîne. */
export const idSchema = z.coerce.number().int().positive();

/* ---------- Utilisateurs ---------- */

export const signupSchema = z
  .object({
    prenom: nameField("Le prénom"),
    nom: nameField("Le nom"),
    email: emailField,
    motdepasse: passwordField,
    confirmation: z.string(),
  })
  .refine((data) => data.motdepasse === data.confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmation"],
  });

export const loginSchema = z.object({
  email: emailField,
  motdepasse: z.string().min(1, "Le mot de passe est obligatoire."),
});

export const profileSchema = z.object({
  prenom: nameField("Le prénom"),
  nom: nameField("Le nom"),
  email: emailField,
});

export const passwordChangeSchema = z
  .object({
    actuel: z.string().min(1, "Le mot de passe actuel est obligatoire."),
    nouveau: passwordField,
    confirmation: z.string(),
  })
  .refine((data) => data.nouveau === data.confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmation"],
  });

/* ---------- Activités ---------- */

export const activitySchema = z.object({
  nom: z
    .string()
    .trim()
    .min(3, "Le nom doit contenir au moins 3 caractères.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  typeId: z.coerce.number({ error: "Choisissez un type d'activité." }).int().positive("Choisissez un type d'activité."),
  placesDisponibles: z.coerce
    .number({ error: "Le nombre de places est obligatoire." })
    .int("Le nombre de places doit être un entier.")
    .min(1, "Il faut au moins 1 place.")
    .max(500, "500 places maximum."),
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères.")
    .max(2000, "La description ne doit pas dépasser 2000 caractères."),
  datetimeDebut: z
    .string()
    .transform((value, ctx) => {
      const date = parseParkDateTime(value);
      if (!date) {
        ctx.addIssue({ code: "custom", message: "Date et heure de début invalides." });
        return z.NEVER;
      }
      return date;
    }),
  duree: z.coerce
    .number({ error: "La durée est obligatoire." })
    .int("La durée doit être un nombre entier de minutes.")
    .min(15, "Durée minimale : 15 minutes.")
    .max(720, "Durée maximale : 12 heures."),
});

export type ActivityInput = z.infer<typeof activitySchema>;

export const typeSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom ne doit pas dépasser 50 caractères."),
});

/* ---------- Utilitaires ---------- */

/** Convertit une erreur Zod en dictionnaire `champ -> messages`. */
export function toFieldErrors<T>(error: z.ZodError<T>): Record<string, string[]> {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}

/** Convertit un `FormData` en objet simple de chaînes (les fichiers sont ignorés). */
export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) result[key] = value;
  }
  return result;
}
