import { type SQLiteDatabase } from 'expo-sqlite';
import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';

import { listAlbums } from '../albums/repository';
import { listArtists } from '../artists/repository';
import { listPlaylists, listPlaylistTracks } from '../playlists/repository';
import { listAllTracks } from '../tracks/repository';
import {
  type BundledFile,
  type LibraryBundle,
} from './types';

/** Where the generated bundle is written before being handed to the share sheet. */
const EXPORT_DIRECTORY = new Directory(Paths.cache, 'exports');

function extensionOf(uri: string): string {
  const withoutQuery = uri.split('?')[0];
  const dotIndex = withoutQuery.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return withoutQuery.slice(dotIndex + 1).toLowerCase();
}

/**
 * Reads a stored file into the bundle. Returns null for missing files rather than failing the whole
 * export — a library with one broken path should still be shareable.
 */
async function bundleFile(uri: string): Promise<BundledFile | null> {
  if (uri.length === 0) return null;
  try {
    const info = await LegacyFileSystem.getInfoAsync(uri);
    if (!info.exists) return null;
    const base64 = await LegacyFileSystem.readAsStringAsync(uri, {
      encoding: LegacyFileSystem.EncodingType.Base64,
    });
    return { extension: extensionOf(uri) || 'bin', base64 };
  } catch {
    return null;
  }
}

/**
 * Packs the whole library — rows plus the audio and image files they point at — into a single JSON
 * document, and returns its file:// URI ready to be shared.
 */
export async function exportLibrary(db: SQLiteDatabase, label: string): Promise<string> {
  const [artists, albums, tracks, playlists] = await Promise.all([
    listArtists(db),
    listAlbums(db),
    listAllTracks(db),
    listPlaylists(db),
  ]);

  const bundle: LibraryBundle = {
    formatVersion: 1,
    exportedAt: Date.now(),
    label,
    artists: await Promise.all(
      artists.map(async (artist) => ({
        id: artist.id,
        name: artist.name,
        color: artist.color,
        createdAt: artist.createdAt,
        image: await bundleFile(artist.imageUri),
      }))
    ),
    albums: await Promise.all(
      albums.map(async (album) => ({
        id: album.id,
        name: album.name,
        artistId: album.artistId,
        color: album.color,
        createdAt: album.createdAt,
        image: await bundleFile(album.imageUri),
      }))
    ),
    tracks: await Promise.all(
      tracks.map(async (track) => ({
        id: track.id,
        title: track.title,
        artistId: track.artistId,
        albumId: track.albumId,
        durationSeconds: track.durationSeconds,
        isFavorite: track.isFavorite,
        createdAt: track.createdAt,
        audio: await bundleFile(track.audioUri),
        image: await bundleFile(track.imageUri),
      }))
    ),
    playlists: await Promise.all(
      playlists.map(async (playlist) => ({
        id: playlist.id,
        name: playlist.name,
        color: playlist.color,
        createdAt: playlist.createdAt,
        image: await bundleFile(playlist.imageUri),
        trackIds: (await listPlaylistTracks(db, playlist.id)).map((t) => t.id),
      }))
    ),
  };

  if (!EXPORT_DIRECTORY.exists) {
    EXPORT_DIRECTORY.create({ intermediates: true });
  }
  // Overwritten on each export: the file only has to live long enough to reach the share sheet.
  const destination = new File(EXPORT_DIRECTORY, 'bibliotheque-110.json');
  if (destination.exists) destination.delete();
  await LegacyFileSystem.writeAsStringAsync(destination.uri, JSON.stringify(bundle));
  return destination.uri;
}
