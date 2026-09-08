import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { type Artist } from '../../artists/types';
import { useArtists } from '../../artists/useArtists';
import { Cover } from '../../images/Cover';
import { COVER_COLORS, CoverPicker } from '../../images/CoverPicker';
import { useAlbums } from '../useAlbums';

/** Structurally typed: this screen is registered in both the Albums stack and the Artists stack. */
type Props = {
  route: { params?: { artistId?: string } };
  navigation: { goBack: () => void };
};

export function AddAlbumScreen({ route, navigation }: Props): React.JSX.Element {
  const { artists } = useArtists();
  const { addAlbum } = useAlbums();
  const [name, setName] = useState('');
  // Pre-selected when coming from an artist's page, where the artist is already known.
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(route.params?.artistId ?? null);
  const [color, setColor] = useState<string>(COVER_COLORS[0]);
  const [imageUri, setImageUri] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && selectedArtistId !== null && !submitting;

  const handleSave = async () => {
    if (!selectedArtistId) return;
    setSubmitting(true);
    const result = await addAlbum({ artistId: selectedArtistId, name, color, imageUri });
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
        <Text style={styles.headerTitle}>NOUVEL ALBUM</Text>
        <View style={{ width: 70 }} />
      </View>

      <Text style={styles.sectionLabel}>NOM</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="ex. Soirées canapé"
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

      <Text style={styles.sectionLabel}>ARTISTE</Text>
      {artists.length === 0 ? (
        <Text style={styles.info}>Ajoute d'abord un ami dans l'onglet Artistes.</Text>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(artist: Artist) => artist.id}
          contentContainerStyle={styles.artistList}
          renderItem={({ item }: { item: Artist }) => {
            const isSelected = selectedArtistId === item.id;
            return (
              <Pressable
                style={[styles.artistRow, isSelected && styles.artistRowSelected]}
                onPress={() => setSelectedArtistId(item.id)}
              >
                <Cover
                  imageUri={item.imageUri}
                  color={item.color}
                  fallbackText={item.name.slice(0, 2).toUpperCase()}
                  size={40}
                  borderRadius={12}
                  fontSize={14}
                />
                <Text style={styles.artistName}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        <Button label="CRÉER L'ALBUM" onPress={handleSave} disabled={!canSubmit} />
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
  sectionLabel: { color: '#888', fontSize: 11, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
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
  info: { color: '#888', paddingHorizontal: 16, fontSize: 13 },
  artistList: { paddingHorizontal: 16, gap: 8 },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111',
  },
  artistRowSelected: { borderColor: '#E8001C' },
  artistName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footer: { padding: 16 },
});
