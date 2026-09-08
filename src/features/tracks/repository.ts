import { type SQLiteDatabase } from 'expo-sqlite';

import { type TrackRow } from '../../db/schema';
import { type Track } from './types';

/** Raw SQLite access for the `tracks` table. No business logic lives here. */

/** Exported so the playlists repository can map its joined rows without duplicating this. */
export function toTrack(row: TrackRow): Track {
  return {
    id: row.id,
    title: row.title,
    artistId: row.artist_id,
    albumId: row.album_id,
    audioUri: row.audio_uri,
    imageUri: row.image_uri,
    durationSeconds: row.duration_seconds,
    isFavorite: row.is_favorite === 1,
    createdAt: row.created_at,
  };
}

export async function listTracksByArtist(db: SQLiteDatabase, artistId: string): Promise<Track[]> {
  const rows = await db.getAllAsync<TrackRow>(
    'SELECT * FROM tracks WHERE artist_id = ? ORDER BY created_at DESC;',
    artistId
  );
  return rows.map(toTrack);
}

export async function listTracksByAlbum(db: SQLiteDatabase, albumId: string): Promise<Track[]> {
  const rows = await db.getAllAsync<TrackRow>(
    'SELECT * FROM tracks WHERE album_id = ? ORDER BY created_at DESC;',
    albumId
  );
  return rows.map(toTrack);
}

export async function listAllTracks(db: SQLiteDatabase): Promise<Track[]> {
  const rows = await db.getAllAsync<TrackRow>('SELECT * FROM tracks ORDER BY created_at DESC;');
  return rows.map(toTrack);
}

export async function insertTrack(db: SQLiteDatabase, track: Track): Promise<void> {
  await db.runAsync(
    'INSERT INTO tracks (id, title, artist_id, album_id, audio_uri, image_uri, duration_seconds, is_favorite, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
    track.id,
    track.title,
    track.artistId,
    track.albumId,
    track.audioUri,
    track.imageUri,
    track.durationSeconds,
    track.isFavorite ? 1 : 0,
    track.createdAt
  );
}

export async function setTrackFavorite(db: SQLiteDatabase, trackId: string, isFavorite: boolean): Promise<void> {
  await db.runAsync('UPDATE tracks SET is_favorite = ? WHERE id = ?;', isFavorite ? 1 : 0, trackId);
}

export async function setTrackImage(db: SQLiteDatabase, trackId: string, imageUri: string): Promise<void> {
  await db.runAsync('UPDATE tracks SET image_uri = ? WHERE id = ?;', imageUri, trackId);
}

export async function setTrackTitle(db: SQLiteDatabase, trackId: string, title: string): Promise<void> {
  await db.runAsync('UPDATE tracks SET title = ? WHERE id = ?;', title, trackId);
}

/** Also clears the album: albums belong to one artist, so the old album can't survive the move. */
export async function setTrackArtist(db: SQLiteDatabase, trackId: string, artistId: string): Promise<void> {
  await db.runAsync('UPDATE tracks SET artist_id = ?, album_id = NULL WHERE id = ?;', artistId, trackId);
}

export async function setTrackAlbum(db: SQLiteDatabase, trackId: string, albumId: string | null): Promise<void> {
  await db.runAsync('UPDATE tracks SET album_id = ? WHERE id = ?;', albumId, trackId);
}

export async function deleteTrack(db: SQLiteDatabase, trackId: string): Promise<void> {
  await db.runAsync('DELETE FROM tracks WHERE id = ?;', trackId);
}

export async function countTracksByArtist(db: SQLiteDatabase, artistId: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tracks WHERE artist_id = ?;',
    artistId
  );
  return row?.count ?? 0;
}

export async function getTrackAudioUri(db: SQLiteDatabase, trackId: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ audio_uri: string }>('SELECT audio_uri FROM tracks WHERE id = ?;', trackId);
  return row?.audio_uri ?? null;
}
