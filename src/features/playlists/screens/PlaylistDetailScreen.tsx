import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { SearchInput } from '../../../components/layout/SearchInput';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RenameDialog } from '../../../components/ui/RenameDialog';
import { useAlbums } from '../../albums/useAlbums';
import { useArtists } from '../../artists/useArtists';
import { Cover } from '../../images/Cover';
import { usePickImage } from '../../images/usePickImage';
import { usePlayback } from '../../playback/PlaybackProvider';
import { ArtistCoverToggle } from '../../settings/ArtistCoverToggle';
import { TrackRow } from '../../tracks/TrackRow';
import { type Track } from '../../tracks/types';
import { usePlaylistTracks } from '../../tracks/useScopedTracks';
import { PlaylistActionsSheet } from '../PlaylistActionsSheet';
import { usePlaylists } from '../usePlaylists';

/** Structurally typed: registered in the Playlists stack. */
type Props = {
  route: { params: { playlistId: string } };
  navigation: {
    goBack: () => void;
    setOptions: (options: { gestureEnabled: boolean }) => void;
    navigate: (screen: 'AddTracksToPlaylist', params: { playlistId: string }) => void;
  };
};

type ViewMode = 'playlist' | 'search';

export function PlaylistDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { playlistId } = route.params;
  const {
    playlists,
    setImage: setPlaylistImage,
    rename: renamePlaylist,
    deletePlaylist,
    removeTrackFrom,
  } = usePlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);
  const { artists } = useArtists();
  const { albums } = useAlbums();
  const { tracks, refresh, toggleFavorite } = usePlaylistTracks(playlistId);
  const { currentTrack, isPlaying, play, togglePlayPause } = usePlayback();
  const { pickImageWithPrompt } = usePickImage();

  const [mode, setMode] = useState<ViewMode>('playlist');
  const [search, setSearch] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search]);

  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: mode === 'playlist' });
  }, [navigation, mode]);

  useEffect(() => {
    if (mode === 'playlist') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setMode('playlist');
      return true;
    });
    return () => subscription.remove();
  }, [mode]);

  const playFrom = (track: Track, queue: Track[]) => {
    if (track.audioUri.length > 0) play(track, queue);
  };

  const handleChangeImage = async () => {
    setShowActions(false);
    if (!playlist) return;
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setPlaylistImage(playlist, imageUri);
  };

  const handleRename = () => {
    setShowActions(false);
    if (!playlist) return;
    setRenameValue(playlist.name);
    setIsRenaming(true);
  };

  const submitRename = async () => {
    if (!playlist) return;
    const result = await renamePlaylist(playlist, renameValue);
    if (result.ok) setIsRenaming(false);
  };

  const handleDelete = () => {
    setShowActions(false);
    if (!playlist) return;
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
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.info}>Cette playlist n'existe pas ou plus.</Text>
      </SafeAreaView>
    );
  }

  const trackList = (
    <FlatList
      style={styles.list}
      data={filteredTracks}
      keyExtractor={(track: Track) => track.id}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <Text style={styles.info}>
          {search.trim().length > 0 ? 'Aucun résultat.' : 'Pas encore de son dans cette playlist.'}
        </Text>
      }
      renderItem={({ item }: { item: Track }) => {
        const isCurrent = currentTrack?.id === item.id;
        const artist = artists.find((a) => a.id === item.artistId);
        return (
          <TrackRow
            track={item}
            artistColor={artist?.color ?? '#111'}
            artistImageUri={artist?.imageUri ?? ''}
            albumImageUri={albums.find((a) => a.id === item.albumId)?.imageUri ?? ''}
            isCurrent={isCurrent}
            isPlaying={isPlaying}
            onPlay={() => playFrom(item, filteredTracks)}
            onTogglePlayPause={() => {
              if (isCurrent) togglePlayPause();
              else playFrom(item, filteredTracks);
            }}
            onToggleFavorite={() => toggleFavorite(item)}
            // In a playlist, "⋯" removes the track from the playlist rather than opening the track
            // menu — deleting the sound itself belongs on its own screens.
            onOpenActions={() =>
              Alert.alert('Retirer de la playlist ?', `« ${item.title} » restera dans ta bibliothèque.`, [
                { text: 'Annuler', style: 'cancel' },
                {
                  text: 'Retirer',
                  style: 'destructive',
                  onPress: async () => {
                    await removeTrackFrom(playlistId, item.id);
                    await refresh();
                  },
                },
              ])
            }
          />
        );
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {mode === 'search' ? (
        <>
          <View style={styles.searchTopBar}>
            <SearchInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un morceau"
              style={styles.searchInput}
              autoFocus
            />
            <Pressable
              style={styles.searchIconButton}
              onPress={() => {
                setSearch('');
                setMode('playlist');
              }}
            >
              <Text style={styles.searchIconGlyph}>✕</Text>
            </Pressable>
          </View>
          <ArtistCoverToggle />
          {trackList}
        </>
      ) : (
        <>
          <View style={styles.backRow}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Text style={styles.backLabel}>‹ RETOUR</Text>
            </Pressable>
            <Pressable onPress={() => setShowActions(true)} hitSlop={8}>
              <Text style={styles.manageGlyph}>⋯</Text>
            </Pressable>
          </View>

          <View style={styles.coverArea}>
            <Cover
              imageUri={playlist.imageUri}
              color={playlist.color}
              fallbackText={playlist.name.slice(0, 2).toUpperCase()}
              size={186}
              borderRadius={22}
              fontSize={60}
            />
          </View>
          <View style={styles.playlistInfo}>
            <Text style={styles.name}>{playlist.name}</Text>
            <Text style={styles.stats}>
              {tracks.length} MORCEAU{tracks.length !== 1 ? 'X' : ''}
            </Text>
          </View>

          <Pressable style={styles.searchHint} onPress={() => setMode('search')} hitSlop={8}>
            <View style={styles.searchHintBar} />
            <Text style={styles.searchHintGlyph}>⌕</Text>
          </Pressable>
          <ArtistCoverToggle />
          {trackList}
        </>
      )}

      <PlaylistActionsSheet
        visible={showActions}
        onClose={() => setShowActions(false)}
        onManageTracks={() => {
          setShowActions(false);
          navigation.navigate('AddTracksToPlaylist', { playlistId });
        }}
        onChangeImage={handleChangeImage}
        onRename={handleRename}
        onDelete={handleDelete}
      />

      <RenameDialog
        visible={isRenaming}
        title="RENOMMER LA PLAYLIST"
        value={renameValue}
        onChangeValue={setRenameValue}
        onCancel={() => setIsRenaming(false)}
        onSubmit={submitRename}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 17, fontWeight: '700' },
  manageGlyph: { color: '#fff', opacity: 0.7, fontSize: 22, fontWeight: '700' },
  coverArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  playlistInfo: { alignItems: 'center', paddingBottom: 16 },
  name: { color: '#fff', fontWeight: '700', fontSize: 24 },
  stats: { color: '#888', fontSize: 12, marginTop: 4 },
  searchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  searchHintBar: { width: 32, height: 3, borderRadius: 2, backgroundColor: '#2a2a2a' },
  searchHintGlyph: { color: '#555', fontSize: 14 },
  searchTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInput: { flex: 1 },
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconGlyph: { color: '#888', fontSize: 22 },
  list: { flex: 1 },
  info: { color: '#888', padding: 16, fontSize: 13 },
});
