# App — instructions pour l'agent

See also [AGENTS.md](AGENTS.md) for stack-specific notes (Expo version, etc.).

## Règle n°1 — Lecture obligatoire avant toute modification de code

Avant de modifier un fichier, tu dois avoir lu le `.md` qui documente le
dossier/module concerné. Cette règle s'applique en cascade :

- Si une tâche te fait toucher un deuxième dossier documenté (même en cours
  de route, même si ce n'était pas prévu au départ), tu t'arrêtes et tu lis
  le `.md` correspondant **avant** de modifier quoi que ce soit dans ce
  dossier.
- Ça s'applique peu importe le nombre de sauts dans une même tâche. Pas
  d'exception pour "modification triviale" ou "je connais déjà ce fichier".
- Tu ne pars jamais du principe qu'un pattern vu dans le code est LA
  convention standard sans l'avoir vérifié dans le `.md` correspondant.

| Tu vas toucher à...                  | Lire d'abord                        |
|---------------------------------------|--------------------------------------|
| Vue d'ensemble / architecture globale | `.claude/docs/overview.md`          |
| `App.tsx`, `index.ts` (app principale)| `.claude/docs/app/overview.md`      |
| `assets/`                             | `.claude/docs/app/assets.md`        |
| `src/db/`, `src/data/`, toute couche repository/service/hook | `.claude/docs/data-layer.md` |
| `src/features/tracks/`, `src/features/playback/` (import, stockage, lecture audio) | `.claude/docs/tracks-audio.md` |
| Design/UI, écrans, palette, style visuel | `.claude/docs/design-reference.md` (référence Figma figée, lecture seule) **et** `.claude/docs/design-implementation.md` (état réel du code, gouverné normalement) |

`Figma Front Inspiration/` (racine du projet) contient l'export Figma Make
source de `design-reference.md`. C'est une référence externe d'inspiration,
jamais du code à reprendre tel quel (c'est du React/Vite/Tailwind web, pas
du React Native) — voir le bandeau en tête de `design-reference.md`.

**Ce tableau fait partie de la documentation à maintenir.** S'il est
incomplet (nouveau dossier documenté absent de la table), obsolète (fichier
renommé/déplacé/supprimé), ou ambigu, c'est une incohérence au même titre que
celles couvertes par la Règle n°2 : tu la signales, et toute correction de ce
CLAUDE.md suit la même procédure de diff + validation que la Règle n°3 — y
compris pour ce fichier lui-même.

La table ci-dessus grossit au fur et à mesure que des modules/dossiers
distincts apparaissent (`albums/`, `playlists/`, enregistrement micro...) —
chacun avec son propre `.md`, proposé et validé au moment où il est créé
(voir Règle n°3), pas à l'avance.

## Règle n°2 — Vigilance continue sur la fidélité doc ↔ code

Tous les fichiers dans `.claude/docs/` sont générés par IA et peuvent être
faux, périmés ou incomplets (voir bandeau en tête de chaque fichier).

- À tout moment — pendant une lecture, une analyse, une modification, peu
  importe la tâche en cours, même si elle n'a rien à voir avec la
  documentation — si tu détectes une incohérence entre un `.md` et le code
  réel, tu la signales immédiatement à Baptiste. Tu ne continues pas comme si
  de rien n'était, et tu ne corriges pas le `.md` toi-même (voir Règle n°3).
- À la fin de chaque tâche qui a modifié du code, tu évalues l'ensemble des
  `.md` potentiellement concernés — pas seulement celui du fichier édité.
  Demande-toi explicitement :
  - Est-ce que ce changement rend un `.md` existant faux ou incomplet ?
  - Est-ce qu'un nouveau sous-module/fichier mériterait désormais son propre
    `.md` ?
  - Est-ce que l'arborescence actuelle de `.claude/docs/` a encore du sens,
    ou faudrait-il la réorganiser ?
- La doc doit être fidèle au code à la fin de chaque tâche — mais "fidèle"
  veut dire proposée et validée par Baptiste, jamais auto-appliquée (voir
  Règle n°3).

## Règle n°3 — Contrôle total de Baptiste sur la documentation

Tu ne modifies, ne crées, ne supprimes ni ne réorganises **jamais** un
fichier dans `.claude/docs/`, ni ce CLAUDE.md lui-même, sans validation
explicite préalable. Aucune exception, même pour une coquille ou une typo
évidente.

- Avant toute écriture dans `.claude/docs/` ou dans ce CLAUDE.md, tu
  présentes à Baptiste :
  1. un diff au format git (`-`/`+` ligne par ligne) du changement proposé
  2. pour les réécritures substantielles ou les créations de fichiers : le
     texte final complet du fichier avant modification

  Pour les changements mineurs (ajout d'une ligne, correction d'un nom, mise
  à jour d'une valeur), le diff seul suffit.

  Ceci s'applique à toute opération : modification de fichier existant,
  création d'un nouveau fichier, réorganisation de l'arborescence
  (déplacement, fusion, scission de fichiers).
- Tu attends une validation explicite avant d'écrire quoi que ce soit.
- Si tu hésites entre "faire confiance au `.md` tel quel" et "le corriger",
  tu poses la question à Baptiste plutôt que de trancher seul — peu importe
  le contexte ou l'évidence apparente.

### Règles générales héritées

- Ne pas inventer ni deviner : en cas de doute sur le code, la documentation,
  une convention ou une intention, **demander**.
- Ne jamais présumer qu'un pattern vu dans le code (y compris du code
  legacy) est LA convention actuelle sans confirmation.

## Règle n°4 — Style de code

- Typage complet obligatoire (props, paramètres, retours, state) — sans
  exception. TypeScript strict.
- Nouveaux commentaires/docstrings en anglais. Les commentaires existants
  dans une autre langue sont conservés tels quels — pas de traduction
  rétroactive.
  - Exception pour les fichiers de tests : commentaires/docstrings dans la
    langue de l'équipe (français) plutôt qu'en anglais.
- Docstrings/JSDoc obligatoires sur les fonctions et composants exportés.
- Après une tâche qui modifie du code : vérifier explicitement si les
  commentaires/docstrings des fichiers touchés sont encore cohérents, et
  proposer une mise à jour si besoin — jamais de correction automatique
  silencieuse.
- Imports précis (symboles nommés) plutôt qu'import complet de module, sauf
  pour les modules très standards importés en entier lorsque c'est l'usage
  idiomatique de la stack (ex: `import * as React`).
- S'inspirer du code existant pour le style ; demander en cas de doute.

## Règle n°5 — Tests : pensés tôt, écrits en dernier

Les scénarios de test peuvent être réfléchis dès la planification, mais tu
n'écris JAMAIS de tests de ta propre initiative. L'écriture de tests est la
toute dernière étape, déclenchée uniquement sur demande explicite.

## Règle n°6 — Pas de suggestions non sollicitées en fin de réponse

Pas de "on pourrait aussi faire X ou Y" ni de question ouverte du type
"qu'est-ce que tu préfères ?" en fin de réponse. La réponse s'arrête sur le
résultat demandé.

- Exception : si Baptiste demande explicitement un avis ou des idées, tu
  réponds normalement.
- Les clarifications réellement bloquantes (ambiguïté de code/doc/intention)
  restent posées — ce n'est pas "ne jamais poser de question", c'est "ne pas
  poser de questions paresseuses en guise de conclusion".

## Règle n°7 — Actions à risque

Toujours confirmer avant les actions difficiles à annuler ou visibles par
d'autres (push, force-push, suppression de branches, etc.).

## Philosophie

Baptiste garde le contrôle, veut comprendre ce qui se passe, et veut que
Claude applique une règle quand il le demande — pas avant, pas en
improvisant une variante. "L'utilisateur réfléchit, l'IA exécute" : éviter de
repousser la décision vers lui par des questions gratuites, tout en
n'agissant jamais au-delà de ce qui a été validé (voir Règle n°3).
