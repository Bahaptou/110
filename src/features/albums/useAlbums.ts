import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { type QueryError } from '../../data/queryError';
import { useSqliteQuery } from '../../data/useSqliteQuery';
import {
  changeAlbumImage,
  createAlbum,
  getAlbums,
  getAlbumsByArtist,
  removeAlbum,
  renameAlbum,
  type CreateAlbumResult,
  type NewAlbumInput,
  type RenameAlbumResult,
} from './service';
import { type Album } from './types';

type UseAlbumsResult = {
  albums: Album[];
  loading: boolean;
  error: QueryError | null;
  refresh: () => Promise<void>;
  addAlbum: (input: NewAlbumInput) => Promise<CreateAlbumResult>;
  deleteAlbum: (album: Album) => Promise<void>;
  setImage: (album: Album, imageUri: string) => Promise<void>;
  rename: (album: Album, name: string) => Promise<RenameAlbumResult>;
};

/** Pass an artistId to scope the list to that artist, or omit it for every album in the library. */
export function useAlbums(artistId?: string): UseAlbumsResult {
  const db = useSQLiteContext();
  const query = useCallback(
    (database: typeof db) => (artistId ? getAlbumsByArtist(database, artistId) : getAlbums(database)),
    [artistId]
  );
  const { data, loading, error, refresh, setData } = useSqliteQuery(query);

  const addAlbum = useCallback(
    async (input: NewAlbumInput) => {
      const result = await createAlbum(db, input);
      if (result.ok) {
        await refresh();
      }
      return result;
    },
    [db, refresh]
  );

  const deleteAlbumAction = useCallback(
    async (album: Album) => {
      setData((current) => current?.filter((a) => a.id !== album.id) ?? current);
      await removeAlbum(db, album);
    },
    [db, setData]
  );

  const setImage = useCallback(
    async (album: Album, imageUri: string) => {
      setData((current) => current?.map((a) => (a.id === album.id ? { ...a, imageUri } : a)) ?? current);
      await changeAlbumImage(db, album, imageUri);
    },
    [db, setData]
  );

  const rename = useCallback(
    async (album: Album, name: string) => {
      const result = await renameAlbum(db, album.id, name);
      if (result.ok) {
        setData((current) => current?.map((a) => (a.id === album.id ? { ...a, name: name.trim() } : a)) ?? current);
      }
      return result;
    },
    [db, setData]
  );

  return { albums: data ?? [], loading, error, refresh, addAlbum, deleteAlbum: deleteAlbumAction, setImage, rename };
}
