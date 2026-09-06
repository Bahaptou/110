import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import { createTrack, getTracksByArtist, toggleTrackFavorite, type CreateTrackResult } from './service';
import { type Track } from './types';

type UseArtistTracksResult = {
  tracks: Track[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  addTrack: (title: string) => Promise<CreateTrackResult>;
  toggleFavorite: (track: Track) => Promise<void>;
};

export function useArtistTracks(artistId: string): UseArtistTracksResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => getTracksByArtist(database, artistId), [artistId]);
  const { data, loading, error, refresh } = useSqliteQuery(query);

  const addTrack = useCallback(
    async (title: string) => {
      const result = await createTrack(db, artistId, title);
      if (result.ok) {
        await refresh();
      }
      return result;
    },
    [db, artistId, refresh]
  );

  const toggleFavorite = useCallback(
    async (track: Track) => {
      await toggleTrackFavorite(db, track);
      await refresh();
    },
    [db, refresh]
  );

  return { tracks: data ?? [], loading, error, refresh, addTrack, toggleFavorite };
}
