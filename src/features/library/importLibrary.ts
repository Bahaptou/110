import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { type SQLiteDatabase } from 'expo-sqlite';

import { insertAlbum, listAlbums } from '../albums/repository';
import { insertArtist, listArtists } from '../artists/repository';
import { addTrackToPlaylist, insertPlaylist, listPlaylists } from '../playlists/repository';
import { insertTrack, listAllTracks } from '../tracks/repository';
import { type BundledFile, type LibraryBundle } from './types';

export type ImportSummary = {
  artists: number;
  albums: number;
  tracks: number;
  playlists: number;
  /** Entries already present on this device, skipped rather than duplicated. */
  skipped: number;
};

export type ImportLibraryResult =
  | { ok: true; summary: ImportSummary }
  | { ok: false; error: 'unreadable' | 'not_a_bundle' | 'unsupported_version' };

const AUDIO_DIRECTORY = new Directory(Paths.document, 'audio');
const IMAGE_DIRECTORY = new Directory(Paths.document, 'images');

function ensure(directory: Directory): void {
  if (!directory.exists) directory.create({ intermediates: true });
}

/** Writes a bundled file into permanent storage, returning its new URI ('' when there was none). */
async function restoreFile(file: BundledFile | null, directory: Directory, name: string): Promise<string> {
  if (file === null) return '';
  ensure(directory);
  const destination = new File(directory, `${name}.${file.extension}`);
  await LegacyFileSystem.writeAsStringAsync(destination.uri, file.base64, {
    encoding: LegacyFileSystem.EncodingType.Base64,
  });
  return destination.uri;
}

function parseBundle(raw: string): LibraryBundle | 'not_a_bundle' | 'unsupported_version' {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return 'not_a_bundle';
  }
  if (typeof parsed !== 'object' || parsed === null) return 'not_a_bundle';
  const candidate = parsed as Partial<LibraryBundle>;
  if (!Array.isArray(candidate.tracks) || !Array.isArray(candidate.artists)) return 'not_a_bundle';
  if (candidate.formatVersion !== 1) return 'unsupported_version';
  return candidate as LibraryBundle;
}

/**
 * Merges a bundle into the current library. Never destructive: rows whose id is already present are
 * skipped, so importing the same file twice changes nothing the second time.
 *
 * Ids are carried over from the exporting device — that's what makes re-import idempotent. Playlists
 * are the exception: their membership is rebuilt from `trackIds`, ignoring tracks that didn't make it.
 */
export async function importLibrary(db: SQLiteDatabase, fileUri: string): Promise<ImportLibraryResult> {
  let raw: string;
  try {
    raw = await LegacyFileSystem.readAsStringAsync(fileUri);
  } catch {
    return { ok: false, error: 'unreadable' };
  }

  const bundle = parseBundle(raw);
  if (bundle === 'not_a_bundle' || bundle === 'unsupported_version') {
    return { ok: false, error: bundle };
  }

  const [existingArtists, existingAlbums, existingTracks, existingPlaylists] = await Promise.all([
    listArtists(db),
    listAlbums(db),
    listAllTracks(db),
    listPlaylists(db),
  ]);
  const artistIds = new Set(existingArtists.map((a) => a.id));
  const albumIds = new Set(existingAlbums.map((a) => a.id));
  const trackIds = new Set(existingTracks.map((t) => t.id));
  const playlistIds = new Set(existingPlaylists.map((p) => p.id));

  const summary: ImportSummary = { artists: 0, albums: 0, tracks: 0, playlists: 0, skipped: 0 };

  for (const artist of bundle.artists) {
    if (artistIds.has(artist.id)) {
      summary.skipped += 1;
      continue;
    }
    await insertArtist(db, {
      id: artist.id,
      name: artist.name,
      color: artist.color,
      imageUri: await restoreFile(artist.image, IMAGE_DIRECTORY, randomUUID()),
      createdAt: artist.createdAt,
    });
    artistIds.add(artist.id);
    summary.artists += 1;
  }

  for (const album of bundle.albums) {
    // An album whose artist didn't come through would violate the foreign key.
    if (albumIds.has(album.id) || !artistIds.has(album.artistId)) {
      summary.skipped += 1;
      continue;
    }
    await insertAlbum(db, {
      id: album.id,
      name: album.name,
      artistId: album.artistId,
      color: album.color,
      imageUri: await restoreFile(album.image, IMAGE_DIRECTORY, randomUUID()),
      createdAt: album.createdAt,
    });
    albumIds.add(album.id);
    summary.albums += 1;
  }

  for (const track of bundle.tracks) {
    if (trackIds.has(track.id) || !artistIds.has(track.artistId)) {
      summary.skipped += 1;
      continue;
    }
    await insertTrack(db, {
      id: track.id,
      title: track.title,
      artistId: track.artistId,
      albumId: track.albumId !== null && albumIds.has(track.albumId) ? track.albumId : null,
      // Named after the track id, matching how the import/record flow stores audio.
      audioUri: await restoreFile(track.audio, AUDIO_DIRECTORY, track.id),
      imageUri: await restoreFile(track.image, IMAGE_DIRECTORY, randomUUID()),
      durationSeconds: track.durationSeconds,
      isFavorite: track.isFavorite,
      createdAt: track.createdAt,
    });
    trackIds.add(track.id);
    summary.tracks += 1;
  }

  for (const playlist of bundle.playlists) {
    if (playlistIds.has(playlist.id)) {
      summary.skipped += 1;
      continue;
    }
    await insertPlaylist(db, {
      id: playlist.id,
      name: playlist.name,
      color: playlist.color,
      imageUri: await restoreFile(playlist.image, IMAGE_DIRECTORY, randomUUID()),
      createdAt: playlist.createdAt,
    });
    for (const trackId of playlist.trackIds) {
      if (trackIds.has(trackId)) {
        await addTrackToPlaylist(db, playlist.id, trackId);
      }
    }
    playlistIds.add(playlist.id);
    summary.playlists += 1;
  }

  return { ok: true, summary };
}
