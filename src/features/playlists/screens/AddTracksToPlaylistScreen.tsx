import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { SearchInput } from '../../../components/layout/SearchInput';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { useArtists } from '../../artists/useArtists';
import { Cover } from '../../images/Cover';
import { type Track } from '../../tracks/types';
import { useAllTracks } from '../../tracks/useAllTracks';
import { usePlaylistTracks } from '../../tracks/useScopedTracks';
import { usePlaylists } from '../usePlaylists';

type Props = {
  route: { params: { playlistId: string } };
  navigation: { goBack: () => void };
};

/**
 * Picks which sounds a playlist holds. Unlike an album, a playlist mixes artists, so the whole
 * library is offered. Tracks already in it start checked, so this also serves to remove them.
 */
export function AddTracksToPlaylistScreen({ route, navigation }: Props): React.JSX.Element {
  const { playlistId } = route.params;
  const { playlists, addTrackTo, removeTrackFrom } = usePlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  const { tracks } = useAllTracks();
  const { tracks: playlistTracks, refresh: refreshPlaylistTracks } = usePlaylistTracks(playlistId);
  const { artists } = useArtists();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Seed the selection once the playlist's current contents have loaded.
  useEffect(() => {
    if (selectedIds === null && playlistTracks.length > 0) {
      setSelectedIds(new Set(playlistTracks.map((t) => t.id)));
    }
  }, [playlistTracks, selectedIds]);

  const selection = selectedIds ?? new Set(playlistTracks.map((t) => t.id));

  const candidates = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search]);

  const toggle = (track: Track) => {
    const next = new Set(selection);
    if (next.has(track.id)) next.delete(track.id);
    else next.add(track.id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    setSubmitting(true);
    const before = new Set(playlistTracks.map((t) => t.id));
    for (const track of tracks) {
      const shouldBeIn = selection.has(track.id);
      const isIn = before.has(track.id);
      if (shouldBeIn && !isIn) await addTrackTo(playlistId, track.id);
      else if (!shouldBeIn && isIn) await removeTrackFrom(playlistId, track.id);
    }
    await refreshPlaylistTracks();
    setSubmitting(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>SONS DE LA PLAYLIST</Text>
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
            {search.trim().length > 0 ? 'Aucun résultat.' : "Aucun morceau dans la bibliothèque."}
          </Text>
        }
        renderItem={({ item }: { item: Track }) => {
          const selected = selection.has(item.id);
          const artist = artists.find((a) => a.id === item.artistId);
          return (
            <Pressable style={styles.row} onPress={() => toggle(item)}>
              <Cover
                imageUri={item.imageUri.length > 0 ? item.imageUri : (artist?.imageUri ?? '')}
                color={artist?.color ?? '#111'}
                fallbackText="♪"
                size={44}
                borderRadius={12}
                fontSize={16}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rowArtist} numberOfLines={1}>
                  {artist?.name ?? ''}
                </Text>
              </View>
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkboxGlyph}>✓</Text>}
              </View>
            </Pressable>
          );
        }}
      />

      <View style={styles.footer}>
        <Button label="VALIDER" onPress={handleSave} disabled={submitting || !playlist} />
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
  rowText: { flex: 1 },
  rowLabel: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rowArtist: { color: '#888', fontSize: 12, marginTop: 2 },
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
