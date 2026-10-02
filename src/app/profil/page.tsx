import { KeyRound, ShieldAlert, UserRound, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { DeleteAccount, PasswordForm, ProfileForm } from "@/components/profile/profile-forms";
import { Badge, Card, IconSticker, PageHeader } from "@/components/ui/misc";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Mon profil",
  description: "Modifiez vos informations personnelles, votre mot de passe ou supprimez votre compte Parc Évasion.",
};

/** Page de gestion du profil de l'utilisateur connecté. */
export default async function ProfilePage() {
  const user = await requireUser("/profil");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        eyebrow="Mon carnet"
        title="Mon"
        accent="profil"
        description={
          <span className="flex flex-wrap items-center gap-2">
            {user.prenom} {user.nom}
            <Badge tone={user.role === "admin" ? "lime" : "neutral"}>{user.role === "admin" ? "Administrateur" : "Membre"}</Badge>
          </span>
        }
      />

      <Reveal className="space-y-8">
        <Section icon={UserRound} title="Informations personnelles" description="Ces informations apparaissent sur tes réservations.">
          <ProfileForm user={user} />
        </Section>

        <Section icon={KeyRound} title="Mot de passe" description="Choisis un mot de passe que tu n'utilises pas ailleurs.">
          <PasswordForm />
        </Section>

        <div data-reveal>
          <Card className="bg-sun-soft p-6 md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <IconSticker icon={ShieldAlert} className="bg-sun" />
                <div>
                  <h2 className="text-xl font-extrabold">Supprimer mon compte</h2>
                  <p className="mt-1 text-sm text-ink-muted">Ton compte et toutes tes réservations seront définitivement supprimés.</p>
                </div>
              </div>
              <DeleteAccount email={user.email} />
            </div>
          </Card>
        </div>
      </Reveal>
    </div>
  );
}

/** Carte de section du profil. */
function Section({ icon, title, description, children }: { icon: LucideIcon; title: string; description: string; children: ReactNode }) {
  return (
    <div data-reveal>
      <Card className="p-6 md:p-8">
        <div className="mb-7 flex gap-4">
          <IconSticker icon={icon} />
          <div>
            <h2 className="text-xl font-extrabold">{title}</h2>
            <p className="text-sm text-ink-muted">{description}</p>
          </div>
        </div>
        {children}
      </Card>
    </div>
  );
}
