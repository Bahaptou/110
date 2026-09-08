> ⚠️ **Généré par IA — peut être faux, périmé ou incomplet.** Ne pas
> considérer comme source de vérité sans vérification. Toute incohérence
> constatée avec le code réel doit être signalée à Baptiste, jamais corrigée
> silencieusement (voir Règle n°2/n°3 dans [CLAUDE.md](../../CLAUDE.md)).

# Chaîne audio

Documente `features/tracks/` (import, stockage, validation) et
`features/playback/` (lecture). Section « pièges » en fin de fichier : ce sont
des bugs réellement rencontrés, pas des précautions théoriques.

## Import d'un son

1. `TracksListScreen.handleImport` — `DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true })`.
2. `audioFormats.checkAudioFormat(name, mimeType)` — valide extension **et**
   type MIME (aucun des deux n'est fiable seul). Formats acceptés : `m4a`,
   `mp4`, `aac`, `mp3`, `wav`. Rejet → alerte, on s'arrête là.
3. Navigation vers `SaveTrackScreen` avec `{ sourceUri, extension, suggestedTitle }`.
4. `useAudioDuration(sourceUri)` charge le fichier via `expo-audio` pour lire
   sa durée sans le jouer. États : `idle` / `loading` / `loaded` / `failed`
   (timeout 8s — un codec indécodable ne bascule jamais `isLoaded`, sans
   timeout l'écran resterait bloqué indéfiniment).
5. La sauvegarde est **bloquée** tant que l'état n'est pas `loaded`.
6. `useCreateTrack.save` → `persistAudioFile` (copie vers le stockage
   permanent) → `createTrack` (insertion DB).

## Stockage

`audioStorage.ts` — les fichiers vivent dans `Paths.document/audio/<trackId>.<ext>`,
**jamais** dans le cache (que le système peut vider). Le `trackId` est généré
par l'appelant (`useCreateTrack`) et non par le service, pour que le nom du
fichier et l'id de la ligne DB correspondent.

## Lecture

`PlaybackProvider` — Context global monté dans `App.tsx`, au-dessus de la
navigation, pour que le `MiniPlayer` survive aux changements d'onglet.

- Un **seul** `useAudioPlayer(null)` partagé ; changer de morceau se fait via
  `player.replace(uri)` puis `player.play()`.
- File d'attente (`queue`) = la liste filtrée affichée au moment du tap, ce qui
  donne son sens à précédent/suivant.
- `stopIfPlaying(trackId)` doit être appelé **avant** de supprimer un morceau.
- `setAudioModeAsync({ playsInSilentMode: true })` au montage : sans ça, iOS
  reste muet quand l'interrupteur silencieux est activé.

### Fin d'un morceau

`status.didJustFinish` déclenche `onFinishRef.current()`, qui :

- **par défaut** (`autoAdvance === false`) rejoue le morceau en boucle
  (`seekTo(0)` puis `play()`). Ce sont des clips courts qu'on reboucle en se
  marrant, pas un album qu'on écoute d'un bout à l'autre.
- **si `autoAdvance` est activé** enchaîne sur le morceau suivant, et revient
  au **premier de la file** après le dernier. Ce bouclage circulaire vit dans
  `onFinishRef` et non dans `playNext()`, parce que le bouton ⏭ manuel reste
  volontairement désactivé en fin de file.

Dans les deux cas **la lecture ne s'arrête jamais d'elle-même** : mettre en
pause est un appui volontaire. `expo-audio` laisse le player parqué à la fin
sans rembobiner, d'où le `seekTo(0)` explicite.

Le bouton du lecteur plein écran bascule entre les deux modes — « BOUCLE »
(jaune) et « LECTURE CONTINUE » (rouge). Aucun des deux n'est un état
« éteint », d'où deux couleurs plutôt qu'un gris désactivé. L'état vit en
mémoire, il n'est pas persisté.

## Pièges rencontrés

- **`File.copy()` est asynchrone** malgré son apparence. L'appeler sans `await`
  faisait enregistrer en base l'URI d'un fichier pas encore écrit → morceaux
  silencieux à 0:00.
- **`File.exists` est une propriété synchrone peu fiable** juste après qu'un
  autre module natif ait écrit le fichier (stat en cache). Utiliser
  `LegacyFileSystem.getInfoAsync()` pour ce cas précis.
- **Expo Go ne sait pas lire les fichiers du cache DocumentPicker**
  (expo/expo #21792) : `copyAsync` et `File.copy()` échouent tous deux avec
  « isn't readable », alors qu'`expo-audio` lit le même fichier sans problème.
  C'est la raison du passage en development build. Un repli base64
  (`readAsStringAsync`/`writeAsStringAsync`) subsiste dans `persistAudioFile`
  au cas où le code retournerait sous Expo Go.
- **`.replace()` sur Android** a des bugs signalés en amont ; c'est malgré tout
  le pattern recommandé par Expo, et il fonctionne ici.

## Pas encore fait

- Enregistrement micro (bouton central de la tab bar) — visuel uniquement.
- Suppression des fichiers audio orphelins quand un artiste est supprimé en
  cascade (les lignes `tracks` partent, les fichiers restent sur le disque).
