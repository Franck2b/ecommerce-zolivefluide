# Affût & Apnée

Boutique en ligne d'équipement de **chasse** et de **chasse sous-marine** — projet EEMI.

Catalogue à deux univers, panier, comptes clients, tunnel de commande avec réservation de stock, paiement Stripe (ou simulé en local) et back-office d'administration.

## Démarrage rapide

Prérequis : Node 22+, Docker.

```bash
cp .env.example .env
npm install
npm run setup      # Postgres (Docker) + migrations + données de démo
npm run dev        # http://localhost:3000
```

Comptes de démonstration (créés par le seed, environnement local uniquement) :

| Rôle   | E-mail                    | Mot de passe        |
| ------ | ------------------------- | ------------------- |
| Admin  | `admin@affut-apnee.test`  | `affut-admin-2026`  |
| Client | `client@affut-apnee.test` | `affut-client-2026` |

Sans clé Stripe, le paiement passe par une page de **paiement simulé**, désactivée en production sauf si `SIMULATED_PAYMENT=true` (réservé à la CI et à la démo Docker locale, qui tournent sur le build de production). Pour tester Stripe en mode test : renseigner `STRIPE_SECRET_KEY`, puis `stripe listen --forward-to localhost:3000/api/stripe/webhook` et copier le secret dans `STRIPE_WEBHOOK_SECRET`.

Tout en conteneurs (app sur http://localhost:3000, paiement simulé si aucune clé Stripe n'est fournie) :

```bash
docker compose --profile full up --build
```

## Scripts

| Commande                         | Rôle                                        |
| -------------------------------- | ------------------------------------------- |
| `npm run dev` / `build` / `start` | Next.js                                     |
| `npm run lint` / `typecheck`     | ESLint, TypeScript strict                   |
| `npm test`                       | Tests unitaires (Vitest)                    |
| `npm run test:e2e`               | Parcours d'achat complet (Playwright)       |
| `npm run db:generate`            | Génère une migration depuis `src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` | Applique les migrations / recharge la démo  |

## Stack et choix techniques

- **Next.js 16 (App Router, Cache Components)** — Server Components, Server Actions, streaming. Le catalogue est mis en cache (`"use cache"` + tag `catalog`) et invalidé à chaque modification admin ou mouvement de stock (`updateTag`).
- **Build indépendant de la base** : les composants qui lisent le catalogue appellent `connection()`. L'image Docker se construit sans Postgres, les données vivent à l'exécution (12-factor).
- **PostgreSQL + Drizzle ORM** — schéma typé, migrations SQL versionnées dans `drizzle/`, contraintes en base (stock ≥ 0, prix > 0, prix barré > prix).
- **Auth maison** plutôt qu'une librairie : sessions en base, jeton aléatoire en cookie `httpOnly` / `SameSite=Lax`, seul son **SHA-256** est stocké ; mots de passe **argon2id** (paramètres OWASP) ; limitation des tentatives de connexion ; temps de réponse constant que l'e-mail existe ou non.
- **Paiement Stripe Checkout** + webhook signé. Un paiement arrivé après l'expiration d'une commande est remboursé automatiquement.
- **Tailwind CSS 4**, polices Barlow / Barlow Condensed via `next/font`, images optimisées par `next/image`.

## Règles métier

- Prix stockés en **centimes**, affichés TTC (TVA 20 %). Livraison 5,90 €, offerte dès 79 €.
- **Stock réservé à la commande**, dans une transaction (`UPDATE … WHERE stock >= qté`, verrous dans un ordre stable pour éviter les interblocages). Les commandes non payées après 35 min sont annulées et le stock restitué.
- Les lignes de commande **figent** nom, variante, image et prix : modifier ou supprimer un produit n'altère jamais l'historique.
- Machine à états des commandes (`src/lib/order-status.ts`) : en attente → payée → expédiée → livrée, annulation possible avant expédition. Toute transition passe par `transitionOrder`, sous verrou `FOR UPDATE`.
- Panier invité conservé par cookie et **fusionné** avec le panier du compte à la connexion.
- L'espace `/admin` renvoie une 404 à tout non-administrateur ; chaque Server Action revérifie les droits.
- Aucune arme à feu ni munition au catalogue (vente réglementée).

## Arborescence

```
src/
  app/(boutique)/   pages publiques et espace client
  app/admin/        back-office (tableau de bord, produits, commandes)
  app/api/stripe/   webhook Stripe
  actions/          Server Actions (panier, auth, commande, admin)
  components/       composants d'interface
  db/               schéma Drizzle et client
  lib/              logique métier (auth, panier, commandes, prix, validation)
scripts/            migration et seed
tests/  e2e/        Vitest et Playwright
```

## Crédits

Packshots générés pour le projet, photos du hero fournies ; autres photos sous licence libre, listées sur la page `/credits-photos`.
