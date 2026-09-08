import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Alert, BackHandler, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SearchInput } from '../../../components/layout/SearchInput';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RenameDialog } from '../../../components/ui/RenameDialog';
import { useAlbums } from '../../albums/useAlbums';
import { Cover } from '../../images/Cover';
import { resolveTrackCoverUri } from '../../images/trackCover';
import { usePickImage } from '../../images/usePickImage';
import { usePlayback } from '../../playback/PlaybackProvider';
import { ArtistCoverToggle } from '../../settings/ArtistCoverToggle';
import { useSettings } from '../../settings/SettingsProvider';
import { TrackActionsSheet } from '../../tracks/TrackActionsSheet';
import { TrackRow } from '../../tracks/TrackRow';
import { type Track } from '../../tracks/types';
import { useArtistTracks } from '../../tracks/useScopedTracks';
import { ArtistActionsSheet } from '../ArtistActionsSheet';
import { type ArtistsStackParamList } from '../ArtistsStack';
import { useArtists } from '../useArtists';

type Props = NativeStackScreenProps<ArtistsStackParamList, 'ArtistDetail'>;

const TOP_TRACKS_COUNT = 10;

/**
 * - `artist`: cover + carousels (default)
 * - `allTracks`: cover + full track list
 * - `search`: no cover, search bar pinned to the top, filtered list below
 */
type ViewMode = 'artist' | 'allTracks' | 'search';

/** Square tile used in the horizontal top-tracks carousel. */
function TrackTile({
  track,
  color,
  artistImageUri,
  albumImageUri,
  isCurrent,
  isPlaying,
  onPlay,
}: {
  track: Track;
  color: string;
  artistImageUri: string;
  albumImageUri: string;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
}): React.JSX.Element {
  const { preferArtistCover } = useSettings();
  const coverUri = resolveTrackCoverUri(track, { albumImageUri, artistImageUri }, preferArtistCover);
  return (
    <Pressable style={styles.carouselTile} onPress={onPlay}>
      <Cover
        imageUri={coverUri}
        color={color}
        fallbackText={isCurrent && isPlaying ? '▶' : '♪'}
        size={110}
        borderRadius={16}
        fontSize={28}
        style={isCurrent ? styles.carouselCoverActive : undefined}
      />
      <Text style={[styles.carouselLabel, isCurrent && styles.trackTitleActive]} numberOfLines={2}>
        {track.title}
      </Text>
    </Pressable>
  );
}

