> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../CLAUDE.md)).

# Vue d'ensemble

App Expo / React Native, TypeScript. Projet à un stade très précoce : un seul
module applicatif, pas encore de découpage en features/écrans multiples.

## Structure actuelle

- `index.ts` — point d'entrée, enregistre le composant racine.
- `App.tsx` — composant racine.
- `assets/` — assets statiques (images, icônes...).
- `app.json` — configuration Expo.

## Stack

- Expo SDK ~57.0.20 — API changée vs versions antérieures, voir
  [AGENTS.md](../../AGENTS.md) et https://docs.expo.dev/versions/v57.0.0/
- React 19.2.3 / React Native 0.86.3
- TypeScript ~6.0.3

## Pas encore en place

- Pas de navigation (react-navigation, expo-router...).
- Pas de state management.
- Pas de framework de tests.
- Pas de `src/` — tout est à la racine pour l'instant.

Quand un de ces éléments apparaît, il devrait avoir son propre `.md` sous
`.claude/docs/`, proposé et validé avant création (Règle n°3 du CLAUDE.md).
