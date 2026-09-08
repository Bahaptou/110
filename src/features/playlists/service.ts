import { randomUUID } from 'expo-crypto';
import { type SQLiteDatabase } from 'expo-sqlite';

import { deleteImageFile } from '../images/imageStorage';
import { type Track } from '../tracks/types';
import {
  addTrackToPlaylist,
  deletePlaylist,
  insertPlaylist,
  listPlaylistIdsForTrack,
  listPlaylistTracks,
  listPlaylists,
  removeTrackFromPlaylist,
  setPlaylistImage,
  setPlaylistName,
} from './repository';
import { type Playlist } from './types';

/** Business logic for playlists — orchestrates the repository, never touches SQL directly from callers. */

export type CreatePlaylistResult = { ok: true; playlist: Playlist } | { ok: false; error: 'empty_name' };
export type RenamePlaylistResult = { ok: true } | { ok: false; error: 'empty_name' };

export type NewPlaylistInput = {
  name: string;
  color: string;
  imageUri: string;
};

export async function getPlaylists(db: SQLiteDatabase): Promise<Playlist[]> {
  return listPlaylists(db);
}

export async function getPlaylistTracks(db: SQLiteDatabase, playlistId: string): Promise<Track[]> {
  return listPlaylistTracks(db, playlistId);
}

export async function getPlaylistIdsForTrack(db: SQLiteDatabase, trackId: string): Promise<string[]> {
  return listPlaylistIdsForTrack(db, trackId);
}

export async function createPlaylist(db: SQLiteDatabase, input: NewPlaylistInput): Promise<CreatePlaylistResult> {
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }

  const playlist: Playlist = {
    id: randomUUID(),
    name,
    color: input.color,
    imageUri: input.imageUri,
    createdAt: Date.now(),
  };

  await insertPlaylist(db, playlist);
  return { ok: true, playlist };
}

/** Replaces the playlist's cover, deleting the previous file so old images don't pile up on disk. */
export async function changePlaylistImage(
  db: SQLiteDatabase,
  playlist: Playlist,
  imageUri: string
): Promise<void> {
  await setPlaylistImage(db, playlist.id, imageUri);
  if (playlist.imageUri.length > 0 && playlist.imageUri !== imageUri) {
    deleteImageFile(playlist.imageUri);
  }
}

export async function renamePlaylist(
  db: SQLiteDatabase,
  playlistId: string,
  rawName: string
): Promise<RenamePlaylistResult> {
  const name = rawName.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }
  await setPlaylistName(db, playlistId, name);
  return { ok: true };
}

/** Deleting a playlist never deletes its tracks — it only drops the grouping (join rows cascade). */
export async function removePlaylist(db: SQLiteDatabase, playlist: Playlist): Promise<void> {
  await deletePlaylist(db, playlist.id);
  deleteImageFile(playlist.imageUri);
}

export async function addTrack(db: SQLiteDatabase, playlistId: string, trackId: string): Promise<void> {
  await addTrackToPlaylist(db, playlistId, trackId);
}

export async function removeTrack(db: SQLiteDatabase, playlistId: string, trackId: string): Promise<void> {
  await removeTrackFromPlaylist(db, playlistId, trackId);
}
