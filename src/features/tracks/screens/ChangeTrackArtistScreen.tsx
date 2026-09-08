import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Artist } from '../../artists/types';
import { useArtists } from '../../artists/useArtists';
import { useAllTracks } from '../useAllTracks';

/**
 * Typed structurally rather than against one stack's param list, because this screen is registered in
 * both the Tracks stack and the Artists stack (the "⋯" menu exists on track rows in both places).
 */
type Props = {
  route: { params: { trackId: string } };
  navigation: { goBack: () => void };
};

/** Full screen (not a floating sheet — those were unstable) for reassigning a track's artist. */
export function ChangeTrackArtistScreen({ route, navigation }: Props): React.JSX.Element {
  const { trackId } = route.params;
  const { artists } = useArtists();
  const { tracks, changeArtist } = useAllTracks();
  const track = tracks.find((t) => t.id === trackId);
  const [search, setSearch] = useState('');

  const filteredArtists = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return artists;
    return artists.filter((artist) => artist.name.toLowerCase().includes(query));
  }, [artists, search]);

  const handleSelect = (artistId: string) => {
    if (track) changeArtist(track, artistId);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>CHANGER D'ARTISTE</Text>
        <View style={{ width: 70 }} />
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Rechercher un artiste"
        placeholderTextColor="#555"
        style={styles.searchInput}
      />

      <FlatList
        data={filteredArtists}
        keyExtractor={(artist: Artist) => artist.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Aucun artiste.</Text>}
        renderItem={({ item }: { item: Artist }) => {
          const isCurrent = item.id === track?.artistId;
          return (
            <Pressable style={styles.row} onPress={() => !isCurrent && handleSelect(item.id)}>
              <View style={[styles.avatar, { backgroundColor: item.color }]}>
                <Text style={styles.avatarInitials}>{item.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.rowLabel}>{item.name}</Text>
              {isCurrent && <Text style={styles.currentBadge}>ACTUEL</Text>}
            </Pressable>
          );
        }}
      />
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
  searchInput: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 18,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  list: { paddingHorizontal: 16 },
  empty: { color: '#888', fontSize: 13, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#000', fontWeight: '700', fontSize: 14 },
  rowLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  currentBadge: { color: '#E8001C', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
