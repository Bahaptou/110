import { randomUUID } from 'expo-crypto';
import { type SQLiteDatabase } from 'expo-sqlite';

import { insertTrack, listTracksByArtist, setTrackFavorite } from './repository';
import { type Track } from './types';

/** Business logic for tracks — orchestrates the repository, never touches SQL directly from callers. */

export type CreateTrackResult = { ok: true; track: Track } | { ok: false; error: 'empty_title' };

export async function getTracksByArtist(db: SQLiteDatabase, artistId: string): Promise<Track[]> {
  return listTracksByArtist(db, artistId);
}

export async function createTrack(db: SQLiteDatabase, artistId: string, rawTitle: string): Promise<CreateTrackResult> {
  const title = rawTitle.trim();
  if (title.length === 0) {
    return { ok: false, error: 'empty_title' };
  }

  const track: Track = {
    id: randomUUID(),
    title,
    artistId,
    isFavorite: false,
    createdAt: Date.now(),
  };

  await insertTrack(db, track);
  return { ok: true, track };
}

export async function toggleTrackFavorite(db: SQLiteDatabase, track: Track): Promise<void> {
  await setTrackFavorite(db, track.id, !track.isFavorite);
}
