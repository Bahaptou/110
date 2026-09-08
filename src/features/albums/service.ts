import { randomUUID } from 'expo-crypto';
import { type SQLiteDatabase } from 'expo-sqlite';

import { deleteImageFile } from '../images/imageStorage';
import { deleteAlbum, insertAlbum, listAlbums, listAlbumsByArtist, setAlbumImage, setAlbumName } from './repository';
import { type Album } from './types';

/** Business logic for albums — orchestrates the repository, never touches SQL directly from callers. */

export type CreateAlbumResult = { ok: true; album: Album } | { ok: false; error: 'empty_name' };
export type RenameAlbumResult = { ok: true } | { ok: false; error: 'empty_name' };

export async function getAlbums(db: SQLiteDatabase): Promise<Album[]> {
  return listAlbums(db);
}

export async function getAlbumsByArtist(db: SQLiteDatabase, artistId: string): Promise<Album[]> {
  return listAlbumsByArtist(db, artistId);
}

export type NewAlbumInput = {
  artistId: string;
  name: string;
  color: string;
  imageUri: string;
};

export async function createAlbum(db: SQLiteDatabase, input: NewAlbumInput): Promise<CreateAlbumResult> {
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }

  const album: Album = {
    id: randomUUID(),
    name,
    artistId: input.artistId,
    color: input.color,
    imageUri: input.imageUri,
    createdAt: Date.now(),
  };

  await insertAlbum(db, album);
  return { ok: true, album };
}

/** Replaces the album's cover, deleting the previous file so old images don't pile up on disk. */
export async function changeAlbumImage(db: SQLiteDatabase, album: Album, imageUri: string): Promise<void> {
  await setAlbumImage(db, album.id, imageUri);
  if (album.imageUri.length > 0 && album.imageUri !== imageUri) {
    deleteImageFile(album.imageUri);
  }
}

export async function renameAlbum(db: SQLiteDatabase, albumId: string, rawName: string): Promise<RenameAlbumResult> {
  const name = rawName.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }
  await setAlbumName(db, albumId, name);
  return { ok: true };
}

export async function removeAlbum(db: SQLiteDatabase, album: Album): Promise<void> {
  await deleteAlbum(db, album.id);
  deleteImageFile(album.imageUri);
}
