import { Image, StyleSheet, Text, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  /** Stored image URI, or '' to fall back to the colored tile. */
  imageUri: string;
  /** Fallback tile colour (the artist's assigned colour). */
  color: string;
  /** Text shown on the fallback tile — initials for an artist, a glyph for a track. */
  fallbackText: string;
  size: number;
  borderRadius: number;
  fontSize: number;
  /** Applied to whichever branch renders — kept to layout-safe props shared by View and Image. */
  style?: StyleProp<ViewStyle & ImageStyle>;
};

/**
 * Single place deciding how a cover renders: the stored image when there is one, otherwise the
 * coloured initials tile the app used before images existed.
 */
export function Cover({
  imageUri,
  color,
  fallbackText,
  size,
  borderRadius,
  fontSize,
  style,
}: Props): React.JSX.Element {
  const dimensions = { width: size, height: size, borderRadius };

  if (imageUri.length > 0) {
    return <Image source={{ uri: imageUri }} style={[dimensions, style]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.fallback, dimensions, { backgroundColor: color }, style]}>
      <Text style={[styles.fallbackText, { fontSize }]}>{fallbackText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#000', fontWeight: '700', opacity: 0.85 },
});
