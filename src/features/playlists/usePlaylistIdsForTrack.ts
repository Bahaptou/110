import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { useSqliteQuery } from '../../data/useSqliteQuery';
import { getPlaylistIdsForTrack } from './service';

type UsePlaylistIdsForTrackResult = {
  playlistIds: string[];
  loading: boolean;
};

/** Which playlists a given track is in — a track can belong to several at once. */
export function usePlaylistIdsForTrack(trackId: string): UsePlaylistIdsForTrackResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => getPlaylistIdsForTrack(database, trackId), [trackId]);
  const { data, loading } = useSqliteQuery(query);

  return { playlistIds: data ?? [], loading };
}
