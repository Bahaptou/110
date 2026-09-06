/**
 * Supported audio formats for import/recording — the standard mobile voice-memo formats, chosen
 * because they're what iOS/Android record natively and expo-audio reliably decodes on both
 * platforms. Anything else is rejected at import time rather than silently failing at playback.
 */
export const SUPPORTED_AUDIO_EXTENSIONS = ['m4a', 'aac', 'mp3', 'wav'] as const;
export type SupportedAudioExtension = (typeof SUPPORTED_AUDIO_EXTENSIONS)[number];

const SUPPORTED_MIME_TYPES = new Set([
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4', // .m4a files are frequently reported as audio/mp4 by Android's content resolver
  'audio/aac',
  'audio/mpeg', // .mp3
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
]);

function extensionFromName(name: string): string | null {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex === -1 ? null : name.slice(dotIndex + 1).toLowerCase();
}

export type AudioFormatCheck = { ok: true; extension: SupportedAudioExtension } | { ok: false; reason: string };

/**
 * Validates a picked file against SUPPORTED_AUDIO_EXTENSIONS using both its declared mimeType and its
 * file extension — neither alone is trustworthy (Android content resolvers report inconsistent mime
 * types; a renamed file can carry the wrong extension), so the extension is the source of truth for
 * naming the persisted copy, gated by the mime type actually looking like audio.
 */
export function checkAudioFormat(name: string, mimeType: string | null | undefined): AudioFormatCheck {
  const extension = extensionFromName(name);
  if (!extension || !SUPPORTED_AUDIO_EXTENSIONS.includes(extension as SupportedAudioExtension)) {
    return {
      ok: false,
      reason: `Format non supporté (.${extension ?? '?'}). Formats acceptés : ${SUPPORTED_AUDIO_EXTENSIONS.join(', ')}.`,
    };
  }
  if (mimeType && !mimeType.startsWith('audio/') && !SUPPORTED_MIME_TYPES.has(mimeType)) {
    return { ok: false, reason: "Ce fichier ne semble pas être un fichier audio." };
  }
  return { ok: true, extension: extension as SupportedAudioExtension };
}
