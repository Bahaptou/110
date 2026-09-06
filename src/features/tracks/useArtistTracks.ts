import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import { getTracksByArtist, toggleTrackFavorite } from './service';
import { type Track } from './types';

type UseArtistTracksResult = {
  tracks: Track[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
};

export function useArtistTracks(artistId: string): UseArtistTracksResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => getTracksByArtist(database, artistId), [artistId]);
  const { data, loading, error, refresh } = useSqliteQuery(query);

  const toggleFavorite = useCallback(
    async (track: Track) => {
      await toggleTrackFavorite(db, track);
      await refresh();
    },
    [db, refresh]
  );

  return { tracks: data ?? [], loading, error, refresh, toggleFavorite };
}
