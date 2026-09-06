import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import { createArtist, getArtists, removeArtist, type CreateArtistResult } from './service';
import { type Artist } from './types';

type UseArtistsResult = {
  artists: Artist[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  addArtist: (name: string) => Promise<CreateArtistResult>;
  deleteArtist: (artistId: string) => Promise<void>;
};

export function useArtists(): UseArtistsResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => getArtists(database), []);
  const { data, loading, error, refresh } = useSqliteQuery(query);

  const addArtist = useCallback(
    async (name: string) => {
      const result = await createArtist(db, name);
      if (result.ok) {
        await refresh();
      }
      return result;
    },
    [db, refresh]
  );

  const deleteArtist = useCallback(
    async (artistId: string) => {
      await removeArtist(db, artistId);
      await refresh();
    },
    [db, refresh]
  );

  return { artists: data ?? [], loading, error, refresh, addArtist, deleteArtist };
}
