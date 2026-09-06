> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../CLAUDE.md)).

# Design implementation status (React Native)

État réel de ce qui est implémenté côté app React Native, par rapport à la
référence figée [design-reference.md](design-reference.md). Ce fichier suit
la gouvernance normale : lecture obligatoire avant de toucher aux
composants UI concernés, diff + validation avant toute modification.

## État actuel

Tab bar à 4 onglets en place (Artistes fonctionnel, Morceaux/Albums/Playlists
en `PlaceholderScreen`). Slice vertical complet pour Artistes + une version
minimale de Tracks (titre + favori, pas d'audio réel).

## Palette — implémentée en styles inline (`StyleSheet.create` par écran)

Pas de fichier de tokens partagé — chaque écran redéfinit `#000`, `#111`,
`#E8001C`, `#FFD600`, `#2a2a2a`, `#888` en dur. Fonctionne mais dupliqué ;
envisager un `src/theme.ts` si la duplication devient gênante.

## Typographie — pas encore tranchée

JetBrains Mono / Inter non chargées. Tous les écrans utilisent la police
système avec `fontWeight`. Question ouverte du prototype toujours pas
tranchée avec Baptiste.

## Écrans

| Écran (référence) | Composant RN réel | État |
|---|---|---|
| Artistes | `features/artists/screens/ArtistsListScreen.tsx` | fait |
| Ajouter un ami | `features/artists/screens/AddArtistScreen.tsx` | fait |
| ArtistDetail | `features/artists/screens/ArtistDetailScreen.tsx` | fait (liste de morceaux + favori + ajout de son par titre) |
| Morceaux (onglet) | `PlaceholderScreen` | pas commencé |
| Albums / AlbumDetail | `PlaceholderScreen` | pas commencé |
| Playlists / PlaylistDetail | `PlaceholderScreen` | pas commencé |
| TrackPlayer | — | pas commencé |
| MiniPlayer | — | pas commencé |
| ImportTrackModal | — | pas commencé |
| RecordModal | — | pas commencé |
| CreatePlaylistModal / CreateAlbumModal | — | pas commencé |

## Écarts connus avec la référence

- **Rayon des bords** : la référence prévoit un rayon quasi nul (4px
  tuiles, 2px boutons). Sur demande explicite de Baptiste (2026-09-06),
  l'implémentation utilise un rayon prononcé (~16-20px) à la place — écart
  assumé, pas un oubli. Si de nouveaux écrans sont ajoutés, aligner sur ce
  rayon prononcé plutôt que sur la référence Figma d'origine.
- **Ajout de morceau** : dans la référence, l'ajout se fait par
  enregistrement micro ou import de fichier (RecordModal/ImportTrackModal).
  L'implémentation actuelle n'a qu'un champ texte (titre) sans audio réel —
  RecordModal/ImportTrackModal restent à construire.
- Le prototype Figma Make n'a ni vrai lecteur audio ni vraie gestion
  d'enregistrement/permissions micro — ces briques restent à concevoir
  entièrement côté RN/Expo, la référence ne donne que l'UI/UX cible.
