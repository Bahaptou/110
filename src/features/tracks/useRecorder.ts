import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useState } from 'react';

/**
 * Where the recording flow currently stands.
 *
 * - `idle`: nothing recorded yet
 * - `recording`: the mic is live
 * - `denied`: the user refused microphone access
 * - `failed`: the recorder itself errored out
 */
export type RecorderStatus = 'idle' | 'recording' | 'denied' | 'failed';

export type FinishedRecording = {
  /** Temp URI from the recorder — must be copied by persistAudioFile before it's stored. */
  sourceUri: string;
  extension: string;
  durationSeconds: number;
};

type UseRecorderResult = {
  status: RecorderStatus;
  /** Seconds elapsed, updated while recording. */
  elapsedSeconds: number;
  start: () => Promise<void>;
  /** Returns the finished recording, or null if it produced no usable file. */
  stop: () => Promise<FinishedRecording | null>;
  /** Stops and discards whatever was being recorded. */
  cancel: () => Promise<void>;
};

/** Recordings are m4a, matching HIGH_QUALITY's container and the formats the import flow accepts. */
const RECORDING_EXTENSION = 'm4a';

/**
 * Microphone recording, kept out of the screen so the UI only deals with a status and two actions.
 * The produced file lives in the cache — the caller is responsible for persisting it, exactly like
 * an imported file (see audioStorage.ts).
 */
export function useRecorder(): UseRecorderResult {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [status, setStatus] = useState<RecorderStatus>('idle');

  const start = useCallback(async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setStatus('denied');
      return;
    }

    try {
      // Android needs recording explicitly allowed in the audio mode, and playsInSilentMode keeps
      // the setting the playback provider relies on from being dropped here.
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus('recording');
    } catch {
      setStatus('failed');
    }
  }, [recorder]);

  const stop = useCallback(async (): Promise<FinishedRecording | null> => {
    if (status !== 'recording') return null;

    // Read the duration before stopping — the recorder resets its counter once stopped.
    const durationSeconds = recorderState.durationMillis / 1000;
    try {
      await recorder.stop();
    } catch {
      setStatus('failed');
      return null;
    }
    // Hand playback back its normal mode, otherwise Android keeps routing audio for recording.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    setStatus('idle');

    const sourceUri = recorder.uri;
    if (sourceUri === null || sourceUri.length === 0) return null;
    return { sourceUri, extension: RECORDING_EXTENSION, durationSeconds };
  }, [recorder, recorderState.durationMillis, status]);

  const cancel = useCallback(async () => {
    if (status === 'recording') {
      try {
        await recorder.stop();
      } catch {
        // Nothing to salvage — the file is being discarded anyway.
      }
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    }
    setStatus('idle');
  }, [recorder, status]);

  return {
    status,
    elapsedSeconds: recorderState.durationMillis / 1000,
    start,
    stop,
    cancel,
  };
}
