import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

type Props = {
  scrollY: SharedValue<number>;
  children: ReactNode;
};

const MAX_STRETCH = 60;

/**
 * Wraps the title/action row shown above a searchable list. Scales up from its own center when the
 * user pulls down past the top of the list (negative scrollY), mimicking Spotify/Apple Music's
 * header stretch. No-ops (scale 1) for normal downward scrolling.
 */
export function StretchHeader({ scrollY, children }: Props): React.JSX.Element {
  const animatedStyle = useAnimatedStyle(() => {
    const pull = Math.max(0, -scrollY.value);
    const scale = 1 + interpolate(pull, [0, MAX_STRETCH], [0, 0.12], 'clamp');
    return { transform: [{ scale }] };
  });

  return (
    <View style={styles.clip}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Stretch scales outward; clipping here keeps it from overlapping the search bar below.
  clip: { overflow: 'visible' },
});
