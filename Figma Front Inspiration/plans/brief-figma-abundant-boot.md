# Plan — Sound Library App ("iTunes pour les potes")

## Context

Build a full mobile sound-library app in `src/App.tsx`. Friends are artists, voice memos are tracks, albums and playlists group them — exact iTunes/iPod logic, with a quietly satirical tone. The app is a Figma Make preview (not React Native yet), so we target a mobile viewport (390px wide) centered in the canvas, with a tab bar at the bottom.

## Stance & Visual Language

**Swiss functional** — strict grid, dense cover-art tiles, monospace display type as a wink at treating voice memos as serious catalog entries.

- **Display / Labels:** JetBrains Mono (Google Fonts) — numbers, titles, track counts, durations
- **Body / UI:** Inter (Google Fonts)
- **Ground:** True black `#000` with white text; cards `#111`
- **Accents:** Red `#E8001C` (primary CTA, active tab, favorites) · Yellow `#FFD600` (secondary highlight, "Now Playing" bar)
- **Borders:** 1px `#2a2a2a` hairlines
- **Radius:** 4px tiles, 2px buttons — almost none

## Mock Data

6 friends (artists): Marc, Chloé, Théo, Lena, Bastien, Julie
Each has 2–5 tracks, some grouped in albums. 3 playlists (e.g. "Meilleurs moments", "Rires du vendredi", "À écouter avant de dormir").

## File Changes

### `src/index.css`
- Add Google Fonts `@import` for JetBrains Mono + Inter at the very top (before `@import 'tailwindcss'`)
- Add Tailwind v4 `@theme` tokens: background, foreground, card, primary (red), accent (yellow), border, etc.
- Add `font-family` default on `body` to Inter
- Hide scrollbars globally

### `src/App.tsx`
Single file, ~600–800 lines. All state in React (`useState`). Structure:

```
<MobileShell>
  <Screen />        ← rendered based on activeTab + navigation stack
  <MiniPlayer />    ← bottom bar above tab bar, visible when a track is "playing"
  <TabBar />        ← 4 tabs: Artistes · Morceaux · Albums · Playlists
</MobileShell>
```

#### Navigation model
`activeTab` (artists|tracks|albums|playlists) + `navStack` array for drill-down:
- Artists → ArtistDetail (tracks + albums for that artist)
- Albums → AlbumDetail (track list)
- Playlists → PlaylistDetail + CreatePlaylist modal
- Tracks → TrackPlayer (full-screen player)
- Any track tile → TrackPlayer

#### Screens to implement
1. **ArtistsScreen** — 2-col grid of artist cards (avatar placeholder + name + track count)
2. **ArtistDetail** — artist header (big avatar, name, counts) + track list rows + mini album grid
3. **TracksScreen** — 3-col dense grid of track covers (track name under each)
4. **AlbumsScreen** — 2-col grid of album covers (colored folder icon default)
5. **AlbumDetail** — album header + numbered track list
6. **PlaylistsScreen** — list of playlists + "+" button to create
7. **PlaylistDetail** — track list for a playlist
8. **CreatePlaylistModal** — name input + track selector
9. **TrackPlayer** — full-screen: big cover, title, artist, ▶/⏸, ♥ favorite toggle, scrubber (fake), back
10. **AddFriendModal** — name + "upload photo" placeholder

#### Key interactions (React state only, no audio)
- Tap track → open TrackPlayer, set `currentTrack`, show MiniPlayer
- MiniPlayer tap → re-open TrackPlayer
- ♥ favorite toggle (heart icon, red when active)
- Tab switching
- Back navigation (pop navStack)
- Create playlist (name + select tracks from checklist)
- Add friend (name input, random color avatar)

#### Default cover art
- Artist: colored circle with initials (generated from name + deterministic hue)
- Album: SVG folder icon tinted with a deterministic color from album id
- Playlist: SVG stacked-discs icon similarly colored
- Track: inherits artist cover by default, overridable

#### MiniPlayer
- Thin bar (64px) above TabBar, black bg, yellow left border
- Track name (JetBrains Mono), artist, ▶/⏸ button (red), progress dot

## Fonts

```css
/* src/index.css — top of file */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
```

## Token Block (Tailwind v4 @theme inline)

```css
@theme inline {
  --color-background: #000000;
  --color-foreground: #ffffff;
  --color-card: #111111;
  --color-card-foreground: #ffffff;
  --color-primary: #E8001C;
  --color-primary-foreground: #ffffff;
  --color-accent: #FFD600;
  --color-accent-foreground: #000000;
  --color-muted: #1a1a1a;
  --color-muted-foreground: #888888;
  --color-border: #2a2a2a;
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Inter', sans-serif;
}
```

## Verification

1. Preview renders a ~390px mobile shell centered on the canvas
2. All 4 tabs switch without error
3. Tapping a track opens full-screen player; MiniPlayer appears
4. Favorite toggle persists while navigating
5. Create playlist flow works end-to-end
6. Add friend adds a new artist card to ArtistsScreen
7. No console errors
