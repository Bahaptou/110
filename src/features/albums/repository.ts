import { type SQLiteDatabase } from 'expo-sqlite';

import { type AlbumRow } from '../../db/schema';
import { type Album } from './types';

/** Raw SQLite access for the `albums` table. No business logic lives here. */

function toAlbum(row: AlbumRow): Album {
  return {
    id: row.id,
    name: row.name,
    artistId: row.artist_id,
    color: row.color,
    imageUri: row.image_uri,
    createdAt: row.created_at,
  };
}

export async function listAlbums(db: SQLiteDatabase): Promise<Album[]> {
  const rows = await db.getAllAsync<AlbumRow>('SELECT * FROM albums ORDER BY created_at DESC;');
  return rows.map(toAlbum);
}

export async function listAlbumsByArtist(db: SQLiteDatabase, artistId: string): Promise<Album[]> {
  const rows = await db.getAllAsync<AlbumRow>(
    'SELECT * FROM albums WHERE artist_id = ? ORDER BY created_at DESC;',
    artistId
  );
  return rows.map(toAlbum);
}

export async function insertAlbum(db: SQLiteDatabase, album: Album): Promise<void> {
  await db.runAsync(
    'INSERT INTO albums (id, name, artist_id, color, image_uri, created_at) VALUES (?, ?, ?, ?, ?, ?);',
    album.id,
    album.name,
    album.artistId,
    album.color,
    album.imageUri,
    album.createdAt
  );
}

export async function setAlbumImage(db: SQLiteDatabase, albumId: string, imageUri: string): Promise<void> {
  await db.runAsync('UPDATE albums SET image_uri = ? WHERE id = ?;', imageUri, albumId);
}

export async function setAlbumName(db: SQLiteDatabase, albumId: string, name: string): Promise<void> {
  await db.runAsync('UPDATE albums SET name = ? WHERE id = ?;', name, albumId);
}

export async function deleteAlbum(db: SQLiteDatabase, albumId: string): Promise<void> {
  await db.runAsync('DELETE FROM albums WHERE id = ?;', albumId);
}
