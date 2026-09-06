import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '../../../components/layout/SearchBar';
import { StretchHeader } from '../../../components/layout/StretchHeader';
import { useScrollHeader } from '../../../components/layout/useScrollHeader';
import { type Track } from '../../tracks/types';
import { useArtistTracks } from '../../tracks/useArtistTracks';
import { type ArtistsStackParamList } from '../ArtistsStack';
import { useArtists } from '../useArtists';

type Props = NativeStackScreenProps<ArtistsStackParamList, 'ArtistDetail'>;

const AnimatedFlatList = Animated.FlatList;

function HeartIcon({ filled }: { filled: boolean }): React.JSX.Element {
  return <Text style={{ color: filled ? '#E8001C' : '#555', fontSize: 18 }}>{filled ? '♥' : '♡'}</Text>;
}

function TrackRow({ track, onToggleFavorite }: { track: Track; onToggleFavorite: () => void }): React.JSX.Element {
  return (
    <View style={styles.trackRow}>
      <Text style={styles.trackTitle}>{track.title}</Text>
      <Pressable onPress={onToggleFavorite} hitSlop={8}>
        <HeartIcon filled={track.isFavorite} />
      </Pressable>
    </View>
  );
}

export function ArtistDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const { artistId } = route.params;
  const { artists } = useArtists();
  const artist = artists.find((a) => a.id === artistId);
  const { tracks, loading, error, toggleFavorite } = useArtistTracks(artistId);
  const { scrollY, onScroll } = useScrollHeader();
  const [search, setSearch] = useState('');

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return tracks;
    return tracks.filter((track) => track.title.toLowerCase().includes(query));
  }, [tracks, search]);

  if (!artist) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text style={styles.info}>Cet artiste n'existe pas ou plus.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.backRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ RETOUR</Text>
        </Pressable>
      </View>
      <AnimatedFlatList
        data={filteredTracks}
        keyExtractor={(track: Track) => track.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            <StretchHeader scrollY={scrollY}>
              <View style={styles.coverArea}>
                <View style={[styles.cover, { backgroundColor: artist.color }]}>
                  <Text style={styles.coverInitials}>{artist.name.slice(0, 2).toUpperCase()}</Text>
                </View>
              </View>
            </StretchHeader>
            <View style={styles.artistInfo}>
              <Text style={styles.name}>{artist.name}</Text>
              <Text style={styles.stats}>
                {tracks.length} MORCEAU{tracks.length !== 1 ? 'X' : ''}
              </Text>
            </View>

            <SearchBar scrollY={scrollY} value={search} onChangeText={setSearch} placeholder="Rechercher un morceau" />

            {loading && <Text style={styles.info}>Chargement...</Text>}
            {error && <Text style={styles.info}>{error.message}</Text>}
            {!loading && !error && filteredTracks.length === 0 && (
              <Text style={styles.info}>
                {search.trim().length > 0 ? 'Aucun résultat.' : 'Pas encore de son pour cet artiste.'}
              </Text>
            )}
          </>
        }
        renderItem={({ item }: { item: Track }) => (
          <TrackRow track={item} onToggleFavorite={() => toggleFavorite(item)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  backRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 17, fontWeight: '700' },
  coverArea: { alignItems: 'center', paddingTop: 12, paddingBottom: 20 },
  cover: { width: 200, height: 200, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  coverInitials: { color: '#000', fontWeight: '700', fontSize: 64, opacity: 0.85 },
  artistInfo: { alignItems: 'center', paddingBottom: 16 },
  name: { color: '#fff', fontWeight: '700', fontSize: 24 },
  stats: { color: '#888', fontSize: 12, marginTop: 4 },
  info: { color: '#888', padding: 16, fontSize: 13 },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  trackTitle: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
