import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import { listAllTracks } from './repository';
import { type Album } from '../albums/types';
import {
  changeTrackAlbum,
  changeTrackArtist,
  changeTrackImage,
  removeTrack,
  renameTrack,
  toggleTrackFavorite,
  type ChangeTrackAlbumResult,
  type RenameTrackResult,
} from './service';
import { type Track } from './types';

type UseAllTracksResult = {
  tracks: Track[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
  changeArtist: (track: Track, artistId: string) => Promise<void>;
  deleteTrack: (track: Track) => Promise<void>;
  setImage: (track: Track, imageUri: string) => Promise<void>;
  rename: (track: Track, title: string) => Promise<RenameTrackResult>;
  changeAlbum: (track: Track, album: Album | null) => Promise<ChangeTrackAlbumResult>;
};

/** All tracks across every artist — backs the "Morceaux" tab, as opposed to useArtistTracks which scopes to one artist. */
export function useAllTracks(): UseAllTracksResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => listAllTracks(database), []);
  const { data, loading, error, refresh, setData } = useSqliteQuery(query);

  const toggleFavorite = useCallback(
    async (track: Track) => {
      // Optimistic local update — a full refresh() here would flash "loading" across the whole grid
      // for what's just a boolean flip (see the flicker bug this fixed).
      setData((current) =>
        current?.map((t) => (t.id === track.id ? { ...t, isFavorite: !t.isFavorite } : t)) ?? current
      );
      await toggleTrackFavorite(db, track);
    },
    [db, setData]
  );

  const changeArtist = useCallback(
    async (track: Track, artistId: string) => {
      // The album goes with it: albums belong to one artist, so the old one can't apply any more.
      setData(
        (current) => current?.map((t) => (t.id === track.id ? { ...t, artistId, albumId: null } : t)) ?? current
      );
      await changeTrackArtist(db, track.id, artistId);
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
    changeArtist,
    deleteTrack: deleteTrackAction,
    setImage,
    rename,
    changeAlbum,
  };
}
