import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { toQueryError, type QueryError } from './queryError';

type UseSqliteQueryResult<T> = {
  data: T | null;
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
};

/**
 * Single normalization point for reading from SQLite in a screen. Mirrors the shape of useApiRel():
 * errors never escape as exceptions, they're exposed as state alongside data/loading. Refetches
 * whenever the owning screen regains focus, since React Navigation keeps screens mounted.
 */
export function useSqliteQuery<T>(query: (db: SQLiteDatabase) => Promise<T>): UseSqliteQueryResult<T> {
  const db = useSQLiteContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<QueryError | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await query(db));
      setError(null);
    } catch (cause) {
      setError(toQueryError(cause));
    } finally {
      setLoading(false);
    }
  }, [db, query]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { data, loading, error, refresh };
}
