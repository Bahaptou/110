import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useArtists } from '../artists/useArtists';
import { usePlayback } from './PlaybackProvider';

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

type Props = {
  onOpen: () => void;
};

/** Thin bar shown above the tab bar whenever a track is loaded, regardless of which tab is active. */
export function MiniPlayer({ onOpen }: Props): React.JSX.Element | null {
  const { currentTrack, isPlaying, currentTime, duration, togglePlayPause } = usePlayback();
  const { artists } = useArtists();

  if (!currentTrack) return null;

  const artist = artists.find((a) => a.id === currentTrack.artistId);

  return (
    <Pressable style={styles.container} onPress={onOpen}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {artist?.name ?? ''} · {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
      <Pressable style={styles.playButton} onPress={togglePlayPause} hitSlop={8}>
        <Text style={styles.playGlyph}>{isPlaying ? '❙❙' : '▶'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 60,
    paddingHorizontal: 14,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD600',
  },
  info: { flex: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: '600' },
  subtitle: { color: '#888', fontSize: 11, marginTop: 2 },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8001C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: { color: '#fff', fontSize: 13 },
});
