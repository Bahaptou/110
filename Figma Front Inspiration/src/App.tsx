import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Artist = {
  id: string;
  name: string;
  color: string;
};

type Track = {
  id: string;
  title: string;
  artistId: string;
  albumId?: string;
  duration: string;
  favorite: boolean;
};

type Album = {
  id: string;
  title: string;
  artistId: string;
  color: string;
};

type Playlist = {
  id: string;
  title: string;
  trackIds: string[];
  color: string;
};

type Tab = "artists" | "tracks" | "albums" | "playlists";

type NavEntry =
  | { type: "artistDetail"; artistId: string }
  | { type: "albumDetail"; albumId: string }
  | { type: "playlistDetail"; playlistId: string }
  | { type: "player"; trackId: string }
  | { type: "addFriend" }
  | { type: "createPlaylist" }
  | { type: "createAlbum" }
  | { type: "record" }
  | { type: "importTrack" };

// ─── Seed data ────────────────────────────────────────────────────────────────

const ARTIST_COLORS = ["#E8001C", "#FFD600", "#0057FF", "#00C896", "#FF6B00", "#C800E8"];

const INITIAL_ARTISTS: Artist[] = [
  { id: "a1", name: "Marc", color: ARTIST_COLORS[0] },
  { id: "a2", name: "Chloé", color: ARTIST_COLORS[1] },
  { id: "a3", name: "Théo", color: ARTIST_COLORS[2] },
  { id: "a4", name: "Lena", color: ARTIST_COLORS[3] },
  { id: "a5", name: "Bastien", color: ARTIST_COLORS[4] },
  { id: "a6", name: "Julie", color: ARTIST_COLORS[5] },
];

const INITIAL_ALBUMS: Album[] = [
  { id: "al1", title: "Soirées Canapé", artistId: "a1", color: "#E8001C" },
  { id: "al2", title: "Voix du Mardi", artistId: "a2", color: "#FFD600" },
  { id: "al3", title: "Best Of Théo", artistId: "a3", color: "#0057FF" },
  { id: "al4", title: "Rires en Live", artistId: "a4", color: "#00C896" },
  { id: "al5", title: "Bruit de fond", artistId: "a5", color: "#FF6B00" },
];

const INITIAL_TRACKS: Track[] = [
  { id: "t1", title: "Le truc là au ciné", artistId: "a1", albumId: "al1", duration: "0:07", favorite: false },
  { id: "t2", title: "Nan mais attends...", artistId: "a1", albumId: "al1", duration: "0:14", favorite: true },
  { id: "t3", title: "Pff j'sais pas", artistId: "a1", duration: "0:05", favorite: false },
  { id: "t4", title: "C'est trop bon ça", artistId: "a2", albumId: "al2", duration: "0:11", favorite: false },
  { id: "t5", title: "Rire #47", artistId: "a2", albumId: "al2", duration: "0:08", favorite: true },
  { id: "t6", title: "Message vocal 3h du mat", artistId: "a2", duration: "0:29", favorite: false },
  { id: "t7", title: "T'as vu le match ?", artistId: "a3", albumId: "al3", duration: "0:12", favorite: false },
  { id: "t8", title: "Mais non c'est pas moi", artistId: "a3", albumId: "al3", duration: "0:06", favorite: false },
  { id: "t9", title: "Ok ok ok", artistId: "a3", duration: "0:04", favorite: true },
  { id: "t10", title: "Explication catastrophe", artistId: "a4", albumId: "al4", duration: "0:22", favorite: false },
  { id: "t11", title: "Fou rire inedit", artistId: "a4", albumId: "al4", duration: "0:17", favorite: true },
  { id: "t12", title: "Chanson inventée", artistId: "a5", albumId: "al5", duration: "0:09", favorite: false },
  { id: "t13", title: "Bruit de bouche", artistId: "a5", albumId: "al5", duration: "0:03", favorite: false },
  { id: "t14", title: "Julie chante faux", artistId: "a6", duration: "0:15", favorite: true },
  { id: "t15", title: "Imitation réussie", artistId: "a6", duration: "0:11", favorite: false },
];

const ALBUM_COLORS = ["#E8001C", "#FFD600", "#0057FF", "#00C896", "#FF6B00", "#C800E8"];
const PLAYLIST_COLORS = ["#E8001C", "#0057FF", "#FFD600"];

