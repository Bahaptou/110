> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../../CLAUDE.md)).

# App — vue d'ensemble

Documente `index.ts` et `App.tsx`, le cœur applicatif actuel.

## `index.ts`

Point d'entrée : enregistre `App` comme composant racine auprès d'Expo/React
Native (`registerRootComponent` ou équivalent — vérifier le contenu exact
avant de s'y fier, ce fichier n'a pas encore été audité en détail).

## `App.tsx`

Composant racine unique. Pas encore de sous-composants extraits, pas de
routing.

## Quand modifier ce fichier

Si `App.tsx` est scindé en plusieurs composants, ou si de la navigation est
introduite, cette doc doit être mise à jour (ou éclatée en plusieurs `.md`
sous `.claude/docs/app/`) — proposer le changement avant de l'appliquer.
