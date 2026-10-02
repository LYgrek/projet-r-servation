import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { Card } from "@/components/ui/misc";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte Parc Évasion pour réserver et gérer vos activités.",
};

/** Page de connexion (redirige vers les activités si l'utilisateur est déjà connecté). */
export default async function LoginPage({ searchParams }: PageProps<"/connexion">) {
  if (await getCurrentUser()) redirect("/activites");
  const { redirect: redirectParam } = await searchParams;
  const redirectTo = typeof redirectParam === "string" ? redirectParam : undefined;

  return (
    <Card className="p-8 md:p-10">
      <h1 className="text-4xl leading-none font-extrabold tracking-tight md:text-5xl">
        Bon <em className="font-serif font-normal text-brand-700">retour !</em>
      </h1>
      <p className="mt-3 mb-9 text-ink-muted">Connecte-toi pour réserver tes prochaines aventures.</p>
      <LoginForm redirectTo={redirectTo} />
    </Card>
  );
}
