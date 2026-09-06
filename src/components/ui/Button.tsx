import { Pressable, StyleSheet, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'accent';
  disabled?: boolean;
};

/** Base action button — red primary CTA, yellow accent for secondary actions (see design-reference.md). */
export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps): React.JSX.Element {
  const background = disabled ? '#1a1a1a' : variant === 'primary' ? '#E8001C' : '#FFD600';
  const color = disabled ? '#555' : variant === 'primary' ? '#fff' : '#000';

  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.button, { backgroundColor: background }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  label: {
    // TODO: switch to JetBrains Mono once font loading is set up (see design-implementation.md).
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
});
