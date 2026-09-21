# Changelog

Toutes les évolutions notables de Fliro sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et le projet respecte le [versioning sémantique](https://semver.org/lang/fr/).

Les versions des deux apps (`apps/frontend`, `apps/backend`) sont alignées sur
celle du monorepo : une seule version pour l'ensemble du projet.

## [Non publié]

### Ajouté

- Plages de statistiques 90 jours et 12 mois, avec comparaison à la période précédente

## [1.0.0] - 2026-09-21

Première version stable : l'application est déployée et fonctionnelle
(frontend sur Netlify, backend + PostgreSQL sur Railway).

### Ajouté

**Comptes et authentification**

- Inscription, connexion et déconnexion
- Authentification JWT (HS256) stockée dans un cookie HttpOnly
- Invalidation de session côté serveur via `token_version`
- Politique de mot de passe (8 à 72 caractères, majuscule, minuscule, chiffre, caractère spécial), validée côté frontend et re-validée côté backend
- Inscription résistante à l'énumération de comptes (message générique, timing constant)

**Liens courts**

- Création d'un lien court, avec slug personnalisé optionnel (format validé, codes réservés refusés)
- Génération automatique d'un slug avec gestion des collisions d'unicité
- Liste paginée des liens de l'utilisateur (pagination par curseur)
- Suppression logique d'un lien (`deleted_at` + `is_active=false`), jamais de DELETE physique
- Redirection `GET /:code` en 302, hors GraphQL, avec pages 404 / 410 dédiées

**Statistiques**

- Suivi des clics : compteur total, date du dernier clic, agrégats journaliers
- Tracking non bloquant, exclu pour les requêtes spéculatives du navigateur (prefetch/prerender)
- Dashboard de stats par lien : graphique des clics sur 7 ou 30 jours

**Sécurité**

- Validation de toutes les entrées GraphQL avec Zod
- Rate limiting sur les endpoints sensibles (authentification, création de liens, redirection)
- CORS par allowlist
- Security headers : HSTS, CSP, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP
- Erreurs internes masquées côté client (message générique) et loggées côté serveur

**Observabilité et exploitation**

- Logging structuré avec pino (JSON en prod, sortie lisible en dev), avec redaction des champs sensibles
- `GET /healthz` (health check) et `GET /metrics` (métriques de rate limiting, protégé par clé d'API)
- Arrêt propre sur `SIGTERM`/`SIGINT` : plus de nouvelles connexions, requêtes en cours terminées, pool PostgreSQL fermé
- Configuration centralisée et validée au démarrage (Zod)

**Base de données**

- Schéma PostgreSQL : `users`, `short_urls`, `daily_clicks`
- Migrations SQL versionnées via dbmate

**Outillage**

- Monorepo pnpm (`apps/frontend`, `apps/backend`)
- CI GitHub Actions : lint, typecheck, tests unitaires, et tests d'intégration sur un service PostgreSQL

[Non publié]: https://github.com/julien-go/url-shortener/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/julien-go/url-shortener/releases/tag/v1.0.0
