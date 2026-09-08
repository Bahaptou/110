import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useAlbums } from '../albums/useAlbums';
import { useArtists } from '../artists/useArtists';
import { Cover } from '../images/Cover';
import { resolveTrackCoverUri } from '../images/trackCover';
import { useSettings } from '../settings/SettingsProvider';
import { usePlayback } from './PlaybackProvider';
import { SKIP_DISTANCE } from './swipeToSkip';

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
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    autoAdvance,
    toggleAutoAdvance,
    playNext,
    playPrevious,
  } = usePlayback();
  const { artists } = useArtists();
  const { albums } = useAlbums();
  const { preferArtistCover } = useSettings();
  const translateX = useSharedValue(0);

  // Swipe the bar sideways to skip: right for the previous sound, left for the next one. The bar
  // follows the finger, then springs back whether or not the swipe was long enough to count.
  const swipeGesture = Gesture.Pan()
    // Claims the gesture only on a clear horizontal drag, so tapping the bar still opens the player
    // and the play/pause and loop buttons keep working.
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX <= -SKIP_DISTANCE) {
        runOnJS(playNext)();
      } else if (event.translationX >= SKIP_DISTANCE) {
        runOnJS(playPrevious)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  if (!currentTrack) return null;

  const artist = artists.find((a) => a.id === currentTrack.artistId);
  const album = currentTrack.albumId === null ? undefined : albums.find((a) => a.id === currentTrack.albumId);
  // Same resolution as a track row, so the cover here matches the one in the list it was played from.
  const coverUri = resolveTrackCoverUri(
    currentTrack,
    { albumImageUri: album?.imageUri ?? '', artistImageUri: artist?.imageUri ?? '' },
    preferArtistCover
  );

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={animatedStyle}>
        <Pressable style={styles.container} onPress={onOpen}>
          <Cover
            imageUri={coverUri}
            color={artist?.color ?? '#333'}
            fallbackText=""
            size={40}
            borderRadius={10}
            fontSize={0}
          />
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {artist?.name ?? ''} · {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>
          <View style={styles.controls}>
            {/* Same loop/continuous toggle as the full player, in miniature. */}
            <Pressable
              style={[styles.modeButton, autoAdvance && styles.modeButtonActive]}
              onPress={toggleAutoAdvance}
              hitSlop={8}
            >
              <Text style={[styles.modeGlyph, autoAdvance && styles.modeGlyphActive]}>
                {autoAdvance ? '➜' : '↻'}
              </Text>
            </Pressable>
            <Pressable style={styles.playButton} onPress={togglePlayPause} hitSlop={8}>
              <Text style={styles.playGlyph}>{isPlaying ? '❙❙' : '▶'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
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
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  modeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3000',
    backgroundColor: '#1a1600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: { borderColor: '#E8001C', backgroundColor: '#1a0508' },
  // Neither state is "off" — loop and continuous are two active modes, so both stay legible.
  modeGlyph: { color: '#FFD600', fontSize: 13 },
  modeGlyphActive: { color: '#E8001C' },
});
