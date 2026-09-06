import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useArtists } from '../artists/useArtists';
import { usePlayback } from './PlaybackProvider';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const remaining = total % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
}

type Props = {
  onClose: () => void;
};

/** Full-screen "now playing" view — opened from the MiniPlayer, closed by the back chevron. */
export function PlayerScreen({ onClose }: Props): React.JSX.Element | null {
  const { currentTrack, queue, isPlaying, currentTime, duration, togglePlayPause, playNext, playPrevious, seekTo } =
    usePlayback();
  const { artists } = useArtists();
  const translateY = useSharedValue(0);

  // The Modal itself (see RootNavigator, animationType="slide") already animates the slide-down on
  // close — this gesture only needs to track the drag for live feedback and decide whether to call
  // onClose(). Animating translateY all the way to the bottom here too would play that slide twice.
  const panGesture = Gesture.Pan()
    // Only claims the gesture once the finger has clearly moved downward — a plain tap, or a
    // horizontal/upward drag, is left alone so buttons and the scrubber underneath still work.
    .activeOffsetY(15)
    .failOffsetY(-15)
    .failOffsetX([-15, 15])
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > DISMISS_DISTANCE || event.velocityY > DISMISS_VELOCITY) {
        translateY.value = withSpring(0);
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!currentTrack) return null;

  const artist = artists.find((a) => a.id === currentTrack.artistId);
  const index = queue.findIndex((t) => t.id === currentTrack.id);
  const hasPrevious = index > 0;
  const hasNext = index !== -1 && index < queue.length - 1;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={styles.backLabel}>‹ RÉDUIRE</Text>
              </Pressable>
              <Text style={styles.headerLabel}>EN LECTURE</Text>
              <View style={{ width: 70 }} />
            </View>

            <View style={styles.body}>
              <View style={[styles.cover, artist && { backgroundColor: artist.color }]}>
                <Text style={styles.coverInitials}>{artist?.name.slice(0, 2).toUpperCase() ?? '♪'}</Text>
              </View>

              <View style={styles.trackInfo}>
                <Text style={styles.title} numberOfLines={2}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.artistName} numberOfLines={1}>
                  {artist?.name ?? 'Artiste inconnu'}
                </Text>
              </View>

              <View style={styles.scrubberSection}>
                <Pressable
                  style={styles.scrubberTrack}
                  onPress={(event) => {
                    const width = event.nativeEvent.locationX;
                    // Rough tap-to-seek: proportion of a fixed-width bar rather than measuring the real layout.
                    seekTo(Math.max(0, (width / 280) * duration));
                  }}
                >
                  <View style={[styles.scrubberFill, { width: `${Math.min(100, progress * 100)}%` }]} />
                </Pressable>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{formatTime(currentTime)}</Text>
                  <Text style={styles.timeLabel}>{formatTime(duration)}</Text>
                </View>
              </View>

              <View style={styles.controls}>
                <Pressable onPress={playPrevious} disabled={!hasPrevious} hitSlop={12}>
                  <Text style={[styles.controlGlyph, !hasPrevious && styles.controlGlyphDisabled]}>⏮</Text>
                </Pressable>
                <Pressable style={styles.playButton} onPress={togglePlayPause}>
                  <Text style={styles.playGlyph}>{isPlaying ? '❙❙' : '▶'}</Text>
                </Pressable>
                <Pressable onPress={playNext} disabled={!hasNext} hitSlop={12}>
                  <Text style={[styles.controlGlyph, !hasNext && styles.controlGlyphDisabled]}>⏭</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 15, fontWeight: '700' },
  headerLabel: { color: '#888', fontSize: 11, letterSpacing: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 32 },
  cover: {
    width: 260,
    height: 260,
    borderRadius: 24,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitials: { color: '#000', fontWeight: '700', fontSize: 80, opacity: 0.85 },
  trackInfo: { alignItems: 'center', gap: 6 },
  title: { color: '#fff', fontWeight: '700', fontSize: 22, textAlign: 'center' },
  artistName: { color: '#888', fontSize: 15 },
  scrubberSection: { width: 280, gap: 8 },
  scrubberTrack: { width: 280, height: 4, borderRadius: 2, backgroundColor: '#2a2a2a' },
  scrubberFill: { height: 4, borderRadius: 2, backgroundColor: '#E8001C' },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeLabel: { color: '#888', fontSize: 11 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  controlGlyph: { color: '#fff', fontSize: 26 },
  controlGlyphDisabled: { color: '#333' },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8001C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: { color: '#fff', fontSize: 22 },
});
