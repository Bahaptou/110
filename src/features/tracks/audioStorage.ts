import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';

/**
 * Persists imported/recorded audio into the app's document directory (survives cache eviction —
 * see design-implementation.md note on expo-audio defaulting to the cache dir). Every track's
 * `audio_uri` points at a file copied here, never at the original picker/recorder temp path.
 */
const AUDIO_DIRECTORY = new Directory(Paths.document, 'audio');

function ensureAudioDirectory(): void {
  if (!AUDIO_DIRECTORY.exists) {
    AUDIO_DIRECTORY.create({ intermediates: true });
  }
}

export class AudioSourceUnreadableError extends Error {
  constructor(sourceUri: string, cause: unknown) {
    super(`Impossible de lire le fichier sélectionné (${sourceUri}).`);
    this.name = 'AudioSourceUnreadableError';
    this.cause = cause;
  }
}

/**
 * Copies a source file (picker/recorder temp URI) into permanent app storage, returning its new
 * file:// URI.
 *
 * Inside Expo Go on Android, copying a document-picker cache file throws an IOException
 * ("isn't readable") even though getInfoAsync confirms the same file exists with real content — a
 * known Expo Go sandbox bug (expo/expo #21792) where its DocumentPicker and FileSystem modules don't
 * share access to a freshly-written cache file. A dev client / release build doesn't have this
 * problem, so copyAsync is the primary path; the base64 read/write fallback exists only to keep
 * imports working if this ever runs under Expo Go again.
 */
export async function persistAudioFile(sourceUri: string, trackId: string, extension: string): Promise<string> {
  ensureAudioDirectory();

  const sourceInfo = await LegacyFileSystem.getInfoAsync(sourceUri);
  if (!sourceInfo.exists) {
    throw new AudioSourceUnreadableError(sourceUri, new Error('source file does not exist'));
  }

  const destination = new File(AUDIO_DIRECTORY, `${trackId}.${extension}`);
  try {
    await LegacyFileSystem.copyAsync({ from: sourceUri, to: destination.uri });
  } catch (copyCause) {
    try {
      const base64Content = await LegacyFileSystem.readAsStringAsync(sourceUri, {
        encoding: LegacyFileSystem.EncodingType.Base64,
      });
      await LegacyFileSystem.writeAsStringAsync(destination.uri, base64Content, {
        encoding: LegacyFileSystem.EncodingType.Base64,
      });
    } catch {
      // Surface the original copy failure — it's the more meaningful one to debug from.
      throw new AudioSourceUnreadableError(sourceUri, copyCause);
    }
  }
  return destination.uri;
}

/** Deletes a persisted audio file. Safe to call even if the file no longer exists. */
export function deleteAudioFile(audioUri: string): void {
  if (audioUri.length === 0) return;
  const file = new File(audioUri);
  if (file.exists) {
    file.delete();
  }
}
