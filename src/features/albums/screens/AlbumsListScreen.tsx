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
import { useArtists } from '../../artists/useArtists';
import { Cover } from '../../images/Cover';
import { usePlayback } from '../../playback/PlaybackProvider';
import { CrossSearchResults, type CrossSearchResult } from '../../search/CrossSearchResults';
import { useCrossSearch } from '../../search/useCrossSearch';
import { type AlbumsStackParamList } from '../AlbumsStack';
import { type Album } from '../types';
import { useAlbums } from '../useAlbums';

type Props = NativeStackScreenProps<AlbumsStackParamList, 'AlbumsList'>;

const AnimatedFlatList = Animated.FlatList;

export function AlbumsListScreen({ navigation }: Props): React.JSX.Element {
  const { albums, loading, error, deleteAlbum } = useAlbums();
  const { artists } = useArtists();
  const { play } = usePlayback();
  const { scrollY, onScroll } = useScrollHeader();
  const { isEditing, enter, exit } = useEditMode();
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();

  const filteredAlbums = useMemo(() => {
    if (query.length === 0) return albums;
    return albums.filter((album) => album.name.toLowerCase().includes(query));
  }, [albums, query]);

  // Mirror of the artists screen: albums keep priority here, everything else follows underneath.
  const { results: crossResults, tracks: crossTracks } = useCrossSearch(query, 'album');

  const openResult = useCallback(
    (result: CrossSearchResult) => {
      if (result.kind === 'artist') {
        navigation.navigate('ArtistDetail', { artistId: result.id });
        return;
      }
      if (result.kind === 'playlist') {
        navigation.navigate('PlaylistDetail', { playlistId: result.id });
        return;
      }
      // Tapping a sound plays it straight away, looping over the rest of the search results.
      const track = crossTracks.find((t) => t.id === result.id);
      if (track) play(track, crossTracks);
    },
    [navigation, play, crossTracks]
  );

  const confirmDelete = (album: Album) => {
    Alert.alert(
      `Supprimer ${album.name} ?`,
      'Cet album sera supprimé définitivement. Les morceaux qu\'il contient sont conservés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteAlbum(album);
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
          data={filteredAlbums}
          keyExtractor={(album: Album) => album.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={isEditing ? exit : undefined}
          ListHeaderComponent={
            <>
              <StretchHeader scrollY={scrollY}>
                <View style={styles.header} pointerEvents={isEditing ? 'none' : 'auto'}>
                  <Text style={styles.title}>ALBUMS</Text>
                  <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddAlbum', {})}>
                    <Text style={styles.addButtonLabel}>+ ALBUM</Text>
                  </Pressable>
                </View>
              </StretchHeader>
              <View pointerEvents={isEditing ? 'none' : 'auto'}>
                <SearchBar scrollY={scrollY} value={search} onChangeText={setSearch} placeholder="Rechercher n'importe quoi" />
              </View>
              {loading && <Text style={styles.info}>Chargement...</Text>}
              {error && <Text style={styles.info}>{error.message}</Text>}
              {!loading && !error && filteredAlbums.length === 0 && crossResults.length === 0 && (
                <Text style={styles.info}>
                  {query.length > 0 ? 'Aucun résultat.' : "Aucun album pour l'instant."}
                </Text>
              )}
            </>
          }
          ListFooterComponent={
            <View pointerEvents={isEditing ? 'none' : 'auto'}>
              <CrossSearchResults results={crossResults} onSelect={openResult} />
            </View>
          }
          renderItem={({ item }: { item: Album }) => {
            const artist = artists.find((a) => a.id === item.artistId);
            return (
              <JiggleTile isEditing={isEditing} onDelete={() => confirmDelete(item)} style={styles.tileWrapper}>
                <Pressable
                  style={styles.card}
                  onPress={() => (isEditing ? exit() : navigation.navigate('AlbumDetail', { albumId: item.id }))}
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
                  <Text style={styles.artistName} numberOfLines={1}>
                    {artist?.name ?? ''}
                  </Text>
                </Pressable>
              </JiggleTile>
            );
          }}
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
  addButton: { backgroundColor: '#FFD600', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 20 },
  addButtonLabel: { color: '#000', fontWeight: '700', fontSize: 15 },
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
    gap: 6,
  },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
  artistName: { color: '#888', fontSize: 12 },
});
