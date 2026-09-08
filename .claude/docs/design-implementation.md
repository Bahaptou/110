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

Tab bar à 5 slots (Artistes, Morceaux, bouton micro central, Albums,
Playlists). Artistes et Morceaux sont complets, avec un vrai lecteur audio
global. Albums/Playlists sont des `PlaceholderScreen`, le bouton micro est
visuel uniquement.

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
| Artistes | `features/artists/screens/ArtistsListScreen.tsx` | fait (grille 2 colonnes, recherche, mode édition jiggle + suppression) |
| Ajouter un ami | `features/artists/screens/AddArtistScreen.tsx` + `AddArtistForm.tsx` | fait |
| ArtistDetail | `features/artists/screens/ArtistDetailScreen.tsx` | fait (pochette stretch au pull, recherche, liste de morceaux + favori) |
| Morceaux (onglet) | `features/tracks/screens/TracksListScreen.tsx` | fait (liste détaillée, recherche, import, menu ⋯) |
| ImportTrackModal | `features/tracks/screens/SaveTrackScreen.tsx` | fait (titre + choix d'artiste, validation format/durée) |
| MiniPlayer | `features/playback/MiniPlayer.tsx` | fait (visible sur tous les onglets, au-dessus de la tab bar) |
| TrackPlayer | `features/playback/PlayerScreen.tsx` | fait (pochette, scrubber, précédent/suivant, swipe-down pour réduire) |
| Albums / AlbumDetail | `PlaceholderScreen` | pas commencé |
| Playlists / PlaylistDetail | `PlaceholderScreen` | pas commencé |
| RecordModal | — | pas commencé (bouton micro central visuel uniquement) |
| CreatePlaylistModal / CreateAlbumModal | — | pas commencé |

Écrans hors référence Figma, ajoutés en cours de route :

| Écran | Composant | Rôle |
|---|---|---|
| Menu d'actions d'un morceau | `features/tracks/TrackActionsSheet.tsx` | bottom sheet ⋯ : changer d'artiste, supprimer (Album/Playlist grisés) |
| Changer d'artiste | `features/tracks/screens/ChangeTrackArtistScreen.tsx` | écran plein (une version en sheet flottante s'est avérée instable) |

## Écarts connus avec la référence

- **Rayon des bords** : la référence prévoit un rayon quasi nul (4px
  tuiles, 2px boutons). Sur demande explicite de Baptiste (2026-09-06),
  l'implémentation utilise un rayon prononcé (~16-20px) à la place — écart
  assumé, pas un oubli. Si de nouveaux écrans sont ajoutés, aligner sur ce
  rayon prononcé plutôt que sur la référence Figma d'origine.
- **Morceaux en liste, pas en grille** : la référence montre une grille 3
  colonnes de pochettes ; l'implémentation utilise une liste détaillée
  (demande de Baptiste, 2026-09-08).
- **Bouton micro dans la tab bar** : la référence n'a pas de bouton central ;
  l'implémentation ajoute un bouton rond rouge proéminent en 5e slot
  (pattern Instagram/TikTok) comme point d'entrée de l'enregistrement.
- **Interactions ajoutées** : pull-to-stretch sur les en-têtes, mode édition
  « jiggle » iOS pour la suppression, swipe-down sur le lecteur plein écran —
  absents de la référence, ajoutés à la demande.
- Le prototype Figma Make n'a ni vrai lecteur audio ni vraie gestion
  d'enregistrement/permissions micro — la référence ne donne que l'UI/UX
  cible. Pour l'implémentation réelle, voir
  [tracks-audio.md](tracks-audio.md).
