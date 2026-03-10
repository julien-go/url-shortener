# Responsive — Phase 0 (Cadrage) pour `url-shortener` front

Ce document fige le **cadrage initial** avant implémentation responsive (sans changements UI).

## 1) Objectifs Phase 0

- Définir les contraintes d’affichage et les breakpoints de référence.
- Prioriser les zones à risque front composant par composant.
- Établir les critères d’acceptation mesurables avant la Phase 1.
- Poser une check-list QA responsive commune à toute l’équipe.

## 2) Périmètre produit couvert

Pages / composants audités:

- `Layout` (header sticky + navigation + actions auth)
- `HomeLanding`
- `HomeWorkspace` + `CreateShortUrlForm`
- `LoginPage` / `RegisterPage` via `AuthLayout`
- `MyLinksPage` (table + pagination + actions)
- `LinkStatsPage` (filtres, KPI, détails lien, chart)
- Primitives UI transverses (`Button`, `Input`, `Table`, `ToggleGroup`, `ClicksBarChart`)

## 3) Breakpoints & devices de référence

### Breakpoints de validation

- **Mobile S**: 360×800
- **Mobile M**: 390×844
- **Tablet**: 768×1024
- **Desktop**: 1024×768 et +

### Contextes à tester

- Orientation portrait prioritaire (landscape en complément)
- Zoom navigateur 200%
- Taille de texte augmentée (accessibilité)

## 4) Risques responsive identifiés (priorisés)

## P0 — critique

1. `MyLinksPage`
   - Table à colonnes fixes + URLs longues = overflow horizontal probable.
   - Zone d’actions de ligne dense sur petits écrans.
   - Pagination en ligne peu robuste sous contrainte d’espace.

2. `LinkStatsPage`
   - En-tête + actions filtre à stabiliser sur mobile.
   - Bloc détails lien à simplifier en pile verticale.
   - Lisibilité chart à sécuriser (ticks X et densité des labels).

## P1 — important

3. `Layout`
   - Coexistence logo / nav / actions auth en header sticky sur petits écrans.

4. `HomeLanding`
   - Badges features sur une seule ligne: risque de wrap non maîtrisé.

## P2 — optimisation

5. `AuthLayout`, `LoginForm`, `RegisterForm`, `CreateShortUrlForm`
   - Bonne base responsive, surtout des ajustements de rythmes verticaux.

## 5) Stratégie de sortie Phase 0

La Phase 0 est considérée terminée si:

- [ ] Tous les écrans ci-dessus ont un risque responsive classifié P0/P1/P2.
- [ ] Les breakpoints et devices cibles sont validés.
- [ ] Les critères d’acceptation Phase 1 sont définis.
- [ ] La check-list QA responsive est prête.

## 6) Critères d’acceptation pour la Phase 1 (implémentation)

## Règles globales

- Aucun scroll horizontal de page.
- CTA interactifs avec zone tactile confortable (44px min).
- Titres et textes critiques lisibles sans zoom.
- États `loading/error/empty` stables sur mobile.

## Critères ciblés

- `MyLinksPage`: rendu mobile en cartes (ou pattern équivalent) lisible sans scroll horizontal global.
- `LinkStatsPage`: détails lien, KPI et chart lisibles en portrait mobile.
- `Layout`: header utilisable sur mobile, sans collision visuelle.

## 7) Plan d’exécution recommandé (Phase 1 à venir)

1. `MyLinksPage` (priorité haute)
2. `LinkStatsPage` (priorité haute)
3. `Layout` (priorité moyenne)
4. `HomeLanding` (priorité moyenne)
5. Ajustements forms/auth (priorité basse)

## 8) Check-list QA responsive (à appliquer sur chaque PR)

- [ ] 360px: pas d’overflow horizontal
- [ ] 390px: actions principales atteignables sans zoom
- [ ] 768px: layout intermédiaire cohérent
- [ ] 1024px: pas de régression desktop
- [ ] États `loading/error/empty` vérifiés
- [ ] URLs longues vérifiées (truncate / wrap maîtrisé)
- [ ] Navigation clavier et focus visibles
- [ ] Contrastes lisibles en thème actuel

---

**Note:** ce document correspond à une Phase 0 de cadrage uniquement. L’implémentation responsive commencera en Phase 1.
