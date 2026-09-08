import { randomUUID } from 'expo-crypto';
import { type SQLiteDatabase } from 'expo-sqlite';

import { listAlbumsByArtist } from '../albums/repository';
import { deleteImageFile } from '../images/imageStorage';
import { deleteAudioFile } from '../tracks/audioStorage';
import { listTracksByArtist } from '../tracks/repository';
import { deleteArtist, insertArtist, listArtists, setArtistImage, setArtistName } from './repository';
import { type Artist } from './types';

/** Business logic for artists — orchestrates the repository, never touches SQL directly from callers. */

const ARTIST_COLORS = ['#E8001C', '#FFD600', '#0057FF', '#00C896', '#FF6B00', '#C800E8'] as const;

export type CreateArtistResult = { ok: true; artist: Artist } | { ok: false; error: 'empty_name' };

export async function getArtists(db: SQLiteDatabase): Promise<Artist[]> {
  return listArtists(db);
}

export type NewArtistInput = {
  name: string;
  /** Omitted when the caller doesn't offer a choice — falls back to the rotating default palette. */
  color?: string;
  imageUri?: string;
};

export async function createArtist(db: SQLiteDatabase, input: NewArtistInput): Promise<CreateArtistResult> {
  const name = input.name.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }

  const existingCount = (await listArtists(db)).length;
  const artist: Artist = {
    id: randomUUID(),
    name,
    color: input.color ?? ARTIST_COLORS[existingCount % ARTIST_COLORS.length],
    imageUri: input.imageUri ?? '',
    createdAt: Date.now(),
  };

  await insertArtist(db, artist);
  return { ok: true, artist };
}

/** Replaces the artist's cover, deleting the previous file so old images don't pile up on disk. */
export async function changeArtistImage(db: SQLiteDatabase, artist: Artist, imageUri: string): Promise<void> {
  await setArtistImage(db, artist.id, imageUri);
  if (artist.imageUri.length > 0 && artist.imageUri !== imageUri) {
    deleteImageFile(artist.imageUri);
  }
}

export type RenameArtistResult = { ok: true } | { ok: false; error: 'empty_name' };

export async function renameArtist(db: SQLiteDatabase, artistId: string, rawName: string): Promise<RenameArtistResult> {
  const name = rawName.trim();
  if (name.length === 0) {
    return { ok: false, error: 'empty_name' };
  }
  await setArtistName(db, artistId, name);
  return { ok: true };
}

/**
 * Deletes an artist, their tracks and their albums. The rows go at the database level (ON DELETE
 * CASCADE), but files don't: the tracks have to be listed *before* the delete, while their rows —
 * and so their audio/image paths — still exist.
 */
export async function removeArtist(db: SQLiteDatabase, artist: Artist): Promise<void> {
  const tracks = await listTracksByArtist(db, artist.id);
  const albums = await listAlbumsByArtist(db, artist.id);

  await deleteArtist(db, artist.id);

  for (const track of tracks) {
    deleteAudioFile(track.audioUri);
    deleteImageFile(track.imageUri);
  }
  for (const album of albums) {
    deleteImageFile(album.imageUri);
  }
  deleteImageFile(artist.imageUri);
}
