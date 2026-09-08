import { type SQLiteDatabase } from 'expo-sqlite';

import { type PlaylistRow, type TrackRow } from '../../db/schema';
import { toTrack } from '../tracks/repository';
import { type Track } from '../tracks/types';
import { type Playlist } from './types';

/** Raw SQLite access for `playlists` and its join table. No business logic lives here. */

function toPlaylist(row: PlaylistRow): Playlist {
  return { id: row.id, name: row.name, color: row.color, imageUri: row.image_uri, createdAt: row.created_at };
}

export async function listPlaylists(db: SQLiteDatabase): Promise<Playlist[]> {
  const rows = await db.getAllAsync<PlaylistRow>('SELECT * FROM playlists ORDER BY created_at DESC;');
  return rows.map(toPlaylist);
}

export async function insertPlaylist(db: SQLiteDatabase, playlist: Playlist): Promise<void> {
  await db.runAsync(
    'INSERT INTO playlists (id, name, color, image_uri, created_at) VALUES (?, ?, ?, ?, ?);',
    playlist.id,
    playlist.name,
    playlist.color,
    playlist.imageUri,
    playlist.createdAt
  );
}

export async function setPlaylistImage(db: SQLiteDatabase, playlistId: string, imageUri: string): Promise<void> {
  await db.runAsync('UPDATE playlists SET image_uri = ? WHERE id = ?;', imageUri, playlistId);
}

export async function setPlaylistName(db: SQLiteDatabase, playlistId: string, name: string): Promise<void> {
  await db.runAsync('UPDATE playlists SET name = ? WHERE id = ?;', name, playlistId);
}

export async function deletePlaylist(db: SQLiteDatabase, playlistId: string): Promise<void> {
  await db.runAsync('DELETE FROM playlists WHERE id = ?;', playlistId);
}

/** Tracks of one playlist, in the user's chosen order. */
export async function listPlaylistTracks(db: SQLiteDatabase, playlistId: string): Promise<Track[]> {
  const rows = await db.getAllAsync<TrackRow>(
    `SELECT tracks.* FROM tracks
     JOIN playlist_tracks ON playlist_tracks.track_id = tracks.id
     WHERE playlist_tracks.playlist_id = ?
     ORDER BY playlist_tracks.position ASC;`,
    playlistId
  );
  return rows.map(toTrack);
}

/** Ids of every playlist a track belongs to — a track can be in several. */
export async function listPlaylistIdsForTrack(db: SQLiteDatabase, trackId: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ playlist_id: string }>(
    'SELECT playlist_id FROM playlist_tracks WHERE track_id = ?;',
    trackId
  );
  return rows.map((row) => row.playlist_id);
}

/** Appends at the end of the playlist. Ignores a track that's already in it (primary key conflict). */
export async function addTrackToPlaylist(db: SQLiteDatabase, playlistId: string, trackId: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO playlist_tracks (playlist_id, track_id, position)
     VALUES (?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM playlist_tracks WHERE playlist_id = ?))
     ON CONFLICT(playlist_id, track_id) DO NOTHING;`,
    playlistId,
    trackId,
    playlistId
  );
}

export async function removeTrackFromPlaylist(db: SQLiteDatabase, playlistId: string, trackId: string): Promise<void> {
  await db.runAsync('DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?;', playlistId, trackId);
}
