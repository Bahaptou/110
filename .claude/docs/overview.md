> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../CLAUDE.md)).

# Vue d'ensemble

App Expo / React Native, TypeScript. Bibliothèque de sons enregistrés/importés
de proches, structurée comme une bibliothèque musicale (voir
[design-reference.md](design-reference.md) pour le concept et le langage
visuel).

## Environnement d'exécution

**Development build, pas Expo Go.** Le projet a quitté Expo Go (2026-09-08)
parce qu'`expo-file-system` y échoue à lire les fichiers du cache
`expo-document-picker` (bug de sandbox Expo Go connu, expo/expo #21792), ce
qui cassait tout l'import de sons. Un dev build est de toute façon nécessaire
pour l'enregistrement micro et pour publier.

Prérequis : Android Studio installé (pour le SDK Android + `adb`), téléphone
en débogage USB. Compilation : `npx expo run:android`. Développement ensuite :
`npx expo start` comme avant.

## Architecture

```
src/
├── db/            schéma SQLite + migrations (source de vérité des données)
├── data/          useSqliteQuery (hook générique) + QueryError (erreurs typées)
├── components/
│   ├── layout/    StretchHeader, SearchBar, useScrollHeader, JiggleTile,
│   │              useEditMode, ErrorBoundary, PlaceholderScreen
│   └── ui/        Button
├── features/      une feature = types → repository → service → hook → screens
│   ├── artists/   liste, détail, ajout, suppression en cascade
│   ├── tracks/    liste, import fichier, sauvegarde, changement d'artiste,
│   │              suppression, validation formats/durée
│   └── playback/  PlaybackProvider (Context global), MiniPlayer, PlayerScreen
└── navigation/    RootNavigator (tab bar 5 slots) + TabIcons
```

Séparation en couches, jamais contournée : l'UI appelle un hook, qui appelle
un service (logique métier), qui appelle un repository (SQL brut). Voir
[data-layer.md](data-layer.md).

## Stack

- Expo SDK ~57.0.20 — API changée vs versions antérieures, voir
  [AGENTS.md](../../AGENTS.md) et https://docs.expo.dev/versions/v57.0.0/
- React 19.2.3 / React Native 0.86.3, TypeScript ~6.0.3
- expo-sqlite (persistance locale), expo-audio (lecture/durée),
  expo-file-system (stockage des fichiers audio), expo-document-picker (import)
- @react-navigation (bottom-tabs + native-stack), react-native-reanimated,
  react-native-gesture-handler, react-native-svg

## Pas encore en place

- `albums/` et `playlists/` — écrans placeholder uniquement.
- Enregistrement micro — le bouton rond central de la tab bar est visuel
  uniquement, aucune action branchée.
- Pas de framework de tests.
- Pas de fichier de tokens de thème partagé (couleurs dupliquées par écran).
