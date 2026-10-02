import type { Metadata } from "next";
import { RoleSelect } from "@/components/admin/role-select";
import { Badge, Card, PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/dal";
import { listUsers } from "@/lib/queries/users";

export const metadata: Metadata = {
  title: "Utilisateurs",
  description: "Liste des comptes utilisateurs et gestion des rôles.",
};

/** Liste des utilisateurs avec changement de rôle (bonus). */
export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await listUsers();

  return (
    <>
      <PageHeader title="Utilisateurs" description={`${users.length} compte(s) inscrit(s)`} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-ink bg-paper-deep text-xs tracking-widest text-ink uppercase">
              <tr>
                <th scope="col" className="px-5 py-3 font-extrabold">Nom</th>
                <th scope="col" className="px-5 py-3 font-extrabold">Email</th>
                <th scope="col" className="px-5 py-3 font-extrabold">Réservations actives</th>
                <th scope="col" className="px-5 py-3 font-extrabold">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-ink/10">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-lime/25">
                  <td className="px-5 py-3.5 font-bold">
                    {user.prenom} {user.nom}
                    {user.id === admin.id && (
                      <Badge tone="blue" className="ml-2">
                        Vous
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-ink-muted">{user.email}</td>
                  <td className="px-5 py-3.5 tabular-nums">{user.nbReservations}</td>
                  <td className="px-5 py-3.5">
                    {user.id === admin.id ? (
                      <Badge tone="blue">Administrateur</Badge>
                    ) : (
                      <RoleSelect userId={user.id} role={user.role} userName={`${user.prenom} ${user.nom}`} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
