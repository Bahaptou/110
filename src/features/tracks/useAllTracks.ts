import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import { listAllTracks } from './repository';
import { changeTrackArtist, removeTrack, toggleTrackFavorite } from './service';
import { type Track } from './types';

type UseAllTracksResult = {
  tracks: Track[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
  changeArtist: (track: Track, artistId: string) => Promise<void>;
  deleteTrack: (track: Track) => Promise<void>;
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
      setData((current) => current?.map((t) => (t.id === track.id ? { ...t, artistId } : t)) ?? current);
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

  return { tracks: data ?? [], loading, error, refresh, toggleFavorite, changeArtist, deleteTrack: deleteTrackAction };
}