export function ArtistDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { artistId } = route.params;
  const { artists, setImage: setArtistImage, rename, deleteArtist } = useArtists();
  const artist = artists.find((a) => a.id === artistId);
  const {
    tracks,
    loading,
    error,
    toggleFavorite,
    deleteTrack,
    setImage: setTrackImage,
    rename: renameTrack,
  } = useArtistTracks(artistId);
  const { albums } = useAlbums(artistId);
  const { currentTrack, isPlaying, play, stopIfPlaying, togglePlayPause } = usePlayback();
  const { pickImageWithPrompt } = usePickImage();
  const [showArtistActions, setShowArtistActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renamingTrack, setRenamingTrack] = useState<Track | null>(null);
  const [trackRenameValue, setTrackRenameValue] = useState('');
  // One state with three values rather than nested booleans — the modes are mutually exclusive, and
  // combining flags previously produced in-between layouts that weren't meant to exist.
  const [mode, setMode] = useState<ViewMode>('artist');
  const [search, setSearch] = useState('');
  const [actionsTrack, setActionsTrack] = useState<Track | null>(null);

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search]);

  // "Top" means favourites first, then the rest by recency (the order tracks already arrive in).
  const topTracks = useMemo(() => {
    const favorites = tracks.filter((track) => track.isFavorite);
    const rest = tracks.filter((track) => !track.isFavorite);
    return [...favorites, ...rest].slice(0, TOP_TRACKS_COUNT);
  }, [tracks]);

  // The three modes live inside this one screen, so a back gesture/button would otherwise leave the
  // artist entirely instead of stepping back through them. Intercept it while in a sub-mode: disable
  // the native swipe-back so it can't fire, and handle Android's hardware button explicitly.
  useLayoutEffect(() => {
    navigation.setOptions({ gestureEnabled: mode === 'artist' });
  }, [navigation, mode]);

  useEffect(() => {
    if (mode === 'artist') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setMode(mode === 'search' ? 'allTracks' : 'artist');
      return true;
    });
    return () => subscription.remove();
  }, [mode]);


  const handleChangeArtistImage = async () => {
    setShowArtistActions(false);
    if (!artist) return;
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setArtistImage(artist, imageUri);
  };

  const handleRenameArtist = () => {
    setShowArtistActions(false);
    if (!artist) return;
    setRenameValue(artist.name);
    setIsRenaming(true);
  };

  const submitRename = async () => {
    if (!artist) return;
    const result = await rename(artist, renameValue);
    if (result.ok) {
      setIsRenaming(false);
    }
  };

  const handleDeleteArtist = () => {
    setShowArtistActions(false);
    if (!artist) return;
    Alert.alert(
      `Supprimer ${artist.name} ?`,
      'Cet artiste ainsi que ses morceaux seront supprimés définitivement. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteArtist(artist);
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
    if (result.ok) {
      setRenamingTrack(null);
    }
  };

  const handleChangeTrackImage = async (track: Track) => {
    setActionsTrack(null);
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setTrackImage(track, imageUri);
  };

  const handleDelete = (track: Track) => {
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

  if (!artist) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.info}>Cet artiste n'existe pas ou plus.</Text>
      </SafeAreaView>
    );
  }

  // Queue is always this artist's tracks — never the global library — so next/previous stay in context.
  const playFrom = (track: Track, queue: Track[]) => {
    if (track.audioUri.length > 0) play(track, queue);
  };

  const trackList = (
    <FlatList
      style={styles.allTracksList}
      data={filteredTracks}
      keyExtractor={(track: Track) => track.id}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={
        <Text style={styles.info}>
          {search.trim().length > 0 ? 'Aucun résultat.' : 'Pas encore de son pour cet artiste.'}
        </Text>
      }
      renderItem={({ item }: { item: Track }) => {
        const isCurrent = currentTrack?.id === item.id;
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
            onOpenActions={() => setActionsTrack(item)}
          />
        );
      }}
    />
  );

  if (mode === 'search') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.searchTopBar}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un morceau"
            style={styles.bottomSearchInput}
            autoFocus
          />
          <Pressable
            style={styles.searchIconButton}
            onPress={() => {
              setSearch('');
              setMode('allTracks');
            }}
          >
            <Text style={styles.searchIconGlyph}>✕</Text>
          </Pressable>
        </View>
        <ArtistCoverToggle />
        <View style={styles.allTracksArea}>{trackList}</View>
        <TrackActionsSheet
          visible={actionsTrack !== null}
          track={actionsTrack}
          onClose={() => setActionsTrack(null)}
          onRename={() => actionsTrack && handleRenameTrack(actionsTrack)}
          onChangeImage={() => actionsTrack && handleChangeTrackImage(actionsTrack)}
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
          onChangeArtist={() => {
            const track = actionsTrack;
            setActionsTrack(null);
            if (track) navigation.navigate('ChangeTrackArtist', { trackId: track.id });
          }}
          onDelete={() => actionsTrack && handleDelete(actionsTrack)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.backRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ RETOUR</Text>
        </Pressable>
        <Pressable onPress={() => setShowArtistActions(true)} hitSlop={8}>
          <Text style={styles.manageGlyph}>⋯</Text>
        </Pressable>
      </View>

      <View style={styles.coverArea}>
        <Cover
          imageUri={artist.imageUri}
          color={artist.color}
          fallbackText={artist.name.slice(0, 2).toUpperCase()}
          size={186}
          borderRadius={22}
          fontSize={60}
        />
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.name}>{artist.name}</Text>
        <Text style={styles.stats}>
          {tracks.length} MORCEAU{tracks.length !== 1 ? 'X' : ''}
        </Text>
      </View>

      {mode === 'allTracks' ? (
        <View style={styles.allTracksArea}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TOUS LES MORCEAUX</Text>
            <Pressable style={styles.toggleButton} onPress={() => setMode('artist')}>
              <Text style={styles.toggleButtonLabel}>MENU</Text>
            </Pressable>
          </View>
          <Pressable style={styles.searchHint} onPress={() => setMode('search')} hitSlop={8}>
            <View style={styles.searchHintBar} />
            <Text style={styles.searchHintGlyph}>⌕</Text>
          </Pressable>
          <ArtistCoverToggle />
          {trackList}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TOP MORCEAUX</Text>
            <Pressable style={styles.toggleButton} onPress={() => setMode('allTracks')}>
              <Text style={styles.toggleButtonLabel}>TOUS LES MORCEAUX</Text>
            </Pressable>
          </View>

          {loading && <Text style={styles.info}>Chargement...</Text>}
          {error && <Text style={styles.info}>{error.message}</Text>}
          {!loading && !error && topTracks.length === 0 && (
            <Text style={styles.info}>Pas encore de son pour cet artiste.</Text>
          )}
          {topTracks.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {topTracks.map((track) => (
                <TrackTile
                  key={track.id}
                  track={track}
                  color={artist.color}
                  artistImageUri={artist.imageUri}
                  albumImageUri={albums.find((a) => a.id === track.albumId)?.imageUri ?? ''}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  onPlay={() => playFrom(track, topTracks)}
                />
              ))}
            </ScrollView>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ALBUMS</Text>
            <Pressable
              style={styles.toggleButton}
              onPress={() => navigation.navigate('AddAlbum', { artistId: artist.id })}
            >
              <Text style={styles.toggleButtonLabel}>+ ALBUM</Text>
            </Pressable>
          </View>
          {albums.length === 0 ? (
            <Text style={styles.info}>Pas encore d'album.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {albums.map((album) => (
                <Pressable
                  key={album.id}
                  style={styles.carouselTile}
                  onPress={() => navigation.navigate('AlbumDetail', { albumId: album.id })}
                >
                  <Cover
                    imageUri={album.imageUri}
                    color={album.color}
                    fallbackText={album.name.slice(0, 2).toUpperCase()}
                    size={110}
                    borderRadius={16}
                    fontSize={28}
                  />
                  <Text style={styles.carouselLabel} numberOfLines={2}>
                    {album.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </ScrollView>
      )}

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
        onDelete={() => actionsTrack && handleDelete(actionsTrack)}
      />

      <RenameDialog
        visible={renamingTrack !== null}
        title="RENOMMER LE MORCEAU"
        value={trackRenameValue}
        onChangeValue={setTrackRenameValue}
        onCancel={() => setRenamingTrack(null)}
        onSubmit={submitTrackRename}
      />

      <ArtistActionsSheet
        visible={showArtistActions}
        onClose={() => setShowArtistActions(false)}
        onChangeImage={handleChangeArtistImage}
        onRename={handleRenameArtist}
        onDelete={handleDeleteArtist}
      />

      <RenameDialog
        visible={isRenaming}
        title="RENOMMER L'ARTISTE"
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
  renameBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  renameCard: { width: '100%', backgroundColor: '#111', borderRadius: 20, padding: 20, gap: 16 },
  renameTitle: { color: '#888', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  renameInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  renameActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  renameCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  renameCancelLabel: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  renameConfirm: { backgroundColor: '#E8001C', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18 },
  renameConfirmDisabled: { backgroundColor: '#1a1a1a' },
  renameConfirmLabel: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { paddingBottom: 24 },
  coverArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  cover: { width: 200, height: 200, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  coverInitials: { color: '#000', fontWeight: '700', fontSize: 64, opacity: 0.85 },
  artistInfo: { alignItems: 'center', paddingBottom: 16 },
  name: { color: '#fff', fontWeight: '700', fontSize: 24 },
  stats: { color: '#888', fontSize: 12, marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: { color: '#888', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  toggleButton: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12 },
  toggleButtonLabel: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  carousel: { paddingHorizontal: 16, gap: 12 },
  carouselTile: { width: 110, gap: 6 },
  carouselCover: { width: 110, height: 110, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  carouselCoverActive: { borderWidth: 2, borderColor: '#fff' },
  carouselCoverGlyph: { color: '#000', fontSize: 28, opacity: 0.85 },
  carouselLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  info: { color: '#888', padding: 16, fontSize: 13 },
  allTracksArea: { flex: 1 },
  searchHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  searchHintBar: { width: 32, height: 3, borderRadius: 2, backgroundColor: '#2a2a2a' },
  searchHintGlyph: { color: '#555', fontSize: 14 },
  allTracksList: { flex: 1 },
  searchTopBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  bottomSearchInput: { flex: 1 },
  searchIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconGlyph: { color: '#888', fontSize: 22 },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    gap: 12,
  },
  trackTitle: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },
  trackTitleActive: { color: '#E8001C' },
  moreGlyph: { color: '#888', fontSize: 18, fontWeight: '700' },
});
