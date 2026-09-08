import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RenameDialog } from '../../../components/ui/RenameDialog';
import { SearchBar } from '../../../components/layout/SearchBar';
import { StretchHeader } from '../../../components/layout/StretchHeader';
import { useScrollHeader } from '../../../components/layout/useScrollHeader';
import { useAlbums } from '../../albums/useAlbums';
import { useArtists } from '../../artists/useArtists';
import { usePickImage } from '../../images/usePickImage';
import { usePlayback } from '../../playback/PlaybackProvider';
import { ArtistCoverToggle } from '../../settings/ArtistCoverToggle';
import { checkAudioFormat } from '../audioFormats';
import { TrackActionsSheet } from '../TrackActionsSheet';
import { TrackRow } from '../TrackRow';
import { type TracksStackParamList } from '../TracksStack';
import { useAllTracks } from '../useAllTracks';
import { type Track } from '../types';

type Props = NativeStackScreenProps<TracksStackParamList, 'TracksList'>;

const AnimatedFlatList = Animated.FlatList;

function titleFromName(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex === -1 ? name : name.slice(0, dotIndex);
}

export function TracksListScreen({ navigation }: Props): React.JSX.Element {
  const { tracks, loading, error, toggleFavorite, deleteTrack, setImage, rename } = useAllTracks();
  const { artists } = useArtists();
  const { albums } = useAlbums();
  const { scrollY, onScroll } = useScrollHeader();
  const { currentTrack, isPlaying, play, stopIfPlaying, togglePlayPause } = usePlayback();
  const { pickImageWithPrompt } = usePickImage();
  const [search, setSearch] = useState('');
  const [actionsTrack, setActionsTrack] = useState<Track | null>(null);
  const [renamingTrack, setRenamingTrack] = useState<Track | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search]);

  const handleImport = async () => {
    // copyToCacheDirectory: true forces a file:// URI we can read/copy — otherwise Android can hand
    // back a content:// URI whose SAF read grant doesn't survive to the later copy in audioStorage.ts.
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];

    const check = checkAudioFormat(asset.name, asset.mimeType);
    if (!check.ok) {
      Alert.alert('Fichier non supporté', check.reason);
      return;
    }

    navigation.navigate('SaveTrack', {
      sourceUri: asset.uri,
      extension: check.extension,
      suggestedTitle: titleFromName(asset.name),
    });
  };

  const handleRename = (track: Track) => {
    setActionsTrack(null);
    setRenameValue(track.title);
    setRenamingTrack(track);
  };

  const submitRename = async () => {
    if (!renamingTrack) return;
    const result = await rename(renamingTrack, renameValue);
    if (result.ok) {
      setRenamingTrack(null);
    }
  };

  const handleChangeImage = async (track: Track) => {
    setActionsTrack(null);
    const imageUri = await pickImageWithPrompt();
    if (imageUri) await setImage(track, imageUri);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AnimatedFlatList
        data={filteredTracks}
        keyExtractor={(track: Track) => track.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            <StretchHeader scrollY={scrollY}>
              <View style={styles.header}>
                <Text style={styles.title}>MORCEAUX</Text>
                <View style={styles.headerActions}>
                  <Pressable style={styles.importButton} onPress={handleImport}>
                    <Text style={styles.importButtonLabel}>+ IMPORTER</Text>
                  </Pressable>
                  <Pressable
                    style={styles.libraryButton}
                    onPress={() => navigation.navigate('LibraryTransfer')}
                    hitSlop={8}
                  >
                    <Text style={styles.libraryGlyph}>⋯</Text>
                  </Pressable>
                </View>
              </View>
            </StretchHeader>
            <SearchBar scrollY={scrollY} value={search} onChangeText={setSearch} placeholder="Rechercher un morceau" />
            <ArtistCoverToggle />
            {loading && <Text style={styles.info}>Chargement...</Text>}
            {error && <Text style={styles.info}>{error.message}</Text>}
            {!loading && !error && filteredTracks.length === 0 && (
              <Text style={styles.info}>
                {search.trim().length > 0 ? 'Aucun résultat.' : "Aucun morceau pour l'instant."}
              </Text>
            )}
          </>
        }
        renderItem={({ item }: { item: Track }) => {
          const isCurrent = currentTrack?.id === item.id;
          const artist = artists.find((a) => a.id === item.artistId);
          const album = albums.find((a) => a.id === item.albumId);
          return (
            <TrackRow
              track={item}
              artistColor={artist?.color ?? '#111'}
              artistImageUri={artist?.imageUri ?? ''}
              albumImageUri={album?.imageUri ?? ''}
              isCurrent={isCurrent}
              isPlaying={isPlaying}
              onPlay={() => item.audioUri.length > 0 && play(item, filteredTracks)}
              onTogglePlayPause={() => {
                if (isCurrent) togglePlayPause();
                else if (item.audioUri.length > 0) play(item, filteredTracks);
              }}
              onToggleFavorite={() => toggleFavorite(item)}
              onOpenActions={() => setActionsTrack(item)}
            />
          );
        }}
      />

      <TrackActionsSheet
        visible={actionsTrack !== null}
        track={actionsTrack}
        onClose={() => setActionsTrack(null)}
        onRename={() => actionsTrack && handleRename(actionsTrack)}
        onChangeImage={() => actionsTrack && handleChangeImage(actionsTrack)}
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
        value={renameValue}
        onChangeValue={setRenameValue}
        onCancel={() => setRenamingTrack(null)}
        onSubmit={submitRename}
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
    paddingBottom: 16,
  },
  title: { color: '#fff', fontWeight: '700', fontSize: 26, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  libraryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryGlyph: { color: '#888', fontSize: 20, fontWeight: '700' },
  importButton: { backgroundColor: '#FFD600', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 16 },
  importButtonLabel: { color: '#000', fontWeight: '700', fontSize: 13 },
  info: { color: '#888', padding: 16, fontSize: 13 },
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
