import { useAnimatedScrollHandler, useSharedValue, type SharedValue } from 'react-native-reanimated';

export type ScrollHeaderState = {
  /** Raw vertical scroll offset. Negative values mean the user is pulling down past the top (overscroll). */
  scrollY: SharedValue<number>;
  onScroll: ReturnType<typeof useAnimatedScrollHandler>;
};

/**
 * Shared scroll tracking for the Spotify-style "pull to stretch" header + reveal-on-pull search bar.
 * Every searchable list screen (Artists, Tracks, Albums, Playlists) wires its Animated.ScrollView /
 * Animated.FlatList to this, then derives its own interpolated styles from `scrollY` via
 * useAnimatedStyle — keeping the stretch math local to each screen's own header/tile layout.
 */
export function useScrollHeader(): ScrollHeaderState {
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return { scrollY, onScroll };
}
