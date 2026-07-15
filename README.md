# Fliro — URL Shortener (Fullstack Portfolio Project)

![Frontend CI](https://github.com/julien-go/url-shortener/actions/workflows/ci-frontend.yml/badge.svg)
![Backend CI](https://github.com/julien-go/url-shortener/actions/workflows/ci-backend.yml/badge.svg)

**Live App** [https://app.fliro.cc](https://app.fliro.cc)

Fliro est une application fullstack de raccourcissement d’URL développée comme projet portfolio.

Il met en avant une architecture TypeScript claire, une API GraphQL,
une base PostgreSQL avec migrations, ainsi que des bonnes pratiques
de sécurité et de CI.

## Objectif

Ce projet sert de support pour démontrer :

- la conception d’une application fullstack TypeScript
- la mise en place d’une API GraphQL
- la gestion d’une base PostgreSQL avec migrations
- l’implémentation de mesures de sécurité applicative
- la mise en place d’un pipeline CI

## Stack

- **Frontend** : React 19, Vite, TypeScript, React Router, React Query, Tailwind
- **Backend** : Node.js, Express 5, Apollo Server (GraphQL), TypeScript, Zod (validation)
- **Base de données** : PostgreSQL + dbmate (SQL migrations)
- **CI** : GitHub Actions
- **Déploiement** :
  - Frontend sur **Netlify**
  - Backend + DB sur **Railway**

## Architecture du repo

```text
apps/
  frontend/   # UI React
  backend/    # API GraphQL + redirection /:code
.github/
  workflows/  # CI frontend/backend
```

## Démarrage local

### Prérequis

- Node.js 20+
- pnpm 10+
- PostgreSQL

### 1) Installer les dépendances

```bash
pnpm install
```

### 2) Configurer les variables d’environnement

Backend :

```bash
cp apps/backend/.env.example apps/backend/.env
```

Frontend :

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

### 3) Appliquer les migrations

```bash
pnpm --filter ./apps/backend db:migrate
```

### 4) Lancer en développement

```bash
pnpm dev
```

- Front : http://localhost:5173
- Back GraphQL : http://localhost:4000/graphql

## Scripts utiles

```bash
pnpm -r lint
pnpm -r typecheck
pnpm -r test
pnpm -r build
```

## Features

- Inscription / connexion / déconnexion
- Création de short links (slug custom optionnel)
- Liste paginée des liens utilisateur
- Suppression logique de liens
- Redirection courte URL (`/:code`)
- Statistiques de clics (total, dernier clic, graphique 7 / 30 jours)

## Base de données

Le modèle est simple et orienté besoin produit :

- `users` : comptes utilisateurs, hash de mot de passe, version de token
- `short_urls` : liens raccourcis, slug, URL cible, état actif/supprimé, compteurs
- `daily_clicks` : agrégats journaliers de clics pour l’analytics

Notes techniques :

- index sur le slug (`LOWER(code)`) pour l’unicité et la recherche,
- relation utilisateur → liens,
- table d’agrégats séparée pour éviter de recalculer l’historique au runtime.

```mermaid
erDiagram
  USERS ||--o{ SHORT_URLS : owns
  SHORT_URLS ||--o{ DAILY_CLICKS : aggregates

  USERS {
    uuid id PK
    text email UK
    text password_hash
    int token_version
    timestamptz created_at
  }

  SHORT_URLS {
    uuid id PK
    uuid user_id FK
    text code UK
    text target_url
    boolean is_active
    bigint total_clicks
    timestamptz last_clicked_at
    timestamptz deleted_at
    timestamptz created_at
  }

  DAILY_CLICKS {
    uuid short_url_id FK
    date day_utc PK
    int clicks
  }
```

Le backend persiste 3 tables : comptes (`users`), liens (`short_urls`) et agrégats journaliers (`daily_clicks`). La suppression d’un lien est logique (`deleted_at` + `is_active=false`), pas un DELETE physique.

## Flux de l’application

### Création d’un lien

1. L’utilisateur envoie l’URL (et éventuellement un slug custom) via le front.
2. Le backend valide l’entrée (Zod), puis crée l’enregistrement en base.
3. Le front affiche le short link généré.

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant FE as Frontend (React)
  participant API as GraphQL Mutation createShortUrl
  participant SVC as shortUrls.service
  participant DB as PostgreSQL

  U->>FE: Soumet originalUrl (+ code optionnel)
  FE->>API: POST /graphql createShortUrl(input)
  API->>API: Validation Zod + auth cookie
  API->>SVC: createShortUrl(input, userId)
  SVC->>SVC: Valide URL + slug (format + reserved codes)
  alt slug invalide/réservé
    SVC-->>API: INVALID_CODE
    API-->>FE: BAD_USER_INPUT (Invalid slug)
  else slug custom valide
    SVC->>DB: INSERT short_urls(code, target_url, user_id)
  else slug auto
    loop jusqu'à slug unique
      SVC->>SVC: generateRandomSlug()
      SVC->>DB: INSERT short_urls(...)
    end
  end
  DB-->>SVC: row créée
  SVC-->>API: shortUrl + shortLink
  API-->>FE: Payload GraphQL
  FE-->>U: Affiche le lien court
```

La création passe toujours par `createShortUrl` côté GraphQL, puis par un service métier qui gère les validations métier et les collisions d’unicité du slug.

### Redirection

1. Requête sur `/:code`.
2. Le backend résout le code, vérifie l’état du lien, puis redirige en 302.
3. Le clic est tracké (compteur total + agrégat journalier).

```mermaid
sequenceDiagram
  participant B as Navigateur
  participant R as Route GET /:code
  participant SVC as resolveShortUrl
  participant DB as PostgreSQL

  B->>R: GET /:code
  R->>SVC: resolveShortUrl(code, {track})
  SVC->>DB: SELECT short_urls WHERE LOWER(code)=...
  alt lien actif
    SVC-->>R: ok + targetUrl
    par tracking activé
      SVC->>DB: UPSERT daily_clicks + UPDATE short_urls(total_clicks, last_clicked_at)
    end
    R-->>B: 302 Location: targetUrl
  else lien supprimé
    SVC-->>R: reason=DELETED
    R-->>B: 410 page HTML
  else introuvable/inactif
    SVC-->>R: reason=NOT_FOUND/INACTIVE
    R-->>B: 404 page HTML
  end
```

La redirection est une route HTTP Express séparée de GraphQL.
Le clic est enregistré en arrière-plan (sans bloquer la réponse 302).
Le tracking est désactivé pour les requêtes spéculatives du navigateur
(prefetch/prerender) afin d’éviter de compter des visites non réelles.

### Stats

Le frontend interroge la query GraphQL `linkStats`.
Le backend lit les agrégats `daily_clicks` et retourne les clics par jour, le total de clics et la dernière activité.

## Sécurité

- Validation d’entrée avec Zod
- Authentification JWT (HS256) en cookie HttpOnly
- Invalidation de session via `token_version`
- Register résistant à l’énumération de comptes (message générique, timing constant)
- Rate limiting sur endpoints sensibles (auth, création, redirection)
- CORS par allowlist
- Security headers : HSTS, CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, Cross-Origin-Opener-Policy (COOP), Cross-Origin-Resource-Policy (CORP)

## Observabilité

- Logging structuré via [pino](https://github.com/pinojs/pino) (JSON en prod, sortie lisible en dev via `LOG_PRETTY=true`)
- Niveau de log configurable avec `LOG_LEVEL`
- Erreurs internes GraphQL loggées côté serveur (masquées côté client), avec redaction des champs sensibles
- `GET /healthz` : health check
- `GET /metrics` : métriques de rate limiting (protégé par `METRICS_API_KEY`, désactivable via `METRICS_ENABLED`)

## Déploiement

### Frontend (Netlify)

- Build command : `pnpm --filter ./apps/frontend build`
- Publish directory : `apps/frontend/dist`
- Variables d'environnement à configurer dans Netlify (Site settings → Environment variables) : `VITE_API_URL`, `VITE_APP_NAME`, `VITE_SITE_URL`
- Le fallback SPA est géré par `apps/frontend/netlify.toml` (`/* → /index.html`)
- Déploiement déclenché automatiquement à chaque push sur `main` (intégration Git Netlify)

### Backend + DB (Railway)

- Start command : `pnpm --filter ./apps/backend start` (lance `tsx src/index.ts`)
- Variables d'environnement à configurer dans Railway : toutes celles listées dans `apps/backend/.env.example`, avec des valeurs de prod (voir "Notes production" ci-dessous)
- Migrations : à appliquer après chaque déploiement qui change le schéma, via `pnpm --filter ./apps/backend db:migrate:prod` (utilise directement `DATABASE_URL`/`DBMATE_DATABASE_URL`, sans passer par un `.env` local)
- Rollback d'une migration : `pnpm --filter ./apps/backend db:rollback:prod` (équivalent `dbmate down`, utilise directement `DATABASE_URL`/`DBMATE_DATABASE_URL` comme `db:migrate:prod`, sans passer par un `.env` local). `db:rollback` (sans `:prod`) est réservé au local : il charge `../../.env` via `dotenv -e` et rollback donc la base pointée par ce fichier, jamais la prod.

### Arrêt propre (zero-downtime)

Le serveur backend écoute `SIGTERM`/`SIGINT` : à l'arrêt, il cesse d'accepter de nouvelles connexions, laisse les requêtes en cours se terminer, ferme le pool PostgreSQL, puis quitte (avec un timeout de sécurité de 10s en cas de blocage). Ça évite de couper des requêtes en cours à chaque redéploiement.

### Sauvegardes

Aucune sauvegarde automatisée n'est configurée dans ce repo. Railway propose des snapshots selon le plan Postgres choisi (à vérifier/activer depuis son dashboard). Pour une sauvegarde manuelle ponctuelle :

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql
```

## Notes production

Le `.env.example` est pensé pour le local. En prod, il faut surtout vérifier :

- `NODE_ENV=production`
- `COOKIE_SECURE=true`
- origins CORS correctes
- `JWT_SECRET` fort
- `PUBLIC_BASE_URL` aligné avec le domaine public
- `LOG_PRETTY` laissé à `false` (le pretty-printer `pino-pretty` est une dépendance de dev)

---
