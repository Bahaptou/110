import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { Cover } from '../../images/Cover';
import { usePlaylistIdsForTrack } from '../usePlaylistIdsForTrack';
import { type Playlist } from '../types';
import { usePlaylists } from '../usePlaylists';

/** Structurally typed: registered in the Tracks, Artists and Albums stacks. */
type Props = {
  route: { params: { trackId: string } };
  navigation: { goBack: () => void };
};

/** A track can sit in several playlists at once, so this is a multi-select rather than a single pick. */
export function ChangeTrackPlaylistsScreen({ route, navigation }: Props): React.JSX.Element {
  const { trackId } = route.params;
  const { playlists, addTrackTo, removeTrackFrom } = usePlaylists();
  const { playlistIds, loading } = usePlaylistIdsForTrack(trackId);
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedIds === null && !loading) {
      setSelectedIds(new Set(playlistIds));
    }
  }, [playlistIds, loading, selectedIds]);

  const selection = selectedIds ?? new Set(playlistIds);

  const toggle = (playlist: Playlist) => {
    const next = new Set(selection);
    if (next.has(playlist.id)) next.delete(playlist.id);
    else next.add(playlist.id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    setSubmitting(true);
    const before = new Set(playlistIds);
    for (const playlist of playlists) {
      const shouldBeIn = selection.has(playlist.id);
      const isIn = before.has(playlist.id);
      if (shouldBeIn && !isIn) await addTrackTo(playlist.id, trackId);
      else if (!shouldBeIn && isIn) await removeTrackFrom(playlist.id, trackId);
    }
    setSubmitting(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>PLAYLISTS</Text>
        <View style={{ width: 70 }} />
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(playlist: Playlist) => playlist.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.info}>Aucune playlist. Crée-en une depuis l'onglet Playlists.</Text>
        }
        renderItem={({ item }: { item: Playlist }) => {
          const selected = selection.has(item.id);
          return (
            <Pressable style={styles.row} onPress={() => toggle(item)}>
              <Cover
                imageUri={item.imageUri}
                color={item.color}
                fallbackText={item.name.slice(0, 2).toUpperCase()}
                size={44}
                borderRadius={12}
                fontSize={15}
              />
              <Text style={styles.rowLabel} numberOfLines={1}>
                {item.name}
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
