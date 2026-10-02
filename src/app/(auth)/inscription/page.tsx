import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/auth-forms";
import { Card } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez gratuitement votre compte Parc Évasion pour réserver vos activités en ligne.",
};

/** Page d'inscription (redirige vers les activités si l'utilisateur est déjà connecté). */
export default async function SignupPage({ searchParams }: PageProps<"/inscription">) {
  if (await getCurrentUser()) redirect("/activites");
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;

  return (
    <Card className="p-8 md:p-10">
      <h1 className="text-4xl leading-none font-extrabold tracking-tight md:text-5xl">
        Rejoins <em className="font-serif font-normal text-brand-700">l&apos;aventure</em>
      </h1>
      <p className="mt-3 mb-9 text-ink-muted">Crée ton compte gratuitement et réserve tes activités en un clic.</p>
      <SignupForm redirectTo={redirectTo} />
    </Card>
  );
}
