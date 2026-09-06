import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';

const LOAD_TIMEOUT_MS = 8000;

type UseAudioDurationResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'loaded'; durationSeconds: number }
  | { status: 'failed' };

/**
 * Loads a local audio file just long enough to read its duration (never plays it). Distinguishes
 * "still loading" from "failed to load" via a timeout — a corrupt file or an unsupported codec
 * expo-audio can't decode never flips isLoaded, so without a timeout this would hang forever instead
 * of surfacing an error the save screen can block on.
 */
export function useAudioDuration(fileUri: string | null): UseAudioDurationResult {
  const player = useAudioPlayer(fileUri);
  const status = useAudioPlayerStatus(player);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
    if (!fileUri) return;
    const timer = setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [fileUri]);

  if (!fileUri) return { status: 'idle' };
  if (status.isLoaded && status.duration > 0) return { status: 'loaded', durationSeconds: status.duration };
  if (timedOut) return { status: 'failed' };
  return { status: 'loading' };
}
