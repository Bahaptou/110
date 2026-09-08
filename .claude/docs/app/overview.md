> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../../CLAUDE.md)).

# App — point d'entrée

Documente `index.ts` et `App.tsx`. Tout le reste vit dans `src/` (voir
[overview.md](../overview.md)).

## `index.ts`

`registerRootComponent(App)` — enregistre le composant racine auprès d'Expo.

## `App.tsx`

Uniquement l'empilement des providers, dans cet ordre (l'ordre compte) :

```
GestureHandlerRootView   ← requis par react-native-gesture-handler, doit être à la racine
└── ErrorBoundary        ← filet de sécurité pour les erreurs de rendu
    └── SQLiteProvider   ← ouvre la base + joue migrateDatabase au démarrage
        └── PlaybackProvider  ← état de lecture global (au-dessus de la navigation,
            └── RootNavigator    pour que le MiniPlayer survive aux changements d'onglet)
```

Aucune logique métier ici, aucun écran : c'est un fichier de câblage.

## Quand modifier ce fichier

Ajouter un provider global (thème, auth, etc.) se fait ici, en respectant les
contraintes d'ordre ci-dessus. Un nouvel écran ou une nouvelle feature ne
touche pas à `App.tsx` — il s'accroche dans `src/navigation/RootNavigator.tsx`
ou dans le stack de sa feature.
