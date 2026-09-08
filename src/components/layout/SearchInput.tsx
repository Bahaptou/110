import { Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  /** Applied to the wrapper, so callers can keep using flex:1 in a row. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Text field used by every search bar in the app. Shows a clear button as soon as something is
 * typed — the field keeps focus, so clearing goes straight back to typing rather than dismissing
 * whatever search mode the screen is in.
 */
export function SearchInput({
  value,
  onChangeText,
  placeholder,
  autoFocus = false,
  style,
}: Props): React.JSX.Element {
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555"
        style={styles.input}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <Pressable style={styles.clearButton} onPress={() => onChangeText('')} hitSlop={8}>
          <Text style={styles.clearGlyph}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 18,
    paddingRight: 6,
  },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 12, paddingHorizontal: 16 },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearGlyph: { color: '#888', fontSize: 12, lineHeight: 14 },
});
