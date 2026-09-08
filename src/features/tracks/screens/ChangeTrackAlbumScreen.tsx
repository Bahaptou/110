import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Album } from '../../albums/types';
import { useAlbums } from '../../albums/useAlbums';
import { Cover } from '../../images/Cover';
import { useAllTracks } from '../useAllTracks';

/** Structurally typed: registered in both the Tracks stack and the Artists stack. */
type Props = {
  route: { params: { trackId: string } };
  navigation: { goBack: () => void };
};

/** Picks which of the artist's albums a track belongs to — a track can be in at most one. */
export function ChangeTrackAlbumScreen({ route, navigation }: Props): React.JSX.Element {
  const { trackId } = route.params;
  const { tracks, changeAlbum } = useAllTracks();
  const track = tracks.find((t) => t.id === trackId);
  // Only the track's own artist's albums: every track in an album shares that album's artist.
  const { albums } = useAlbums(track?.artistId);

  const handleSelect = async (album: Album | null) => {
    if (track) await changeAlbum(track, album);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>ALBUM</Text>
        <View style={{ width: 70 }} />
      </View>

      <FlatList
        data={albums}
        keyExtractor={(album: Album) => album.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Pressable style={styles.row} onPress={() => handleSelect(null)}>
            <View style={styles.noAlbumTile}>
              <Text style={styles.noAlbumGlyph}>—</Text>
            </View>
            <Text style={styles.rowLabel}>Aucun album</Text>
            {track?.albumId === null && <Text style={styles.currentBadge}>ACTUEL</Text>}
          </Pressable>
        }
        ListEmptyComponent={
          <Text style={styles.info}>Cet artiste n'a pas encore d'album. Crée-en un depuis sa page.</Text>
        }
        renderItem={({ item }: { item: Album }) => {
          const isCurrent = track?.albumId === item.id;
          return (
            <Pressable style={styles.row} onPress={() => handleSelect(item)}>
              <Cover
                imageUri={item.imageUri}
                color={item.color}
                fallbackText={item.name.slice(0, 2).toUpperCase()}
                size={44}
                borderRadius={12}
                fontSize={15}
              />
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
  list: { paddingHorizontal: 16 },
  info: { color: '#888', fontSize: 13, paddingVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  noAlbumTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAlbumGlyph: { color: '#555', fontSize: 20 },
  rowLabel: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '600' },
  currentBadge: { color: '#E8001C', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
