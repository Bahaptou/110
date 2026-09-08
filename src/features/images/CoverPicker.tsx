import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Cover } from './Cover';
import { usePickImage } from './usePickImage';

/** Same palette artists are assigned from, offered here as a manual choice. */
export const COVER_COLORS = ['#E8001C', '#FFD600', '#0057FF', '#00C896', '#FF6B00', '#C800E8'] as const;

type Props = {
  /** Currently chosen photo, or '' when relying on a colour. */
  imageUri: string;
  color: string;
  /** Shown on the preview tile while no photo is chosen. */
  fallbackText: string;
  onImageChange: (imageUri: string) => void;
  onColorChange: (color: string) => void;
};

/**
 * Cover chooser used when creating an artist, album or track: pick a colour from the palette, or
 * replace it with a photo from the library or the camera. Choosing a photo doesn't discard the
 * colour — it stays as the fallback if the photo is later removed.
 */
export function CoverPicker({
  imageUri,
  color,
  fallbackText,
  onImageChange,
  onColorChange,
}: Props): React.JSX.Element {
  const { pickImage } = usePickImage();

  const choosePhoto = async (source: 'library' | 'camera') => {
    const uri = await pickImage(source);
    if (uri) onImageChange(uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewRow}>
        <Cover
          imageUri={imageUri}
          color={color}
          fallbackText={fallbackText}
          size={88}
          borderRadius={20}
          fontSize={30}
        />
        <View style={styles.photoActions}>
          <Pressable style={styles.photoButton} onPress={() => choosePhoto('library')}>
            <Text style={styles.photoButtonLabel}>GALERIE</Text>
          </Pressable>
          <Pressable style={styles.photoButton} onPress={() => choosePhoto('camera')}>
            <Text style={styles.photoButtonLabel}>PHOTO</Text>
          </Pressable>
          {imageUri.length > 0 && (
            <Pressable style={styles.photoButton} onPress={() => onImageChange('')}>
              <Text style={styles.photoButtonLabelMuted}>RETIRER</Text>
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatches}>
        {COVER_COLORS.map((swatch) => (
          <Pressable
            key={swatch}
            style={[styles.swatch, { backgroundColor: swatch }, swatch === color && styles.swatchSelected]}
            onPress={() => onColorChange(swatch)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // No horizontal padding of its own — the parent screen decides the margins.
  container: { gap: 12 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  photoActions: { flex: 1, gap: 8 },
  photoButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  photoButtonLabel: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  photoButtonLabelMuted: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  swatches: { gap: 10, paddingVertical: 2 },
  swatch: { width: 36, height: 36, borderRadius: 12 },
  swatchSelected: { borderWidth: 3, borderColor: '#fff' },
});
