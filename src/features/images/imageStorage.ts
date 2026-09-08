import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';

/**
 * Cover images for artists and tracks, stored alongside the audio files in the app's document
 * directory rather than left at the picker's temp path (which the OS can clear).
 *
 * Mirrors audioStorage.ts, including its workarounds: the copy is awaited (it's async despite
 * appearances), existence is checked with the legacy getInfoAsync (the new API's `.exists` reads a
 * stale stat right after another native module writes the file), and a base64 read/write fallback
 * covers environments where copyAsync is refused. See .claude/docs/tracks-audio.md.
 */
const IMAGE_DIRECTORY = new Directory(Paths.document, 'images');

function ensureImageDirectory(): void {
  if (!IMAGE_DIRECTORY.exists) {
    IMAGE_DIRECTORY.create({ intermediates: true });
  }
}

export class ImageSourceUnreadableError extends Error {
  constructor(sourceUri: string, cause: unknown) {
    super(`Impossible de lire l'image sélectionnée (${sourceUri}).`);
    this.name = 'ImageSourceUnreadableError';
    this.cause = cause;
  }
}

function extensionFromUri(uri: string): string {
  const withoutQuery = uri.split('?')[0];
  const dotIndex = withoutQuery.lastIndexOf('.');
  if (dotIndex === -1) return 'jpg';
  const extension = withoutQuery.slice(dotIndex + 1).toLowerCase();
  return extension.length > 0 && extension.length <= 4 ? extension : 'jpg';
}

/** Copies a picked image into permanent app storage, returning its new file:// URI. */
export async function persistImageFile(sourceUri: string): Promise<string> {
  ensureImageDirectory();

  const sourceInfo = await LegacyFileSystem.getInfoAsync(sourceUri);
  if (!sourceInfo.exists) {
    throw new ImageSourceUnreadableError(sourceUri, new Error('source file does not exist'));
  }

  const destination = new File(IMAGE_DIRECTORY, `${randomUUID()}.${extensionFromUri(sourceUri)}`);
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
      throw new ImageSourceUnreadableError(sourceUri, copyCause);
    }
  }
  return destination.uri;
}

/** Deletes a stored image. Safe to call with '' or a path that no longer exists. */
export function deleteImageFile(imageUri: string): void {
  if (imageUri.length === 0) return;
  const file = new File(imageUri);
  if (file.exists) {
    file.delete();
  }
}
