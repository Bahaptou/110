import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { SearchInput } from '../../../components/layout/SearchInput';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { useArtists } from '../../artists/useArtists';
import { Cover } from '../../images/Cover';
import { type Track } from '../../tracks/types';
import { useArtistTracks } from '../../tracks/useScopedTracks';
import { useAlbums } from '../useAlbums';

/** Structurally typed: registered in both the Albums stack and the Artists stack. */
type Props = {
  route: { params: { albumId: string } };
  navigation: { goBack: () => void };
};

/**
 * Adds the artist's tracks to this album, several at a time. Only that artist's tracks are listed —
 * every track in an album shares the album's artist.
 */
export function AddTracksToAlbumScreen({ route, navigation }: Props): React.JSX.Element {
  const { albumId } = route.params;
  const { albums } = useAlbums();
  const album = albums.find((a) => a.id === albumId);
  const { artists } = useArtists();
  const artist = artists.find((a) => a.id === album?.artistId);
  const { tracks, changeAlbum } = useArtistTracks(album?.artistId ?? '');
  const [search, setSearch] = useState('');
  /** null until the track list has loaded, then seeded with whatever is already in the album. */
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Candidates are the artist's tracks that are either unassigned or already in this album — a track
  // in a different album has to be moved from its own screen rather than silently stolen here.
  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = tracks.filter((track) => track.albumId === null || track.albumId === albumId);
    if (query.length === 0) return base;
    return base.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search, albumId]);

  const selection = selectedIds ?? new Set(tracks.filter((t) => t.albumId === albumId).map((t) => t.id));

  const toggle = (track: Track) => {
    const next = new Set(selection);
    if (next.has(track.id)) next.delete(track.id);
    else next.add(track.id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    if (!album) return;
    setSubmitting(true);
    for (const track of tracks) {
      const shouldBeIn = selection.has(track.id);
      const isIn = track.albumId === albumId;
      if (shouldBeIn && !isIn) await changeAlbum(track, album);
      else if (!shouldBeIn && isIn) await changeAlbum(track, null);
    }
    setSubmitting(false);
    navigation.goBack();
  };

  if (!album) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.info}>Cet album n'existe pas ou plus.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>SONS DE L'ALBUM</Text>
        <View style={{ width: 70 }} />
      </View>

      <SearchInput
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher un morceau"
        style={styles.searchInput}
      />

      <FlatList
        data={candidates}
        keyExtractor={(track: Track) => track.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.info}>
            {search.trim().length > 0
              ? 'Aucun résultat.'
              : `${artist?.name ?? 'Cet artiste'} n'a pas de son disponible à ajouter.`}
          </Text>
        }
        renderItem={({ item }: { item: Track }) => {
          const selected = selection.has(item.id);
          return (
            <Pressable style={styles.row} onPress={() => toggle(item)}>
              <Cover
                imageUri={item.imageUri.length > 0 ? item.imageUri : album.imageUri}
                color={album.color}
                fallbackText="♪"
                size={44}
                borderRadius={12}
                fontSize={16}
              />
              <Text style={styles.rowLabel} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkboxGlyph}>✓</Text>}
              </View>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <Button label="VALIDER" onPress={handleSave} disabled={submitting} />
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
  searchInput: { marginHorizontal: 16, marginBottom: 12 },
  list: { paddingHorizontal: 16 },
  info: { color: '#888', fontSize: 13, paddingVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: '#E8001C', borderColor: '#E8001C' },
  checkboxGlyph: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: { padding: 16 },
});
