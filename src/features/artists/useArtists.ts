import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import {
  changeArtistImage,
  createArtist,
  getArtists,
  removeArtist,
  renameArtist,
  type CreateArtistResult,
  type NewArtistInput,
  type RenameArtistResult,
} from './service';
import { type Artist } from './types';

type UseArtistsResult = {
  artists: Artist[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  addArtist: (input: NewArtistInput) => Promise<CreateArtistResult>;
  deleteArtist: (artist: Artist) => Promise<void>;
  setImage: (artist: Artist, imageUri: string) => Promise<void>;
  rename: (artist: Artist, name: string) => Promise<RenameArtistResult>;
};

export function useArtists(): UseArtistsResult {
  const db = useSQLiteContext();
  const query = useCallback((database: typeof db) => getArtists(database), []);
  const { data, loading, error, refresh, setData } = useSqliteQuery(query);

  const addArtist = useCallback(
    async (input: NewArtistInput) => {
      const result = await createArtist(db, input);
      if (result.ok) {
        await refresh();
      }
      return result;
    },
    [db, refresh]
  );

  const deleteArtist = useCallback(
    async (artist: Artist) => {
      setData((current) => current?.filter((a) => a.id !== artist.id) ?? current);
      await removeArtist(db, artist);
    },
    [db, setData]
  );

  const setImage = useCallback(
    async (artist: Artist, imageUri: string) => {
      setData((current) => current?.map((a) => (a.id === artist.id ? { ...a, imageUri } : a)) ?? current);
      await changeArtistImage(db, artist, imageUri);
    },
    [db, setData]
  );

  const rename = useCallback(
    async (artist: Artist, name: string) => {
      const result = await renameArtist(db, artist.id, name);
      if (result.ok) {
        setData((current) => current?.map((a) => (a.id === artist.id ? { ...a, name: name.trim() } : a)) ?? current);
      }
      return result;
    },
    [db, setData]
  );

  return { artists: data ?? [], loading, error, refresh, addArtist, deleteArtist, setImage, rename };
}
