import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import { type Album } from '../albums/types';
import { getPlaylistTracks } from '../playlists/service';
import {
  changeTrackAlbum,
  changeTrackImage,
  getTracksByAlbum,
  getTracksByArtist,
  removeTrack,
  renameTrack,
  toggleTrackFavorite,
  type ChangeTrackAlbumResult,
  type RenameTrackResult,
} from './service';
import { type Track } from './types';

type UseScopedTracksResult = {
  tracks: Track[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
  deleteTrack: (track: Track) => Promise<void>;
  setImage: (track: Track, imageUri: string) => Promise<void>;
  rename: (track: Track, title: string) => Promise<RenameTrackResult>;
  changeAlbum: (track: Track, album: Album | null) => Promise<ChangeTrackAlbumResult>;
};

/** Which subset of the library a scoped track list covers. */
export type TrackScope =
  | { by: 'artist'; artistId: string }
  | { by: 'album'; albumId: string }
  | { by: 'playlist'; playlistId: string };

function scopeKeyOf(scope: TrackScope): string {
  if (scope.by === 'artist') return scope.artistId;
  if (scope.by === 'album') return scope.albumId;
  return scope.playlistId;
}

/**
 * Tracks for one artist, album or playlist, with the same mutations in every case. They differ only
 * in the query, so they share a hook rather than duplicating every optimistic update.
 */
export function useScopedTracks(scope: TrackScope): UseScopedTracksResult {
  const db = useSQLiteContext();
  const scopeKey = scopeKeyOf(scope);
  const query = useCallback(
    (database: typeof db) => {
      if (scope.by === 'artist') return getTracksByArtist(database, scopeKey);
      if (scope.by === 'album') return getTracksByAlbum(database, scopeKey);
      return getPlaylistTracks(database, scopeKey);
    },
    [scope.by, scopeKey]
  );
  const { data, loading, error, refresh, setData } = useSqliteQuery(query);

  const toggleFavorite = useCallback(
    async (track: Track) => {
      // Optimistic local update — a full refresh() would flash "loading" over the whole list for
      // what's just a boolean flip.
      setData((current) =>
        current?.map((t) => (t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t)) ?? current
      );
      await toggleTrackFavorite(db, track);
    },
    [db, setData]
  );

  const deleteTrackAction = useCallback(
    async (track: Track) => {
      setData((current) => current?.filter((t) => t.id !== track.id) ?? current);
      await removeTrack(db, track);
    },
    [db, setData]
  );

  const setImage = useCallback(
    async (track: Track, imageUri: string) => {
      setData((current) => current?.map((t) => (t.id === track.id ? { ...t, imageUri } : t)) ?? current);
      await changeTrackImage(db, track, imageUri);
    },
    [db, setData]
  );

  const rename = useCallback(
    async (track: Track, title: string) => {
      const result = await renameTrack(db, track.id, title);
      if (result.ok) {
        setData((current) => current?.map((t) => (t.id === track.id ? { ...t, title: title.trim() } : t)) ?? current);
      }
      return result;
    },
    [db, setData]
  );

  const changeAlbum = useCallback(
    async (track: Track, album: Album | null) => {
      const result = await changeTrackAlbum(db, track, album);
      if (result.ok) {
        setData(
          (current) => current?.map((t) => (t.id === track.id ? { ...t, albumId: album?.id ?? null } : t)) ?? current
        );
      }
      return result;
    },
    [db, setData]
  );

  return {
    tracks: data ?? [],
    loading,
    error,
    refresh,
    toggleFavorite,
    deleteTrack: deleteTrackAction,
    setImage,
    rename,
    changeAlbum,
  };
}

export function useArtistTracks(artistId: string): UseScopedTracksResult {
  return useScopedTracks({ by: 'artist', artistId });
}

export function useAlbumTracks(albumId: string): UseScopedTracksResult {
  return useScopedTracks({ by: 'album', albumId });
}

export function usePlaylistTracks(playlistId: string): UseScopedTracksResult {
  return useScopedTracks({ by: 'playlist', playlistId });
}
