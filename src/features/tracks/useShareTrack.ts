import { useCallback } from 'react';
import { Alert } from 'react-native';

import { shareTrack } from './shareTrack';
import { type Track } from './types';

type UseShareTrackResult = {
  share: (track: Track) => Promise<void>;
};

const ERROR_MESSAGES: Record<'no_audio' | 'unavailable' | 'failed', string> = {
  no_audio: "Ce morceau n'a pas de fichier audio à partager.",
  unavailable: "Le partage n'est pas disponible sur cet appareil.",
  failed: "Le partage n'a pas abouti.",
};

/**
 * Share action for a track, with its error reporting. Every screen showing TrackActionsSheet uses
 * this rather than plumbing a handler down from each one.
 */
export function useShareTrack(): UseShareTrackResult {
  const share = useCallback(async (track: Track) => {
    const result = await shareTrack(track);
    // A dismissed sheet reports 'failed' too, so staying silent on it avoids nagging the user who
    // simply changed their mind.
    if (!result.ok && result.error !== 'failed') {
      Alert.alert('Partage impossible', ERROR_MESSAGES[result.error]);
    }
  }, []);

  return { share };
}
