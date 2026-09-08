import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { COVER_COLORS, CoverPicker } from '../../images/CoverPicker';
import { usePlaylists } from '../usePlaylists';

type Props = {
  navigation: { goBack: () => void };
};

export function AddPlaylistScreen({ navigation }: Props): React.JSX.Element {
  const { addPlaylist } = usePlaylists();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COVER_COLORS[0]);
  const [imageUri, setImageUri] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    const result = await addPlaylist({ name, color, imageUri });
    setSubmitting(false);
    if (result.ok) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>NOUVELLE PLAYLIST</Text>
        <View style={{ width: 70 }} />
      </View>

      <Text style={styles.sectionLabel}>NOM</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="ex. Rires du vendredi"
        placeholderTextColor="#555"
        style={styles.input}
        autoFocus
      />

      <Text style={styles.sectionLabel}>POCHETTE</Text>
      <View style={styles.coverPickerWrapper}>
        <CoverPicker
          imageUri={imageUri}
          color={color}
          fallbackText={name.slice(0, 2).toUpperCase()}
          onImageChange={setImageUri}
          onColorChange={setColor}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label="CRÉER LA PLAYLIST"
          onPress={handleSave}
          disabled={submitting || name.trim().length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 15, fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  sectionLabel: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  input: {
    marginHorizontal: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 18,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  coverPickerWrapper: { paddingHorizontal: 16 },
  footer: { flex: 1, justifyContent: 'flex-end', padding: 16 },
});
