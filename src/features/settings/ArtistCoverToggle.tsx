import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSettings } from './SettingsProvider';

/**
 * Toggle shown under the search bar on every track list: when on, tracks without their own cover fall
 * back to the artist's image rather than the album's. Grey when off (the default), yellow when on.
 */
export function ArtistCoverToggle(): React.JSX.Element {
  const { preferArtistCover, togglePreferArtistCover } = useSettings();

  return (
    <Pressable style={styles.container} onPress={togglePreferArtistCover} hitSlop={6}>
      <View style={[styles.switch, preferArtistCover && styles.switchActive]}>
        <View style={[styles.knob, preferArtistCover && styles.knobActive]} />
      </View>
      <Text style={[styles.label, preferArtistCover && styles.labelActive]}>PHOTO ARTISTE</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  switch: {
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: { backgroundColor: '#FFD600' },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#555' },
  knobActive: { backgroundColor: '#000', alignSelf: 'flex-end' },
  label: { color: '#555', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  labelActive: { color: '#FFD600' },
});
