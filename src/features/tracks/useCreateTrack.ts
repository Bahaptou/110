import { randomUUID } from 'expo-crypto';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { persistAudioFile } from './audioStorage';
import { createTrack, type CreateTrackResult } from './service';

export type PendingTrackAudio = {
  /** Temp URI from the document picker or the recorder — never stored directly, always copied first. */
  sourceUri: string;
  /** File extension without the dot (e.g. "m4a"), used to name the persisted copy. */
  extension: string;
  durationSeconds: number;
};

type UseCreateTrackResult = {
  save: (artistId: string, title: string, audio: PendingTrackAudio) => Promise<CreateTrackResult>;
};

/** Not scoped to any artist — used by the import/record flow, where the artist is chosen after the fact. */
export function useCreateTrack(): UseCreateTrackResult {
  const db = useSQLiteContext();

  const save = useCallback(
    async (artistId: string, title: string, audio: PendingTrackAudio) => {
      const trackId = randomUUID();
      const audioUri = persistAudioFile(audio.sourceUri, trackId, audio.extension);
      return createTrack(db, trackId, { artistId, title, audioUri, durationSeconds: audio.durationSeconds });
    },
    [db]
  );

  return { save };
}
