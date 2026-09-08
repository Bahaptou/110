> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../CLAUDE.md)).

# Couche de données

Pattern appliqué à chaque feature (`artists/`, `tracks/`, et à répliquer pour
`albums/`/`playlists/`). Inspiré de la séparation en couches de
worldtradefinance4, adaptée au SQLite local.

## Les couches, de bas en haut

| Fichier | Rôle | Ne fait jamais |
|---|---|---|
| `types.ts` | Forme métier de l'entité (dérivée de `db/schema.ts`) | — |
| `repository.ts` | SQL brut, mapping ligne → objet | Aucune logique métier |
| `service.ts` | Logique métier, validations, orchestration | Ne parle jamais à l'UI |
| `useXxx.ts` | État React, expose `{ data, loading, error, refresh }` | Ne fait pas de SQL |
| `screens/` | Rendu, interactions | N'appelle jamais un repository |

**Règle qui compte le plus** : une couche ne saute jamais celle du dessous.
L'UI n'accède jamais directement au repository, toujours via le service.

## `db/`

- `schema.ts` — source de vérité des tables. `SCHEMA_STATEMENTS` (CREATE TABLE
  IF NOT EXISTS) + `MIGRATION_STATEMENTS` (ALTER TABLE pour les colonnes
  ajoutées après coup, car `CREATE TABLE IF NOT EXISTS` est un no-op sur une
  base existante). Les types `XxxRow` reflètent exactement les colonnes.
- `client.ts` — `migrateDatabase()` : active `PRAGMA foreign_keys = ON`
  (sinon SQLite ignore `ON DELETE CASCADE`), joue le schéma puis les
  migrations en avalant les erreurs « duplicate column ».

## `data/`

- `queryError.ts` — `QueryError` : union discriminée
  (`not_found` / `constraint` / `unknown`) avec message utilisateur. Les
  erreurs sont des **valeurs**, jamais des exceptions qui s'échappent d'un hook.
- `useSqliteQuery.ts` — point de normalisation unique des lectures SQLite.
  Expose `{ data, loading, error, refresh, setData }`, refetch au focus de
  l'écran (React Navigation garde les écrans montés).

`setData` permet les **mises à jour optimistes** : un simple toggle (favori)
met à jour l'état local sans `refresh()` complet, qui ferait clignoter
« Chargement » sur toute la liste.

## Erreurs

- Erreur métier attendue → valeur de retour typée
  (ex. `CreateTrackResult = { ok: true, ... } | { ok: false, error: 'empty_title' }`).
- Erreur d'accès fichier → `AudioSourceUnreadableError` (voir
  [tracks-audio.md](tracks-audio.md)), catchée par l'écran appelant.
- Bug de rendu inattendu → `ErrorBoundary` racine (filet de sécurité, ne
  couvre pas l'async).
