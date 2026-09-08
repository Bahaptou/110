import { StyleSheet } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { SearchInput } from './SearchInput';

type Props = {
  scrollY: SharedValue<number>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
};

const MAX_PULL_OFFSET = 40;

/**
 * Search input sitting between the stretch header and the list. Nudges down slightly as the user
 * pulls past the top, following the header's stretch instead of staying rigid — same reveal-on-pull
 * feel as Spotify's search bar.
 */
export function SearchBar({ scrollY, value, onChangeText, placeholder }: Props): React.JSX.Element {
  const animatedStyle = useAnimatedStyle(() => {
    const pull = Math.max(0, -scrollY.value);
    const translateY = interpolate(pull, [0, MAX_PULL_OFFSET], [0, MAX_PULL_OFFSET * 0.4], 'clamp');
    return { transform: [{ translateY }] };
  });

  return (
    <Animated.View style={animatedStyle}>
      <SearchInput value={value} onChangeText={onChangeText} placeholder={placeholder} style={styles.input} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  input: { marginHorizontal: 16, marginBottom: 12 },
});
