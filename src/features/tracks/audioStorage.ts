import { Directory, File, Paths } from 'expo-file-system';

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

/** Copies a source file (picker/recorder temp URI) into permanent app storage, returning its new file:// URI. */
export function persistAudioFile(sourceUri: string, trackId: string, extension: string): string {
  ensureAudioDirectory();
  const source = new File(sourceUri);
  const destination = new File(AUDIO_DIRECTORY, `${trackId}.${extension}`);
  source.copy(destination);
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
