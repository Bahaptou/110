import * as Sharing from 'expo-sharing';

import { type Track } from './types';

export type ShareTrackResult = { ok: true } | { ok: false; error: 'no_audio' | 'unavailable' | 'failed' };

/** m4a recordings and imports alike — what the OS needs to offer the right target apps. */
const AUDIO_MIME_TYPE = 'audio/mp4';

/**
 * Hands a track's audio file to the system share sheet (WhatsApp, mail, Drive...).
 *
 * The file lives in the app's private directory, which other apps can't read directly — expo-sharing
 * exposes it through a content:// URI on Android rather than the raw file:// path.
 */
export async function shareTrack(track: Track): Promise<ShareTrackResult> {
  if (track.audioUri.length === 0) {
    return { ok: false, error: 'no_audio' };
  }

  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, error: 'unavailable' };
  }

  try {
    await Sharing.shareAsync(track.audioUri, {
      mimeType: AUDIO_MIME_TYPE,
      // Shown as the sheet's title on Android; iOS ignores it.
      dialogTitle: `Partager ${track.title}`,
      UTI: 'public.mpeg-4-audio',
    });
    return { ok: true };
  } catch {
    // Dismissing the sheet isn't an error on every platform, but a genuine failure lands here too —
    // the caller only surfaces a message, so conflating them is harmless.
    return { ok: false, error: 'failed' };
  }
}
