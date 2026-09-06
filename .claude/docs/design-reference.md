> 🧊 **Référence externe figée — pas une doc générée sur ce code.**
> Snapshot de l'inspiration Figma Make transcrit une fois. Ne pas modifier à
> la main ; ne remplacer qu'en cas de nouvel export fourni par Baptiste. Ceci
> est de l'**inspiration à traduire**, jamais du code à reprendre tel quel —
> le prototype est web (React/Vite/Tailwind), pas React Native. Pour l'état
> réel de l'implémentation côté app, voir
> [design-implementation.md](design-implementation.md), qui lui suit la
> gouvernance normale (Règles 1-3 du [CLAUDE.md](../../CLAUDE.md)).

# Design reference — Figma Make export ("Figma Front Inspiration")

Source : dossier `Figma Front Inspiration/` à la racine du projet (export
Figma Make généré depuis `Figma Front Inspiration/plans/brief-figma-abundant-boot.md`).
Transcrit le 2026-09-06.

## Concept produit

Bibliothèque de sons enregistrés/importés de proches, structurée comme une
bibliothèque musicale (logique iTunes/iPod) :
- **Artiste** = un ami ajouté au catalogue.
- **Morceau (track)** = un son (memo vocal court, 3-30s).
- **Album** = regroupement de morceaux d'un même artiste.
- **Playlist** = regroupement libre de morceaux, tous artistes confondus.

Ton : fonctionnel et dense comme un vrai lecteur de musique, avec un second
degré discret dans le fait de traiter des blagues/rires de potes comme un
catalogue sérieux (ex: bouton "AJOUTER AU CATALOGUE", morceaux titrés
"Pff j'sais pas" ou "Nan mais attends...").

## Palette

| Token | Valeur | Usage |
|---|---|---|
| background | `#000000` | fond général |
| foreground | `#ffffff` | texte principal |
| card | `#111111` | fond des tuiles/cartes |
| primary | `#E8001C` (rouge) | CTA primaire, onglet actif, favoris, lecture |
| accent | `#FFD600` (jaune) | boutons d'action secondaires ("+ AMI", "+ IMPORTER", "+ CRÉER"), barre "en lecture" |
| muted | `#1a1a1a` | séparateurs internes de liste |
| muted-foreground | `#888888` | texte secondaire, labels |
| border | `#2a2a2a` | hairlines 1px |

Pool de couleurs pour artistes/albums/playlists (assignation déterministe à
la création) : `#E8001C` rouge, `#FFD600` jaune, `#0057FF` bleu, `#00C896`
vert, `#FF6B00` orange, `#C800E8` violet.

## Typographie

| Style | Font | Usage |
|---|---|---|
| Display/labels/nombres | JetBrains Mono | titres d'écran, noms, durées, compteurs — souvent en majuscules avec letter-spacing |
| Body/UI (prévu) | Inter | texte courant — **note** : dans le prototype observé, le mono est utilisé quasi partout, Inter très peu présent malgré le brief d'origine |

## Formes

- Rayon quasi nul : 4px sur les tuiles, 2px sur les boutons. Pas d'arrondi généreux.
- Bordures hairline 1px, pas d'ombres portées.

## Pochettes par défaut

- **Artiste** : carré de couleur pleine (couleur assignée) avec ses
  initiales en grand, mono, noir sur couleur.
- **Album** : icône SVG "pochette/dossier" tintée de la couleur de l'album.
- **Playlist** : icône SVG "disques empilés" tintée.
- **Morceau** : hérite de la pochette de son artiste par défaut, overridable
  par une image custom (mentionné dans le brief, pas implémenté dans ce
  prototype).

## Architecture d'écrans

Navigation par 4 onglets fixes en bas + pile de navigation pour le
drill-down (logique iTunes classique) :

- **Artistes** — grille 2 colonnes (pochette + nom + nb de morceaux).
  Bouton "+ AMI". → **ArtistDetail** (header + albums en scroll horizontal +
  liste de morceaux numérotée).
- **Morceaux** — grille 3 colonnes dense de pochettes. Bouton "+ IMPORTER".
- **Albums** — grille 2 colonnes de pochettes d'album. Bouton "+ CRÉER". →
  **AlbumDetail** (header + liste numérotée).
- **Playlists** — liste verticale (icône + nom + nb de sons + chevron).
  Bouton "+ CRÉER". → **PlaylistDetail**.

Écrans plein-écran additionnels (poussés sur la pile de nav) :
- **TrackPlayer** — pochette géante, titre, artiste, scrubber, contrôles
  précédent/lecture-pause/suivant, cœur favori.
- **MiniPlayer** — barre fine (60px) au-dessus de la tab bar quand un
  morceau est actif : pochette mini, titre/artiste, lecture/pause, bordure
  gauche jaune 3px. Tap → rouvre le TrackPlayer.
- **AddFriendModal** — prénom + photo optionnelle.
- **ImportTrackModal** — zone de dépôt fichier (M4A/MP3/WAV/AAC) + titre +
  sélection d'artiste.
- **RecordModal** — chrono + waveform animée, cycle idle → recording → done.
- **CreatePlaylistModal** / **CreateAlbumModal** — nom + sélection de
  morceaux (checklist), scopée par artiste pour un album.

## Éléments d'interaction

- Favori : cœur contour gris vide / rouge plein rempli.
- Retour : chevron gauche en haut à gauche sur tous les écrans de détail.
- Compteurs en toutes lettres, majuscules mono : "X MORCEAUX", "X ALBUM(S)",
  "X SON(S)".

## Ce que ce prototype N'EST PAS

- Pas une vraie app mobile : shell web simulé (viewport 390px sur canvas
  Figma Make), pas de Safe Area, pas de gestes natifs.
- Pas de vrai lecteur audio : le player est simulé en state React, aucun
  élément audio réel.
- Pas de vraie gestion d'enregistrement/import : mock uniquement.
- Écrit en Tailwind CSS + styles inline JS — non transposable tel quel, RN
  n'a pas de DOM/Tailwind.
