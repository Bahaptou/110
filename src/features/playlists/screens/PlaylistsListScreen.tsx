import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JiggleTile } from '../../../components/layout/JiggleTile';
import { SearchBar } from '../../../components/layout/SearchBar';
import { StretchHeader } from '../../../components/layout/StretchHeader';
import { useEditMode } from '../../../components/layout/useEditMode';
import { useScrollHeader } from '../../../components/layout/useScrollHeader';
import { Cover } from '../../images/Cover';
import { usePlayback } from '../../playback/PlaybackProvider';
import { CrossSearchResults, type CrossSearchResult } from '../../search/CrossSearchResults';
import { useCrossSearch } from '../../search/useCrossSearch';
import { type PlaylistsStackParamList } from '../PlaylistsStack';
import { type Playlist } from '../types';
import { usePlaylists } from '../usePlaylists';

type Props = NativeStackScreenProps<PlaylistsStackParamList, 'PlaylistsList'>;

const AnimatedFlatList = Animated.FlatList;

export function PlaylistsListScreen({ navigation }: Props): React.JSX.Element {
  const { playlists, loading, error, deletePlaylist } = usePlaylists();
  const { play } = usePlayback();
  const { scrollY, onScroll } = useScrollHeader();
  const { isEditing, enter, exit } = useEditMode();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();

  const filteredPlaylists = useMemo(() => {
    if (query.length === 0) return playlists;
    return playlists.filter((playlist) => playlist.name.toLowerCase().includes(query));
  }, [playlists, query]);

  // Same as the other two list screens: playlists keep priority, everything else follows underneath.
  const { results: crossResults, tracks: crossTracks } = useCrossSearch(query, 'playlist');

  const openResult = useCallback(
    (result: CrossSearchResult) => {
      if (result.kind === 'artist') {
        navigation.navigate('ArtistDetail', { artistId: result.id });
        return;
      }
      if (result.kind === 'album') {
        navigation.navigate('AlbumDetail', { albumId: result.id });
        return;
      }
      // Tapping a sound plays it straight away, looping over the rest of the search results.
      const track = crossTracks.find((t) => t.id === result.id);
      if (track) play(track, crossTracks);
    },
    [navigation, play, crossTracks]
  );

  const confirmDelete = (playlist: Playlist) => {
    Alert.alert(
      `Supprimer ${playlist.name} ?`,
      'Cette playlist sera supprimée définitivement. Les morceaux qu\'elle contient sont conservés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deletePlaylist(playlist);
            exit();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.stack}>
        {isEditing && <Pressable style={StyleSheet.absoluteFill} onPress={exit} />}
        <AnimatedFlatList
          data={filteredPlaylists}
          keyExtractor={(playlist: Playlist) => playlist.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={isEditing ? exit : undefined}
          ListHeaderComponent={
            <>
              <StretchHeader scrollY={scrollY}>
                <View style={styles.header} pointerEvents={isEditing ? 'none' : 'auto'}>
                  <Text style={styles.title}>PLAYLISTS</Text>
                  <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddPlaylist')}>
                    <Text style={styles.addButtonLabel}>+ PLAYLIST</Text>
                  </Pressable>
                </View>
              </StretchHeader>
              <View pointerEvents={isEditing ? 'none' : 'auto'}>
                <SearchBar
                  scrollY={scrollY}
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Rechercher n'importe quoi"
                />
              </View>
              {loading && <Text style={styles.info}>Chargement...</Text>}
              {error && <Text style={styles.info}>{error.message}</Text>}
              {!loading && !error && filteredPlaylists.length === 0 && crossResults.length === 0 && (
                <Text style={styles.info}>
                  {query.length > 0 ? 'Aucun résultat.' : "Aucune playlist pour l'instant."}
                </Text>
              )}
            </>
          }
          ListFooterComponent={
            <View pointerEvents={isEditing ? 'none' : 'auto'}>
              <CrossSearchResults results={crossResults} onSelect={openResult} />
            </View>
          }
          renderItem={({ item }: { item: Playlist }) => (
            <JiggleTile isEditing={isEditing} onDelete={() => confirmDelete(item)} style={styles.tileWrapper}>
              <Pressable
                style={styles.card}
                onPress={() =>
                  isEditing ? exit() : navigation.navigate('PlaylistDetail', { playlistId: item.id })
                }
                onLongPress={enter}
              >
                <Cover
                  imageUri={item.imageUri}
                  color={item.color}
                  fallbackText={item.name.slice(0, 2).toUpperCase()}
                  size={80}
                  borderRadius={18}
                  fontSize={24}
                />
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            </JiggleTile>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  stack: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 26, letterSpacing: -0.5 },
  addButton: { backgroundColor: '#FFD600', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16 },
  addButtonLabel: { color: '#000', fontWeight: '700', fontSize: 13 },
  info: { color: '#888', padding: 16, fontSize: 13 },
  grid: { padding: 12 },
  tileWrapper: { flex: 1, margin: 6 },
  card: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
