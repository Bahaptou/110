import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { SearchInput } from '../../../components/layout/SearchInput';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RenameDialog } from '../../../components/ui/RenameDialog';
import { useArtists } from '../../artists/useArtists';
import { Cover } from '../../images/Cover';
import { usePickImage } from '../../images/usePickImage';
import { usePlayback } from '../../playback/PlaybackProvider';
import { ArtistCoverToggle } from '../../settings/ArtistCoverToggle';
import { TrackActionsSheet } from '../../tracks/TrackActionsSheet';
import { TrackRow } from '../../tracks/TrackRow';
import { type Track } from '../../tracks/types';
import { useAlbumTracks } from '../../tracks/useScopedTracks';
import { AlbumActionsSheet } from '../AlbumActionsSheet';
import { useAlbums } from '../useAlbums';

/** Structurally typed: registered in both the Albums stack and the Artists stack. */
type Props = {
  route: { params: { albumId: string } };
  navigation: {
    goBack: () => void;
    setOptions: (options: { gestureEnabled: boolean }) => void;
    navigate: {
      (
        screen: 'ChangeTrackArtist' | 'ChangeTrackAlbum' | 'ChangeTrackPlaylists',
        params: { trackId: string }
      ): void;
      (screen: 'AddTracksToAlbum', params: { albumId: string }): void;
    };
  };
};

/** Two modes, like the artist screen: cover + track list, or a full-screen search over that list. */
type ViewMode = 'album' | 'search';