const INITIAL_PLAYLISTS: Playlist[] = [
  { id: "p1", title: "Meilleurs moments", trackIds: ["t2", "t5", "t9", "t11", "t14"], color: PLAYLIST_COLORS[0] },
  { id: "p2", title: "Rires du vendredi", trackIds: ["t5", "t11", "t14", "t1"], color: PLAYLIST_COLORS[1] },
  { id: "p3", title: "À écouter avant de dormir", trackIds: ["t3", "t6", "t13"], color: PLAYLIST_COLORS[2] },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArtistAvatar({ artist, size = 64 }: { artist: Artist; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-sm flex-shrink-0"
      style={{ width: size, height: size, background: artist.color }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: size * 0.32, color: "#000" }}>
        {initials(artist.name)}
      </span>
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "#E8001C" : "none"} stroke={filled ? "#E8001C" : "#888"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function PlayIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function PauseIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  );
}

function PlusIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────

function ArtistsScreen({
  artists,
  tracks,
  onArtist,
  onAddFriend,
}: {
  artists: Artist[];
  tracks: Track[];
  onArtist: (id: string) => void;
  onAddFriend: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
          ARTISTES
        </span>
        <button
          onClick={onAddFriend}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-black text-xs font-semibold"
          style={{ background: "#FFD600", fontFamily: "var(--font-mono)" }}
        >
          <PlusIcon size={14} />
          AMI
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {artists.map((artist) => {
            const count = tracks.filter((t) => t.artistId === artist.id).length;
            return (
              <button
                key={artist.id}
                onClick={() => onArtist(artist.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-sm text-left"
                style={{ background: "#111", border: "1px solid #2a2a2a" }}
              >
                <ArtistAvatar artist={artist} size={80} />
                <div className="w-full">
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13 }}>{artist.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>
                    {count} MORCEAU{count !== 1 ? "X" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ArtistDetail({
  artist,
  tracks,
  albums,
  favorites,
  onTrack,
  onAlbum,
  onFav,
  onBack,
}: {
  artist: Artist;
  tracks: Track[];
  albums: Album[];
  favorites: Set<string>;
  onTrack: (id: string) => void;
  onAlbum: (id: string) => void;
  onFav: (id: string) => void;
  onBack: () => void;
}) {
  const artistTracks = tracks.filter((t) => t.artistId === artist.id);
  const artistAlbums = albums.filter((a) => a.artistId === artist.id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onBack} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>{artist.name.toUpperCase()}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex items-end gap-4 p-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <ArtistAvatar artist={artist} size={88} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20 }}>{artist.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#888", marginTop: 4 }}>
              {artistTracks.length} MORCEAUX · {artistAlbums.length} ALBUM{artistAlbums.length !== 1 ? "S" : ""}
            </div>
          </div>
        </div>
        {/* Albums */}
        {artistAlbums.length > 0 && (
          <div className="px-4 pt-4">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 10, letterSpacing: "1px" }}>
              ALBUMS
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {artistAlbums.map((album) => (
                <button key={album.id} onClick={() => onAlbum(album.id)} className="flex-shrink-0 flex flex-col gap-1">
                  <div className="w-[72px] h-[72px] rounded-sm flex items-center justify-center" style={{ background: "#111", border: "1px solid #2a2a2a" }}>
                    <AlbumCoverInline album={album} />
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, width: 72 }} className="truncate text-left">
                    {album.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Tracks */}
        <div className="px-4 pt-4">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>
            MORCEAUX
          </div>
          {artistTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              isFav={favorites.has(track.id)}
              onPlay={() => onTrack(track.id)}
              onFav={() => onFav(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackRow({
  track,
  index,
  isFav,
  onPlay,
  onFav,
}: {
  track: Track;
  index: number;
  isFav: boolean;
  onPlay: () => void;
  onFav: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid #1a1a1a" }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#555", width: 20, textAlign: "right" }}>
        {index}
      </span>
      <button onClick={onPlay} className="flex-1 text-left">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500 }}>{track.title}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginTop: 2 }}>{track.duration}</div>
      </button>
      <button onClick={onFav} className="p-1">
        <HeartIcon filled={isFav} />
      </button>
    </div>
  );
}

function TracksScreen({
  tracks,
  artists,
  favorites,
  onTrack,
  onFav,
  onImport,
}: {
  tracks: Track[];
  artists: Artist[];
  favorites: Set<string>;
  onTrack: (id: string) => void;
  onFav: (id: string) => void;
  onImport: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
            MORCEAUX
          </span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginTop: 2 }}>
            {tracks.length} SONS
          </div>
        </div>
        <button
          onClick={onImport}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-black text-xs font-semibold"
          style={{ background: "#FFD600", fontFamily: "var(--font-mono)" }}
        >
          <PlusIcon size={14} />
          IMPORTER
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {tracks.map((track) => {
            const artist = artists.find((a) => a.id === track.artistId)!;
            return (
              <button key={track.id} onClick={() => onTrack(track.id)} className="flex flex-col gap-1 text-left">
                <div className="relative w-full aspect-square">
                  <ArtistAvatar artist={artist} size={0} />
                  <div
                    className="w-full h-full rounded-sm flex items-center justify-center"
                    style={{ background: artist.color }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "#000" }}>
                      {initials(artist.name)}
                    </span>
                  </div>
                  {favorites.has(track.id) && (
                    <div className="absolute top-1 right-1">
                      <HeartIcon filled />
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.3 }} className="truncate w-full">
                  {track.title}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#888" }}>{track.duration}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AlbumsScreen({
  albums,
  tracks,
  artists,
  onAlbum,
  onCreate,
}: {
  albums: Album[];
  tracks: Track[];
  artists: Artist[];
  onAlbum: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
            ALBUMS
          </span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginTop: 2 }}>
            {albums.length} ALBUMS
          </div>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-black text-xs font-semibold"
          style={{ background: "#FFD600", fontFamily: "var(--font-mono)" }}
        >
          <PlusIcon size={14} />
          CRÉER
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {albums.map((album) => {
            const artist = artists.find((a) => a.id === album.artistId)!;
            const count = tracks.filter((t) => t.albumId === album.id).length;
            return (
              <button key={album.id} onClick={() => onAlbum(album.id)} className="flex flex-col gap-2 text-left">
                <div
                  className="w-full aspect-square rounded-sm flex items-center justify-center"
                  style={{ background: "#111", border: "1px solid #2a2a2a" }}
                >
                  <AlbumCoverInline album={album} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13 }} className="truncate">
                    {album.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>
                    {artist.name} · {count} SON{count !== 1 ? "S" : ""}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AlbumCoverInline({ album }: { album: Album }) {
  const c = album.color;
  return (
    <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="14" width="40" height="28" rx="2" fill={c} opacity="0.25" />
      <rect x="4" y="18" width="40" height="24" rx="2" fill={c} opacity="0.5" />
      <rect x="4" y="8" width="18" height="6" rx="1" fill={c} opacity="0.7" />
      <rect x="4" y="12" width="40" height="26" rx="2" fill={c} />
      <circle cx="24" cy="25" r="6" fill="#000" opacity="0.4" />
      <circle cx="24" cy="25" r="2" fill="#000" opacity="0.7" />
    </svg>
  );
}

function AlbumDetail({
  album,
  tracks,
  artists,
  favorites,
  onTrack,
  onFav,
  onBack,
}: {
  album: Album;
  tracks: Track[];
  artists: Artist[];
  favorites: Set<string>;
  onTrack: (id: string) => void;
  onFav: (id: string) => void;
  onBack: () => void;
}) {
  const artist = artists.find((a) => a.id === album.artistId)!;
  const albumTracks = tracks.filter((t) => t.albumId === album.id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onBack} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>ALBUM</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-end gap-4 p-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div className="w-20 h-20 rounded-sm flex items-center justify-center" style={{ background: "#111", border: "1px solid #2a2a2a" }}>
            <AlbumCoverInline album={album} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18 }}>{album.title}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#888", marginTop: 4 }}>
              {artist.name} · {albumTracks.length} MORCEAU{albumTracks.length !== 1 ? "X" : ""}
            </div>
          </div>
        </div>
        <div className="px-4 pt-3">
          {albumTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i + 1}
              isFav={favorites.has(track.id)}
              onPlay={() => onTrack(track.id)}
              onFav={() => onFav(track.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlaylistsScreen({
  playlists,
  tracks,
  onPlaylist,
  onCreate,
}: {
  playlists: Playlist[];
  tracks: Track[];
  onPlaylist: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
            PLAYLISTS
          </span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginTop: 2 }}>
            {playlists.length} LISTE{playlists.length !== 1 ? "S" : ""}
          </div>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-1 px-3 py-1 rounded-sm text-black text-xs font-semibold"
          style={{ background: "#FFD600", fontFamily: "var(--font-mono)" }}
        >
          <PlusIcon size={14} />
          CRÉER
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {playlists.map((playlist) => {
            const count = playlist.trackIds.length;
            const c = playlist.color;
            return (
              <button
                key={playlist.id}
                onClick={() => onPlaylist(playlist.id)}
                className="flex items-center gap-3 p-3 rounded-sm"
                style={{ background: "#111", border: "1px solid #2a2a2a" }}
              >
                <div className="w-14 h-14 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: "#1a1a1a" }}>
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="18" fill={c} opacity="0.2" />
                    <circle cx="24" cy="24" r="13" fill={c} opacity="0.4" />
                    <circle cx="24" cy="24" r="8" fill={c} opacity="0.7" />
                    <circle cx="24" cy="24" r="3" fill="#000" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14 }}>{playlist.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginTop: 3 }}>
                    {count} SON{count !== 1 ? "S" : ""}
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlaylistDetail({
  playlist,
  tracks,
  artists,
  favorites,
  onTrack,
  onFav,
  onBack,
}: {
  playlist: Playlist;
  tracks: Track[];
  artists: Artist[];
  favorites: Set<string>;
  onTrack: (id: string) => void;
  onFav: (id: string) => void;
  onBack: () => void;
}) {
  const playlistTracks = playlist.trackIds.map((id) => tracks.find((t) => t.id === id)!).filter(Boolean);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onBack} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>PLAYLIST</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-end gap-4 p-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div className="w-20 h-20 rounded-sm flex items-center justify-center" style={{ background: "#111", border: "1px solid #2a2a2a" }}>
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="18" fill={playlist.color} opacity="0.2" />
              <circle cx="24" cy="24" r="13" fill={playlist.color} opacity="0.4" />
              <circle cx="24" cy="24" r="8" fill={playlist.color} opacity="0.7" />
              <circle cx="24" cy="24" r="3" fill="#000" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18 }}>{playlist.title}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#888", marginTop: 4 }}>
              {playlistTracks.length} SON{playlistTracks.length !== 1 ? "S" : ""}
            </div>
          </div>
        </div>
        <div className="px-4 pt-3">
          {playlistTracks.map((track, i) => {
            const artist = artists.find((a) => a.id === track.artistId)!;
            return (
              <div
                key={track.id}
                className="flex items-center gap-3 py-3"
                style={{ borderBottom: "1px solid #1a1a1a" }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#555", width: 20, textAlign: "right" }}>
                  {i + 1}
                </span>
                <button onClick={() => onTrack(track.id)} className="flex-1 text-left">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 500 }}>{track.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginTop: 2 }}>
                    {artist.name} · {track.duration}
                  </div>
                </button>
                <button onClick={() => onFav(track.id)} className="p-1">
                  <HeartIcon filled={favorites.has(track.id)} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TrackPlayer({
  track,
  artist,
  isPlaying,
  favorites,
  onTogglePlay,
  onFav,
  onBack,
}: {
  track: Track;
  artist: Artist;
  isPlaying: boolean;
  favorites: Set<string>;
  onTogglePlay: () => void;
  onFav: (id: string) => void;
  onBack: () => void;
}) {
  const isFav = favorites.has(track.id);

  return (
    <div className="flex flex-col h-full" style={{ background: "#000" }}>
      {/* Nav */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={onBack} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", letterSpacing: "1px" }}>
          EN LECTURE
        </span>
        <button onClick={() => onFav(track.id)}>
          <HeartIcon filled={isFav} />
        </button>
      </div>
      {/* Big cover */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div
          className="w-full aspect-square rounded-sm flex items-center justify-center"
          style={{ background: artist.color, maxWidth: 280 }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 88, color: "#000", opacity: 0.85 }}>
            {initials(artist.name)}
          </span>
        </div>
        {/* Info */}
        <div className="w-full text-center">
          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, lineHeight: 1.2 }}>
            {track.title}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#888", marginTop: 6 }}>
            {artist.name}
          </div>
        </div>
        {/* Scrubber (fake) */}
        <div className="w-full">
          <div className="w-full h-0.5 rounded-full" style={{ background: "#2a2a2a" }}>
            <div className="h-full rounded-full" style={{ background: "#E8001C", width: "35%" }} />
          </div>
          <div className="flex justify-between mt-2">
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>0:02</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>{track.duration}</span>
          </div>
        </div>
        {/* Controls */}
        <div className="flex items-center gap-8">
          <button className="opacity-40" style={{ color: "#fff" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19,20 9,12 19,4" />
              <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          <button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-16 h-16 rounded-full"
            style={{ background: "#E8001C" }}
          >
            {isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
          </button>
          <button className="opacity-40" style={{ color: "#fff" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,4 15,12 5,20" />
              <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function AddFriendModal({ onAdd, onClose }: { onAdd: (name: string) => void; onClose: () => void }) {
  const [name, setName] = useState("");

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#000", zIndex: 50 }}>
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onClose} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>AJOUTER UN AMI</span>
      </div>
      <div className="flex-1 p-6 flex flex-col gap-6">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>
            PRÉNOM
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Mathieu"
            className="w-full px-3 py-3 rounded-sm text-white outline-none"
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              fontFamily: "var(--font-mono)",
              fontSize: 15,
            }}
          />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>
            PHOTO (optionnel)
          </div>
          <div
            className="w-full h-28 rounded-sm flex flex-col items-center justify-center gap-2"
            style={{ background: "#111", border: "1px dashed #2a2a2a" }}
          >
            <PlusIcon size={24} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#555" }}>IMPORTER UNE PHOTO</span>
          </div>
        </div>
        <button
          onClick={() => { if (name.trim()) { onAdd(name.trim()); } }}
          disabled={!name.trim()}
          className="w-full py-3 rounded-sm font-bold"
          style={{
            background: name.trim() ? "#E8001C" : "#1a1a1a",
            color: name.trim() ? "#fff" : "#555",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            letterSpacing: "1px",
          }}
        >
          AJOUTER AU CATALOGUE
        </button>
      </div>
    </div>
  );
}

function CreatePlaylistModal({
  tracks,
  artists,
  onAdd,
  onClose,
}: {
  tracks: Track[];
  artists: Artist[];
  onAdd: (title: string, trackIds: string[]) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#000", zIndex: 50 }}>
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onClose} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>NOUVELLE PLAYLIST</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>
            NOM
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Rires du dimanche"
            className="w-full px-3 py-3 rounded-sm text-white outline-none"
            style={{
              background: "#111",
              border: "1px solid #2a2a2a",
              fontFamily: "var(--font-mono)",
              fontSize: 15,
            }}
          />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>
            SONS ({selected.size} sélectionné{selected.size !== 1 ? "s" : ""})
          </div>
          {tracks.map((track) => {
            const artist = artists.find((a) => a.id === track.artistId)!;
            const checked = selected.has(track.id);
            return (
              <button
                key={track.id}
                onClick={() => toggle(track.id)}
                className="flex items-center gap-3 w-full py-3"
                style={{ borderBottom: "1px solid #1a1a1a" }}
              >
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ background: checked ? "#E8001C" : "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{track.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>
                    {artist.name} · {track.duration}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4" style={{ borderTop: "1px solid #2a2a2a" }}>
        <button
          onClick={() => { if (title.trim() && selected.size > 0) onAdd(title.trim(), Array.from(selected)); }}
          disabled={!title.trim() || selected.size === 0}
          className="w-full py-3 rounded-sm font-bold"
          style={{
            background: title.trim() && selected.size > 0 ? "#E8001C" : "#1a1a1a",
            color: title.trim() && selected.size > 0 ? "#fff" : "#555",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            letterSpacing: "1px",
          }}
        >
          CRÉER LA PLAYLIST
        </button>
      </div>
    </div>
  );
}

// ─── Record Modal ─────────────────────────────────────────────────────────────

function RecordModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [seconds, setSeconds] = useState(0);

  const start = () => {
    setState("recording");
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    (window as any).__recInterval = id;
  };
  const stop = () => {
    clearInterval((window as any).__recInterval);
    setState("done");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#000", zIndex: 50 }}>
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onClose} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>ENREGISTRER</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8">
        {/* Timer */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 48, fontWeight: 700, letterSpacing: "-2px", color: state === "recording" ? "#E8001C" : "#fff" }}>
          {fmt(seconds)}
        </div>
        {/* Waveform placeholder */}
        <div className="flex items-center gap-1 h-12">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 3,
                height: state === "recording" ? `${12 + Math.abs(Math.sin(i * 0.8 + seconds)) * 28}px` : 8,
                background: state === "recording" ? "#E8001C" : "#2a2a2a",
                transition: "height 0.15s",
              }}
            />
          ))}
        </div>
        {/* Status */}
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#888", letterSpacing: "1px" }}>
          {state === "idle" && "PRÊT À ENREGISTRER"}
          {state === "recording" && "EN COURS..."}
          {state === "done" && "ENREGISTREMENT TERMINÉ"}
        </div>
        {/* Button */}
        {state === "idle" && (
          <button
            onClick={start}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#E8001C" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </button>
        )}
        {state === "recording" && (
          <button
            onClick={stop}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#E8001C" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        )}
        {state === "done" && (
          <div className="flex gap-4">
            <button
              onClick={() => { setState("idle"); setSeconds(0); }}
              className="px-5 py-3 rounded-sm"
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", fontFamily: "var(--font-mono)", fontSize: 13, color: "#fff" }}
            >
              REFAIRE
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-sm"
              style={{ background: "#E8001C", fontFamily: "var(--font-mono)", fontSize: 13, color: "#fff", fontWeight: 700 }}
            >
              SAUVEGARDER
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Import Track Modal ───────────────────────────────────────────────────────

function ImportTrackModal({ artists, onClose }: { artists: Artist[]; onClose: () => void }) {
  const [artistId, setArtistId] = useState(artists[0]?.id ?? "");
  const [title, setTitle] = useState("");

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#000", zIndex: 50 }}>
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onClose} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>IMPORTER UN SON</span>
      </div>
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* File zone */}
        <div
          className="w-full h-32 rounded-sm flex flex-col items-center justify-center gap-2"
          style={{ background: "#111", border: "2px dashed #2a2a2a" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#555" }}>SÉLECTIONNER UN FICHIER</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#333" }}>M4A · MP3 · WAV · AAC</span>
        </div>
        {/* Title */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>TITRE</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Rire du jeudi"
            className="w-full px-3 py-3 rounded-sm text-white outline-none"
            style={{ background: "#111", border: "1px solid #2a2a2a", fontFamily: "var(--font-mono)", fontSize: 15 }}
          />
        </div>
        {/* Artist */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>ARTISTE</div>
          <div className="flex flex-col gap-1">
            {artists.map((a) => (
              <button
                key={a.id}
                onClick={() => setArtistId(a.id)}
                className="flex items-center gap-3 px-3 py-2 rounded-sm"
                style={{
                  background: artistId === a.id ? "#1a1a1a" : "transparent",
                  border: `1px solid ${artistId === a.id ? "#E8001C" : "#2a2a2a"}`,
                }}
              >
                <ArtistAvatar artist={a} size={32} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>{a.name}</span>
                {artistId === a.id && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8001C" strokeWidth="2.5" className="ml-auto">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4" style={{ borderTop: "1px solid #2a2a2a" }}>
        <button
          onClick={onClose}
          disabled={!title.trim()}
          className="w-full py-3 rounded-sm font-bold"
          style={{
            background: title.trim() ? "#E8001C" : "#1a1a1a",
            color: title.trim() ? "#fff" : "#555",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            letterSpacing: "1px",
          }}
        >
          IMPORTER
        </button>
      </div>
    </div>
  );
}

// ─── Create Album Modal ───────────────────────────────────────────────────────

function CreateAlbumModal({
  artists,
  tracks,
  onAdd,
  onClose,
}: {
  artists: Artist[];
  tracks: Track[];
  onAdd: (title: string, artistId: string, trackIds: string[]) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [artistId, setArtistId] = useState(artists[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const artistTracks = tracks.filter((t) => t.artistId === artistId);
  const canSubmit = title.trim() && selected.size > 0;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#000", zIndex: 50 }}>
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #2a2a2a" }}>
        <button onClick={onClose} className="text-white opacity-60 hover:opacity-100">
          <BackIcon />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16 }}>NOUVEL ALBUM</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Title */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>TITRE</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ex. Soirées Canapé vol.2"
            className="w-full px-3 py-3 rounded-sm text-white outline-none"
            style={{ background: "#111", border: "1px solid #2a2a2a", fontFamily: "var(--font-mono)", fontSize: 15 }}
          />
        </div>
        {/* Artist */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>ARTISTE</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {artists.map((a) => (
              <button
                key={a.id}
                onClick={() => { setArtistId(a.id); setSelected(new Set()); }}
                className="flex flex-col items-center gap-1 flex-shrink-0"
              >
                <div
                  className="rounded-sm overflow-hidden"
                  style={{ outline: artistId === a.id ? "2px solid #E8001C" : "2px solid transparent", outlineOffset: 2 }}
                >
                  <ArtistAvatar artist={a} size={48} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: artistId === a.id ? "#E8001C" : "#888" }}>
                  {a.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Tracks */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888", marginBottom: 8, letterSpacing: "1px" }}>
            SONS ({selected.size} sélectionné{selected.size !== 1 ? "s" : ""})
          </div>
          {artistTracks.length === 0 && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#444", paddingTop: 8 }}>
              Pas de sons pour cet artiste
            </div>
          )}
          {artistTracks.map((track) => {
            const checked = selected.has(track.id);
            return (
              <button
                key={track.id}
                onClick={() => toggle(track.id)}
                className="flex items-center gap-3 w-full py-3"
                style={{ borderBottom: "1px solid #1a1a1a" }}
              >
                <div
                  className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0"
                  style={{ background: checked ? "#E8001C" : "#1a1a1a", border: "1px solid #2a2a2a" }}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{track.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>{track.duration}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4" style={{ borderTop: "1px solid #2a2a2a" }}>
        <button
          onClick={() => { if (canSubmit) onAdd(title.trim(), artistId, Array.from(selected)); }}
          disabled={!canSubmit}
          className="w-full py-3 rounded-sm font-bold"
          style={{
            background: canSubmit ? "#E8001C" : "#1a1a1a",
            color: canSubmit ? "#fff" : "#555",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            letterSpacing: "1px",
          }}
        >
          CRÉER L'ALBUM
        </button>
      </div>
    </div>
  );
}

// ─── Mini Player ──────────────────────────────────────────────────────────────

function MiniPlayer({
  track,
  artist,
  isPlaying,
  onTogglePlay,
  onOpen,
}: {
  track: Track;
  artist: Artist;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3"
      style={{
        height: 60,
        background: "#0a0a0a",
        borderTop: "1px solid #2a2a2a",
        borderLeft: "3px solid #FFD600",
      }}
    >
      <button onClick={onOpen} className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: artist.color }}>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "#000" }}>
            {initials(artist.name)}
          </span>
        </div>
        <div className="min-w-0">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500 }} className="truncate">
            {track.title}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888" }}>{artist.name}</div>
        </div>
      </button>
      <button
        onClick={onTogglePlay}
        className="flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
        style={{ background: "#E8001C" }}
      >
        {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
      </button>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: (active: boolean) => JSX.Element }[] = [
  {
    id: "artists",
    label: "ARTISTES",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8001C" : "#555"} strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "tracks",
    label: "MORCEAUX",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8001C" : "#555"} strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "albums",
    label: "ALBUMS",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8001C" : "#555"} strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="3" x2="12" y2="9" />
      </svg>
    ),
  },
  {
    id: "playlists",
    label: "PLAYLISTS",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E8001C" : "#555"} strokeWidth="1.8">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="12" x2="16" y2="12" />
        <line x1="4" y1="18" x2="12" y2="18" />
        <polygon points="18,14 23,17 18,20" fill={active ? "#E8001C" : "#555"} stroke="none" />
      </svg>
    ),
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [tracks] = useState<Track[]>(INITIAL_TRACKS);
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(INITIAL_TRACKS.filter((t) => t.favorite).map((t) => t.id))
  );
  const [activeTab, setActiveTab] = useState<Tab>("artists");
  const [navStack, setNavStack] = useState<NavEntry[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const push = useCallback((entry: NavEntry) => setNavStack((s) => [...s, entry]), []);
  const pop = useCallback(() => setNavStack((s) => s.slice(0, -1)), []);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const playTrack = useCallback((id: string) => {
    const t = tracks.find((t) => t.id === id)!;
    setCurrentTrack(t);
    setIsPlaying(true);
    push({ type: "player", trackId: id });
  }, [tracks, push]);

  const top = navStack[navStack.length - 1];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setNavStack([]);
  };

  const renderScreen = () => {
    if (!top) {
      if (activeTab === "artists")
        return (
          <ArtistsScreen
            artists={artists}
            tracks={tracks}
            onArtist={(id) => push({ type: "artistDetail", artistId: id })}
            onAddFriend={() => push({ type: "addFriend" })}
          />
        );
      if (activeTab === "tracks")
        return (
          <TracksScreen
            tracks={tracks}
            artists={artists}
            favorites={favorites}
            onTrack={playTrack}
            onFav={toggleFav}
            onImport={() => push({ type: "importTrack" })}
          />
        );
      if (activeTab === "albums")
        return (
          <AlbumsScreen
            albums={albums}
            tracks={tracks}
            artists={artists}
            onAlbum={(id) => push({ type: "albumDetail", albumId: id })}
            onCreate={() => push({ type: "createAlbum" })}
          />
        );
      if (activeTab === "playlists")
        return (
          <PlaylistsScreen
            playlists={playlists}
            tracks={tracks}
            onPlaylist={(id) => push({ type: "playlistDetail", playlistId: id })}
            onCreate={() => push({ type: "createPlaylist" })}
          />
        );
    }

    if (top?.type === "artistDetail") {
      const artist = artists.find((a) => a.id === top.artistId)!;
      return (
        <ArtistDetail
          artist={artist}
          tracks={tracks}
          albums={albums}
          favorites={favorites}
          onTrack={playTrack}
          onAlbum={(id) => push({ type: "albumDetail", albumId: id })}
          onFav={toggleFav}
          onBack={pop}
        />
      );
    }

    if (top?.type === "albumDetail") {
      const album = albums.find((a) => a.id === top.albumId)!;
      return (
        <AlbumDetail
          album={album}
          tracks={tracks}
          artists={artists}
          favorites={favorites}
          onTrack={playTrack}
          onFav={toggleFav}
          onBack={pop}
        />
      );
    }

    if (top?.type === "playlistDetail") {
      const playlist = playlists.find((p) => p.id === top.playlistId)!;
      return (
        <PlaylistDetail
          playlist={playlist}
          tracks={tracks}
          artists={artists}
          favorites={favorites}
          onTrack={playTrack}
          onFav={toggleFav}
          onBack={pop}
        />
      );
    }

    if (top?.type === "player") {
      const track = tracks.find((t) => t.id === top.trackId) ?? currentTrack;
      if (!track) return null;
      const artist = artists.find((a) => a.id === track.artistId)!;
      return (
        <TrackPlayer
          track={track}
          artist={artist}
          isPlaying={isPlaying}
          favorites={favorites}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onFav={toggleFav}
          onBack={pop}
        />
      );
    }

    if (top?.type === "addFriend") {
      return (
        <AddFriendModal
          onAdd={(name) => {
            const color = ARTIST_COLORS[artists.length % ARTIST_COLORS.length];
            setArtists((prev) => [...prev, { id: `a${Date.now()}`, name, color }]);
            pop();
          }}
          onClose={pop}
        />
      );
    }

    if (top?.type === "createPlaylist") {
      return (
        <CreatePlaylistModal
          tracks={tracks}
          artists={artists}
          onAdd={(title, trackIds) => {
            const color = PLAYLIST_COLORS[playlists.length % PLAYLIST_COLORS.length];
            setPlaylists((prev) => [...prev, { id: `p${Date.now()}`, title, trackIds, color }]);
            pop();
          }}
          onClose={pop}
        />
      );
    }

    if (top?.type === "createAlbum") {
      return (
        <CreateAlbumModal
          artists={artists}
          tracks={tracks}
          onAdd={(title, artistId, trackIds) => {
            const color = ALBUM_COLORS[albums.length % ALBUM_COLORS.length];
            const albumId = `al${Date.now()}`;
            setAlbums((prev) => [...prev, { id: albumId, title, artistId, color }]);
            pop();
          }}
          onClose={pop}
        />
      );
    }

    if (top?.type === "record") {
      return <RecordModal onClose={pop} />;
    }

    if (top?.type === "importTrack") {
      return <ImportTrackModal artists={artists} onClose={pop} />;
    }

    return null;
  };

  const FULL_SCREEN_MODALS = new Set(["player", "addFriend", "createPlaylist", "createAlbum", "record", "importTrack"]);
  const showTabBar = !top || !FULL_SCREEN_MODALS.has(top.type);
  const showMiniPlayer = currentTrack && top?.type !== "player";

  return (
    <div className="size-full flex items-center justify-center" style={{ background: "#000" }}>
      {/* Mobile frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{ width: 390, height: 844, background: "#000", border: "1px solid #2a2a2a" }}
      >
        {/* Screen area */}
        <div className="flex-1 relative overflow-hidden">
          {renderScreen()}
        </div>

        {/* Mini player */}
        {showMiniPlayer && currentTrack && (
          <MiniPlayer
            track={currentTrack}
            artist={artists.find((a) => a.id === currentTrack.artistId)!}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onOpen={() => push({ type: "player", trackId: currentTrack.id })}
          />
        )}

        {/* Tab bar */}
        {showTabBar && (
          <div
            className="flex items-end"
            style={{ background: "#000", borderTop: "1px solid #2a2a2a", paddingBottom: 8 }}
          >
            {/* Left 2 tabs */}
            {TABS.slice(0, 2).map((tab) => {
              const active = activeTab === tab.id && !top;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1"
                >
                  {tab.icon(active)}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.5px", color: active ? "#E8001C" : "#555" }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
            {/* Mic button — center, raised */}
            <div className="flex flex-col items-center" style={{ width: 72, flexShrink: 0 }}>
              <button
                onClick={() => push({ type: "record" })}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 56,
                  height: 56,
                  background: "#E8001C",
                  marginBottom: 4,
                  marginTop: -18,
                  boxShadow: "0 0 0 4px #000, 0 0 0 5px #2a2a2a",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <rect x="9" y="2" width="6" height="11" rx="3" fill="white" stroke="none" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <line x1="9" y1="21" x2="15" y2="21" />
                </svg>
              </button>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.5px", color: "#555" }}>REC</span>
            </div>
            {/* Right 2 tabs */}
            {TABS.slice(2).map((tab) => {
              const active = activeTab === tab.id && !top;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="flex-1 flex flex-col items-center gap-1 pt-2 pb-1"
                >
                  {tab.icon(active)}
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.5px", color: active ? "#E8001C" : "#555" }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
