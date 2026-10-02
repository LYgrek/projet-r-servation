# 🌲 Parc Évasion — Système de réservation

Application de réservation d'activités pour un parc de loisirs, réalisée avec **Next.js 16 (App Router)** et **TypeScript**.

## 👥 Auteurs

- **LOU YUS Enzo** 

---

## 🚀 Installation et lancement

Prérequis : **Node.js ≥ 20.9** (testé avec Node 24) et npm.

```bash
# 1. Installer les dépendances
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env
#    puis remplacer SESSION_SECRET par une longue chaîne aléatoire :
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Créer la base de données et insérer les données de démonstration
npm run db:setup

# 4. Lancer le serveur de développement
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

### Comptes de démonstration

| Rôle           | Email           | Mot de passe |
| -------------- | --------------- | ------------ |
| Administrateur | `admin@parc.fr` | `Admin123!`  |
| Utilisateur    | `user@parc.fr`  | `User123!`   |

> L'activité **« Bloc & slackline »** est volontairement complète, pour montrer le blocage des réservations.

### Scripts disponibles

| Commande              | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `npm run dev`         | Serveur de développement                                     |
| `npm run build`       | Build de production                                          |
| `npm start`           | Serveur de production (après le build)                       |
| `npm run lint`        | Analyse ESLint                                               |
| `npm run typecheck`   | Vérification TypeScript                                      |
| `npm run db:setup`    | Applique les migrations et insère les données de démo        |
| `npm run db:reset`    | Vide la base et réinsère les données de démo                 |
| `npm run db:generate` | Génère une migration SQL après une modification du schéma   |

---

## ✅ Fonctionnalités

### Utilisateurs
- Inscription (validation des champs, email unique, mot de passe haché avec **bcrypt**)
- Connexion / déconnexion (session dans un **cookie httpOnly signé (JWT)**)
- Modification du profil (prénom, nom, email) et **changement de mot de passe**
- Suppression du compte (confirmation en retapant son email ; ses réservations sont supprimées)
- Retour automatique à la page demandée après connexion

### Activités
- Consultation publique de la liste et du détail des activités
- **Recherche par nom** (insensible à la casse et aux accents), filtre par **type** et par **période** (à venir / passées / toutes) — les filtres sont dans l'URL, donc partageables
- Jauge de remplissage et nombre de places restantes
- Administration : **création, modification, suppression** d'activités

### Réservations
- Réservation d'une activité en un clic
- Liste « Mes réservations » classée en *À venir / Passées / Annulées*
- Annulation avec boîte de confirmation (l'état passe à `false`, la réservation est conservée dans l'historique)

### Règles de validation (toutes vérifiées côté serveur)
- ❌ Réserver une activité **complète** — l'insertion est faite en **une seule requête SQL conditionnelle**, donc atomique : même avec 8 demandes simultanées pour les 2 dernières places, seules 2 sont acceptées
- ❌ Réserver une activité **déjà commencée** ou **déjà réservée** par soi-même
- ❌ Annuler une réservation **qui ne nous appartient pas** (réponse « introuvable » pour ne pas révéler son existence), déjà annulée, ou dont l'activité a commencé
- ❌ Accéder aux **pages administrateur** sans être admin (vérifié dans le layout `/admin`, dans chaque page et dans chaque Server Action)
- ❌ Réduire la capacité d'une activité sous le nombre de places déjà réservées
- ❌ Supprimer un type d'activité encore utilisé, ou le dernier administrateur

### Interface
- Design responsive (mobile → desktop), menu mobile, menu utilisateur déroulant
- **Page 404 stylisée** pour toute URL inconnue ou activité inexistante, page d'erreur, squelette de chargement
- **Métadonnées** propres à chaque page (titre dynamique pour le détail d'une activité)
- Notifications (toasts) de succès / d'erreur, boutons avec état de chargement
- Accessibilité : labels liés aux champs, messages d'erreur annoncés (`role="alert"`), navigation clavier, lien d'évitement, respect de `prefers-reduced-motion`

### Direction artistique et animations
Univers « carnet de randonnée » : papier crème, contours épais et ombres décalées, motifs de courbes de niveau, typographies *Bricolage Grotesque* + *Instrument Serif*. Les activités sont présentées comme des **billets** (talon daté, ligne perforée, tampon).

Animations réalisées avec **GSAP** (composants réutilisables dans `src/components/motion/`) :
- titres découpés lettre par lettre (SplitText) ;
- paysage de la page d'accueil en plusieurs plans, avec parallaxe au défilement et à la souris ;
- apparition des cartes au défilement (ScrollTrigger), cartes qui s'inclinent en 3D, boutons « aimantés » ;
- bandeaux défilants qui changent de sens avec le scroll, compteurs et jauges animés ;
- pastille de navigation qui glisse entre les liens, en-tête qui se masque au défilement ;
- boussole déboussolée sur la page 404.

Toutes les animations sont désactivées si l'utilisateur a activé « réduire les animations », et le contenu reste visible sans JavaScript.

## ⭐ Bonus

- **Tableau de bord administrateur** : nombre d'utilisateurs, activités à venir, réservations actives, taux d'annulation, taux de remplissage, réservations par type, activités les plus demandées, dernières réservations
- **Notifications par email** (Nodemailer) : bienvenue, confirmation et annulation de réservation, et email aux participants si un administrateur supprime une activité. Sans serveur SMTP configuré, les emails sont affichés dans la console du serveur.
- **Gestion des types d'activité** (ajout, renommage, suppression)
- **Gestion des utilisateurs** : liste et changement de rôle (utilisateur ↔ administrateur)
- Liste de toutes les réservations du parc pour l'administrateur
- Changement de mot de passe

---

## 🛠️ Stack technique

| Domaine          | Choix                                                              |
| ---------------- | ------------------------------------------------------------------ |
| Framework        | Next.js 16 (App Router, Server Components, Server Actions, Turbopack) |
| Langage          | TypeScript (mode `strict` + `noUncheckedIndexedAccess`, routes typées) |
| Base de données  | SQLite via **libSQL** (aucune installation de serveur nécessaire)  |
| ORM              | **Drizzle ORM** (schéma typé + migrations SQL versionnées)          |
| Validation       | **Zod**                                                            |
| Authentification | Cookie de session JWT (`jose`) + mots de passe hachés (`bcryptjs`) |
| Style            | **Tailwind CSS v4**, icônes `lucide-react`, toasts `sonner`        |
| Animations       | **GSAP** (ScrollTrigger, SplitText) via `@gsap/react`              |
| Emails           | Nodemailer                                                         |

## 🗄️ Base de données

Le schéma est défini dans [`src/db/schema.ts`](src/db/schema.ts) et la migration SQL générée se trouve dans [`drizzle/`](drizzle/).

```
users          (id, prenom, nom, email, motdepasse, role)
type_activite  (id, nom)
activites      (id, nom, type_id → type_activite, places_disponibles, description, datetime_debut, duree)
reservations   (id, user_id → users, activite_id → activites, date_reservation, etat)
```

- `places_disponibles` représente la **capacité totale** ; les places restantes sont calculées à partir des réservations dont `etat = true`. On évite ainsi toute désynchronisation d'un compteur.
- `duree` est exprimée en minutes ; `datetime_debut` est saisie et affichée à l'heure de Paris, quel que soit le fuseau du serveur.
- `etat` vaut `true` par défaut et passe à `false` lors d'une annulation.

## 📁 Structure du projet

```
src/
├── actions/          # Server Actions (mutations) : auth, profil, activités, types, réservations, utilisateurs
├── app/              # Routes (App Router)
│   ├── (auth)/       #   connexion, inscription
│   ├── activites/    #   liste (+ recherche) et détail
│   ├── admin/        #   tableau de bord, activités, types, réservations, utilisateurs
│   ├── profil/       #   gestion du compte
│   ├── reservations/ #   mes réservations
│   ├── not-found.tsx #   page 404
│   └── error.tsx     #   page d'erreur
├── components/       # Composants React (ui/, layout/, activities/, admin/, ...)
├── db/               # Connexion et schéma Drizzle
├── lib/
│   ├── queries/      # Requêtes de lecture
│   ├── dal.ts        # Contrôle d'accès : getCurrentUser / requireUser / requireAdmin
│   ├── session.ts    # Création / lecture / suppression du cookie de session
│   ├── validation.ts # Schémas Zod
│   ├── dates.ts      # Formatage et conversion des dates (fuseau Europe/Paris)
│   └── mail.ts       # Envoi des emails
└── proxy.ts          # Redirection des visiteurs non connectés (ex-middleware)
scripts/seed.ts       # Migrations + données de démonstration
```

## 🔐 Sécurité

- Mots de passe hachés (bcrypt), jamais renvoyés au client (type `PublicUser`).
- Session signée HS256, cookie `httpOnly`, `sameSite=lax`, `secure` en production.
- Défense en profondeur : le **proxy** redirige les visiteurs non connectés, mais l'autorisation réelle est faite côté serveur par la **DAL** (`requireUser` / `requireAdmin`), qui relit l'utilisateur en base à chaque requête (un rôle retiré est pris en compte immédiatement).
- Toutes les entrées sont validées avec Zod côté serveur ; requêtes paramétrées (pas d'injection SQL).
- Redirection après connexion limitée aux chemins internes (pas de redirection ouverte).
- Message d'erreur de connexion identique que l'email existe ou non.