export function AlbumDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { albumId } = route.params;
  const { albums, setImage: setAlbumImage, rename: renameAlbum, deleteAlbum } = useAlbums();
  const album = albums.find((a) => a.id === albumId);
  const { artists } = useArtists();
  const artist = artists.find((a) => a.id === album?.artistId);
  const {
    tracks,
    loading,
    error,
    toggleFavorite,
    deleteTrack,
    setImage: setTrackImage,
    rename: renameTrack,
  } = useAlbumTracks(albumId);
  const { currentTrack, isPlaying, play, stopIfPlaying, togglePlayPause } = usePlayback();
  const { pickImageWithPrompt } = usePickImage();

  const [mode, setMode] = useState<ViewMode>('album');
  const [search, setSearch] = useState('');
  const [actionsTrack, setActionsTrack] = useState<Track | null>(null);
  const [showAlbumActions, setShowAlbumActions] = useState(false);
  const [isRenamingAlbum, setIsRenamingAlbum] = useState(false);
  const [albumRenameValue, setAlbumRenameValue] = useState('');
  const [renamingTrack, setRenamingTrack] = useState<Track | null>(null);
  const [trackRenameValue, setTrackRenameValue] = useState('');

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search]);

  // Search is a mode inside this screen, so intercept back rather than leaving the album entirely.
  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: mode === 'album' });
  }, [navigation, mode]);

  useEffect(() => {
    if (mode === 'album') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setMode('album');
      return true;
    });
    return () => subscription.remove();
  }, [mode]);

  const playFrom = (track: Track, queue: Track[]) => {
    if (track.audioUri.length > 0) play(track, queue);
  };

  const handleChangeAlbumImage = async () => {
    setShowAlbumActions(false);
    if (!album) return;
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setAlbumImage(album, imageUri);
  };

  const handleRenameAlbum = () => {
    setShowAlbumActions(false);
    if (!album) return;
    setAlbumRenameValue(album.name);
    setIsRenamingAlbum(true);
  };

  const submitAlbumRename = async () => {
    if (!album) return;
    const result = await renameAlbum(album, albumRenameValue);
    if (result.ok) setIsRenamingAlbum(false);
  };

  const handleDeleteAlbum = () => {
    setShowAlbumActions(false);
    if (!album) return;
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
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRenameTrack = (track: Track) => {
    setActionsTrack(null);
    setTrackRenameValue(track.title);
    setRenamingTrack(track);
  };

  const submitTrackRename = async () => {
    if (!renamingTrack) return;
    const result = await renameTrack(renamingTrack, trackRenameValue);
    if (result.ok) setRenamingTrack(null);
  };

  const handleChangeTrackImage = async (track: Track) => {
    setActionsTrack(null);
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setTrackImage(track, imageUri);
  };

  const handleDeleteTrack = (track: Track) => {
    setActionsTrack(null);
    Alert.alert('Supprimer ce son ?', `« ${track.title} » sera supprimé définitivement.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          stopIfPlaying(track.id);
          deleteTrack(track);
        },
      },
    ]);
  };

  if (!album) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.info}>Cet album n'existe pas ou plus.</Text>
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
          {search.trim().length > 0 ? 'Aucun résultat.' : 'Pas encore de son dans cet album.'}
        </Text>
      }
      renderItem={({ item }: { item: Track }) => {
        const isCurrent = currentTrack?.id === item.id;
        return (
          <TrackRow
            track={item}
            artistColor={artist?.color ?? '#111'}
            artistImageUri={artist?.imageUri ?? ''}
            albumImageUri={album.imageUri}
            isCurrent={isCurrent}
            isPlaying={isPlaying}
            onPlay={() => playFrom(item, filteredTracks)}
            onTogglePlayPause={() => {
              if (isCurrent) togglePlayPause();
              else playFrom(item, filteredTracks);
            }}
            onToggleFavorite={() => toggleFavorite(item)}
            onOpenActions={() => setActionsTrack(item)}
          />
        );
      }}
    />
  );

  const sheets = (
    <>
      <TrackActionsSheet
        visible={actionsTrack !== null}
        track={actionsTrack}
        onClose={() => setActionsTrack(null)}
        onRename={() => actionsTrack && handleRenameTrack(actionsTrack)}
        onChangeImage={() => actionsTrack && handleChangeTrackImage(actionsTrack)}
        onChangeArtist={() => {
          const track = actionsTrack;
          setActionsTrack(null);
          if (track) navigation.navigate('ChangeTrackArtist', { trackId: track.id });
        }}
        onChangeAlbum={() => {
          const track = actionsTrack;
          setActionsTrack(null);
          if (track) navigation.navigate('ChangeTrackAlbum', { trackId: track.id });
        }}
        onChangePlaylists={() => {
          const track = actionsTrack;
          setActionsTrack(null);
          if (track) navigation.navigate('ChangeTrackPlaylists', { trackId: track.id });
        }}
        onDelete={() => actionsTrack && handleDeleteTrack(actionsTrack)}
      />

      <RenameDialog
        visible={renamingTrack !== null}
        title="RENOMMER LE MORCEAU"
        value={trackRenameValue}
        onChangeValue={setTrackRenameValue}
        onCancel={() => setRenamingTrack(null)}
        onSubmit={submitTrackRename}
      />
    </>
  );

  if (mode === 'search') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
              setMode('album');
            }}
          >
            <Text style={styles.searchIconGlyph}>✕</Text>
          </Pressable>
        </View>
        <ArtistCoverToggle />
        {trackList}
        {sheets}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.backRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ RETOUR</Text>
        </Pressable>
        <Pressable onPress={() => setShowAlbumActions(true)} hitSlop={8}>
          <Text style={styles.manageGlyph}>⋯</Text>
        </Pressable>
      </View>

      <View style={styles.coverArea}>
        <Cover
          imageUri={album.imageUri}
          color={album.color}
          fallbackText={album.name.slice(0, 2).toUpperCase()}
          size={186}
          borderRadius={22}
          fontSize={60}
        />
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.name}>{album.name}</Text>
        <Text style={styles.stats}>
          {artist?.name ?? ''} · {tracks.length} MORCEAU{tracks.length !== 1 ? 'X' : ''}
        </Text>
      </View>

      <Pressable style={styles.searchHint} onPress={() => setMode('search')} hitSlop={8}>
        <View style={styles.searchHintBar} />
        <Text style={styles.searchHintGlyph}>⌕</Text>
      </Pressable>
      <ArtistCoverToggle />

      {loading && <Text style={styles.info}>Chargement...</Text>}
      {error && <Text style={styles.info}>{error.message}</Text>}
      {trackList}

      {sheets}

      <AlbumActionsSheet
        visible={showAlbumActions}
        onClose={() => setShowAlbumActions(false)}
        onManageTracks={() => {
          setShowAlbumActions(false);
          navigation.navigate('AddTracksToAlbum', { albumId });
        }}
        onChangeImage={handleChangeAlbumImage}
        onRename={handleRenameAlbum}
        onDelete={handleDeleteAlbum}
      />

      <RenameDialog
        visible={isRenamingAlbum}
        title="RENOMMER L'ALBUM"
        value={albumRenameValue}
        onChangeValue={setAlbumRenameValue}
        onCancel={() => setIsRenamingAlbum(false)}
        onSubmit={submitAlbumRename}
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
  albumInfo: { alignItems: 'center', paddingBottom: 16 },
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
