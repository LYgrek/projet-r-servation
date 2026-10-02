/**
 * Script d'initialisation de la base de données.
 *
 *   npm run db:setup  -> applique les migrations puis insère les données de démo
 *   npm run db:reset  -> vide toutes les tables avant de réinsérer les données
 *
 * Ce script s'exécute hors de Next.js (via tsx) : il crée donc son propre
 * client au lieu d'importer `src/db` (protégé par `server-only`).
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../src/db/schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:data/parc.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client, { schema });

/** Construit une date à J+`days`, à l'heure indiquée (heure locale du serveur). */
function inDays(days: number, hours: number, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main(): Promise<void> {
  console.log("→ Application des migrations…");
  await migrate(db, { migrationsFolder: "drizzle" });

  const reset = process.argv.includes("--reset");
  const existing = await db.select({ id: schema.users.id }).from(schema.users).limit(1);

  if (existing.length > 0 && !reset) {
    console.log("✓ La base contient déjà des données (utilisez `npm run db:reset` pour la réinitialiser).");
    return;
  }

  if (reset) {
    console.log("→ Suppression des données existantes…");
    await db.delete(schema.reservations);
    await db.delete(schema.activites);
    await db.delete(schema.typeActivite);
    await db.delete(schema.users);
    // Remet les compteurs d'identifiants à zéro pour retrouver les mêmes id.
    await client.execute("DELETE FROM sqlite_sequence");
  }

  console.log("→ Insertion des utilisateurs…");
  const [adminHash, userHash] = await Promise.all([bcrypt.hash("Admin123!", 10), bcrypt.hash("User123!", 10)]);
  const insertedUsers = await db
    .insert(schema.users)
    .values([
      { prenom: "Enzo", nom: "Lou Yus", email: "admin@parc.fr", motdepasse: adminHash, role: "admin" },
      { prenom: "Enzo", nom: "Lou Yus", email: "user@parc.fr", motdepasse: userHash, role: "user" },
      { prenom: "Emma", nom: "Petit", email: "emma.petit@mail.fr", motdepasse: userHash, role: "user" },
      { prenom: "Hugo", nom: "Durand", email: "hugo.durand@mail.fr", motdepasse: userHash, role: "user" },
    ])
    .returning({ id: schema.users.id });

  console.log("→ Insertion des types d'activité…");
  const types = await db
    .insert(schema.typeActivite)
    .values([
      { nom: "Accrobranche" },
      { nom: "Escalade" },
      { nom: "Activités nautiques" },
      { nom: "Paintball" },
      { nom: "Bien-être" },
      { nom: "Atelier nature" },
    ])
    .returning({ id: schema.typeActivite.id, nom: schema.typeActivite.nom });

  const typeId = (nom: string): number => {
    const type = types.find((t) => t.nom === nom);
    if (!type) throw new Error(`Type introuvable : ${nom}`);
    return type.id;
  };

  console.log("→ Insertion des activités…");
  const activities = await db
    .insert(schema.activites)
    .values([
      {
        nom: "Parcours Aventure des Cimes",
        typeId: typeId("Accrobranche"),
        placesDisponibles: 20,
        description:
          "Évoluez de branche en branche sur notre parcours le plus haut du parc : ponts de singe, filets suspendus et une tyrolienne finale de 120 mètres au-dessus de l'étang. Accessible dès 12 ans, équipement fourni.",
        datetimeDebut: inDays(2, 10),
        duree: 150,
      },
      {
        nom: "Mini-parcours Écureuils",
        typeId: typeId("Accrobranche"),
        placesDisponibles: 15,
        description:
          "Un parcours ludique à faible hauteur conçu pour les enfants de 4 à 8 ans, encadré par nos moniteurs diplômés. Ligne de vie continue pour une sécurité maximale.",
        datetimeDebut: inDays(3, 14),
        duree: 60,
      },
      {
        nom: "Initiation escalade en falaise",
        typeId: typeId("Escalade"),
        placesDisponibles: 8,
        description:
          "Découvrez les bases de l'escalade sur la falaise naturelle du parc : nœuds, assurage et techniques de grimpe. Séance encadrée par un guide de haute montagne.",
        datetimeDebut: inDays(4, 9, 30),
        duree: 180,
      },
      {
        nom: "Bloc & slackline",
        typeId: typeId("Escalade"),
        placesDisponibles: 2,
        description:
          "Session sur nos blocs d'escalade extérieurs suivie d'une initiation à la slackline. Idéal pour travailler l'équilibre et la coordination.",
        datetimeDebut: inDays(5, 16),
        duree: 90,
      },
      {
        nom: "Balade en canoë sur le lac",
        typeId: typeId("Activités nautiques"),
        placesDisponibles: 12,
        description:
          "Une balade paisible en canoë biplace à la découverte de la faune du lac. Gilets de sauvetage fournis, savoir nager 25 mètres est obligatoire.",
        datetimeDebut: inDays(6, 10),
        duree: 120,
      },
      {
        nom: "Stand-up paddle au coucher du soleil",
        typeId: typeId("Activités nautiques"),
        placesDisponibles: 10,
        description:
          "Profitez de la lumière dorée de fin de journée sur une planche de paddle. Initiation incluse, aucun niveau requis.",
        datetimeDebut: inDays(8, 19),
        duree: 90,
      },
      {
        nom: "Paintball en forêt — scénario Capture du drapeau",
        typeId: typeId("Paintball"),
        placesDisponibles: 16,
        description:
          "Deux équipes s'affrontent sur notre terrain boisé de 2 hectares. 200 billes, masque et combinaison inclus. À partir de 14 ans.",
        datetimeDebut: inDays(9, 15),
        duree: 120,
      },
      {
        nom: "Yoga en pleine nature",
        typeId: typeId("Bien-être"),
        placesDisponibles: 14,
        description:
          "Une séance de yoga doux au bord de l'eau pour se reconnecter à soi. Tapis fournis, tous niveaux bienvenus.",
        datetimeDebut: inDays(10, 8, 30),
        duree: 75,
      },
      {
        nom: "Atelier cabanes & survie",
        typeId: typeId("Atelier nature"),
        placesDisponibles: 12,
        description:
          "Apprenez à construire un abri, allumer un feu en sécurité et reconnaître les plantes comestibles de la forêt. Atelier familial dès 7 ans.",
        datetimeDebut: inDays(12, 13, 30),
        duree: 180,
      },
      {
        nom: "Sortie nocturne : à l'écoute des chouettes",
        typeId: typeId("Atelier nature"),
        placesDisponibles: 10,
        description:
          "Une balade nocturne guidée par un naturaliste pour observer et écouter les rapaces nocturnes du parc. Prévoir une lampe frontale.",
        datetimeDebut: inDays(-5, 21),
        duree: 120,
      },
    ])
    .returning({ id: schema.activites.id });

  console.log("→ Insertion des réservations…");
  const [admin, enzo, emma, hugo] = insertedUsers;
  const a = activities.map((x) => x.id);
  if (!admin || !enzo || !emma || !hugo || a.length < 10) throw new Error("Données de démo incomplètes");

  await db.insert(schema.reservations).values([
    { userId: enzo.id, activiteId: a[0]!, dateReservation: inDays(-3, 11) },
    { userId: enzo.id, activiteId: a[4]!, dateReservation: inDays(-2, 18) },
    { userId: enzo.id, activiteId: a[6]!, dateReservation: inDays(-1, 9), etat: false },
    { userId: enzo.id, activiteId: a[9]!, dateReservation: inDays(-10, 10) },
    // L'activité « Bloc & slackline » est complète (2 places / 2 réservations).
    { userId: emma.id, activiteId: a[3]!, dateReservation: inDays(-4, 14) },
    { userId: hugo.id, activiteId: a[3]!, dateReservation: inDays(-4, 15) },
    { userId: emma.id, activiteId: a[0]!, dateReservation: inDays(-2, 10) },
    { userId: emma.id, activiteId: a[7]!, dateReservation: inDays(-1, 20) },
    { userId: hugo.id, activiteId: a[2]!, dateReservation: inDays(-3, 8) },
    { userId: hugo.id, activiteId: a[6]!, dateReservation: inDays(-2, 12) },
    { userId: hugo.id, activiteId: a[5]!, dateReservation: inDays(-1, 16), etat: false },
  ]);

  console.log("\n✓ Base initialisée !");
  console.log("  Administrateur : admin@parc.fr / Admin123!");
  console.log("  Utilisateur    : user@parc.fr  / User123!");
}

main()
  .catch((error: unknown) => {
    console.error("✗ Échec de l'initialisation :", error);
    process.exitCode = 1;
  })
  .finally(() => client.close());
