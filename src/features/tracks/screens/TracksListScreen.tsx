import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '../../../components/layout/SearchBar';
import { StretchHeader } from '../../../components/layout/StretchHeader';
import { useScrollHeader } from '../../../components/layout/useScrollHeader';
import { usePlayback } from '../../playback/PlaybackProvider';
import { checkAudioFormat } from '../audioFormats';
import { TrackActionsSheet } from '../TrackActionsSheet';
import { type TracksStackParamList } from '../TracksStack';
import { useAllTracks } from '../useAllTracks';
import { type Track } from '../types';

type Props = NativeStackScreenProps<TracksStackParamList, 'TracksList'>;

const AnimatedFlatList = Animated.FlatList;

function titleFromName(name: string): string {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex === -1 ? name : name.slice(0, dotIndex);
}

function HeartIcon({ filled }: { filled: boolean }): React.JSX.Element {
  return <Text style={{ color: filled ? '#E8001C' : '#555', fontSize: 18 }}>{filled ? '♥' : '♡'}</Text>;
}

export function TracksListScreen({ navigation }: Props): React.JSX.Element {
  const { tracks, loading, error, toggleFavorite, deleteTrack } = useAllTracks();
  const { scrollY, onScroll } = useScrollHeader();
  const { currentTrack, isPlaying, play, stopIfPlaying } = usePlayback();
  const [search, setSearch] = useState('');
  const [actionsTrack, setActionsTrack] = useState<Track | null>(null);

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
                <Pressable style={styles.importButton} onPress={handleImport}>
                  <Text style={styles.importButtonLabel}>+ IMPORTER</Text>
                </Pressable>
              </View>
            </StretchHeader>
            <SearchBar scrollY={scrollY} value={search} onChangeText={setSearch} placeholder="Rechercher un morceau" />
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
          return (
            <Pressable
              style={styles.trackRow}
              onPress={() => item.audioUri.length > 0 && play(item, filteredTracks)}
            >
              <Text style={[styles.trackTitle, isCurrent && styles.trackTitleActive]} numberOfLines={1}>
                {isCurrent && isPlaying ? '▶ ' : ''}
                {item.title}
              </Text>
              <Pressable onPress={() => toggleFavorite(item)} hitSlop={8}>
                <HeartIcon filled={item.isFavorite} />
              </Pressable>
              <Pressable onPress={() => setActionsTrack(item)} hitSlop={8}>
                <Text style={styles.moreGlyph}>⋯</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      <TrackActionsSheet
        visible={actionsTrack !== null}
        onClose={() => setActionsTrack(null)}
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
