import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  isEditing: boolean;
  onDelete: () => void;
  children: ReactNode;
  /** Forwarded to the wrapping Animated.View — needed so flex: 1 grid tiles keep sizing correctly (e.g. numColumns layouts). */
  style?: StyleProp<ViewStyle>;
};

const JIGGLE_DEGREES = 1.5;
const JIGGLE_DURATION_MS = 130;

/** Wraps a grid tile with the iOS-style "jiggle mode" shake + delete badge, shown while isEditing is true. */
export function JiggleTile({ isEditing, onDelete, children, style }: Props): React.JSX.Element {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isEditing) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-JIGGLE_DEGREES, { duration: JIGGLE_DURATION_MS, easing: Easing.inOut(Easing.quad) }),
          withTiming(JIGGLE_DEGREES, { duration: JIGGLE_DURATION_MS * 2, easing: Easing.inOut(Easing.quad) }),
          withTiming(0, { duration: JIGGLE_DURATION_MS, easing: Easing.inOut(Easing.quad) })
        ),
        -1
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 100 });
    }
    return () => cancelAnimation(rotation);
  }, [isEditing, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
      {isEditing && (
        <Pressable style={styles.badge} onPress={onDelete} hitSlop={8}>
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeGlyph}>−</Text>
          </View>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: -6, left: -6, zIndex: 10 },
  badgeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8001C',
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeGlyph: { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 18 },
});
