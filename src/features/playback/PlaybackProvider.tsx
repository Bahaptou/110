import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { type Track } from '../tracks/types';

type PlaybackContextValue = {
  /** The full queue currently being played through (e.g. the filtered track list on screen when play was tapped). */
  queue: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  /** Starts playing `track`, replacing the queue with `queue` (so next/previous navigate through it). */
  play: (track: Track, queue: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (seconds: number) => void;
  /** Stops playback and clears state if `trackId` is the one currently loaded — call before deleting a track. */
  stopIfPlaying: (trackId: string) => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    // Without this, iOS silences playback whenever the physical mute switch is on — recorded voice
    // memos should still play, same as Voice Memos/Messages do.
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  const playTrack = useCallback(
    (track: Track, nextQueue: Track[]) => {
      player.replace(track.audioUri);
      player.play();
      setCurrentTrack(track);
      setQueue(nextQueue);
    },
    [player]
  );

  const playNext = useCallback(() => {
    if (!currentTrack) return;
    const index = queue.findIndex((t) => t.id === currentTrack.id);
    const next = index === -1 ? undefined : queue[index + 1];
    if (next) playTrack(next, queue);
  }, [currentTrack, queue, playTrack]);

  const playPrevious = useCallback(() => {
    if (!currentTrack) return;
    const index = queue.findIndex((t) => t.id === currentTrack.id);
    const previous = index === -1 ? undefined : queue[index - 1];
    if (previous) playTrack(previous, queue);
  }, [currentTrack, queue, playTrack]);

  const playNextRef = useRef(playNext);
  playNextRef.current = playNext;

  useEffect(() => {
    if (status.didJustFinish) {
      playNextRef.current();
    }
  }, [status.didJustFinish]);

  const togglePlayPause = useCallback(() => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player, status.playing]);

  const seekTo = useCallback((seconds: number) => player.seekTo(seconds), [player]);

  const stopIfPlaying = useCallback(
    (trackId: string) => {
      setCurrentTrack((current) => {
        if (current?.id !== trackId) return current;
        player.pause();
        setQueue((q) => q.filter((t) => t.id !== trackId));
        return null;
      });
    },
    [player]
  );

  const value = useMemo<PlaybackContextValue>(
    () => ({
      queue,
      currentTrack,
      isPlaying: status.playing,
      currentTime: status.currentTime,
      duration: status.duration,
      play: playTrack,
      togglePlayPause,
      playNext,
      playPrevious,
      seekTo,
      stopIfPlaying,
    }),
    [
      queue,
      currentTrack,
      status.playing,
      status.currentTime,
      status.duration,
      playTrack,
      togglePlayPause,
      playNext,
      playPrevious,
      seekTo,
      stopIfPlaying,
    ]
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}
