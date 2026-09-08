import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import {
  addTrack,
  changePlaylistImage,
  createPlaylist,
  getPlaylists,
  removePlaylist,
  removeTrack,
  renamePlaylist,
  type CreatePlaylistResult,
  type NewPlaylistInput,
  type RenamePlaylistResult,
} from './service';
import { type Playlist } from './types';

type UsePlaylistsResult = {
  playlists: Playlist[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  addPlaylist: (input: NewPlaylistInput) => Promise<CreatePlaylistResult>;
  deletePlaylist: (playlist: Playlist) => Promise<void>;
  setImage: (playlist: Playlist, imageUri: string) => Promise<void>;
  rename: (playlist: Playlist, name: string) => Promise<RenamePlaylistResult>;
  addTrackTo: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFrom: (playlistId: string, trackId: string) => Promise<void>;
};

export function usePlaylists(): UsePlaylistsResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => getPlaylists(database), []);
  const { data, loading, error, refresh, setData } = useSqliteQuery(query);

  const addPlaylist = useCallback(
    async (input: NewPlaylistInput) => {
      const result = await createPlaylist(db, input);
      if (result.ok) {
        await refresh();
      }
      return result;
    },
    [db, refresh]
  );

  const deletePlaylistAction = useCallback(
    async (playlist: Playlist) => {
      setData((current) => current?.filter((p) => p.id !== playlist.id) ?? current);
      await removePlaylist(db, playlist);
    },
    [db, setData]
  );

  const setImage = useCallback(
    async (playlist: Playlist, imageUri: string) => {
      setData((current) => current?.map((p) => (p.id === playlist.id ? { ...p, imageUri } : p)) ?? current);
      await changePlaylistImage(db, playlist, imageUri);
    },
    [db, setData]
  );

  const rename = useCallback(
    async (playlist: Playlist, name: string) => {
      const result = await renamePlaylist(db, playlist.id, name);
      if (result.ok) {
        setData(
          (current) => current?.map((p) => (p.id === playlist.id ? { ...p, name: name.trim() } : p)) ?? current
        );
      }
      return result;
    },
    [db, setData]
  );

  // Membership lives in the join table, so these don't touch the playlist rows this hook caches —
  // the caller refreshes its own track list afterwards.
  const addTrackTo = useCallback(
    async (playlistId: string, trackId: string) => addTrack(db, playlistId, trackId),
    [db]
  );

  const removeTrackFrom = useCallback(
    async (playlistId: string, trackId: string) => removeTrack(db, playlistId, trackId),
    [db]
  );

  return {
    playlists: data ?? [],
    loading,
    error,
    refresh,
    addPlaylist,
    deletePlaylist: deletePlaylistAction,
    setImage,
    rename,
    addTrackTo,
    removeTrackFrom,
  };
}
