import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

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

function MicIcon({ color }: { color: string }): React.JSX.Element {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
      <Rect x={9} y={2} width={6} height={12} rx={3} fill={color} stroke="none" />
      <Path d="M5 11a7 7 0 0 0 14 0" />
      <Path d="M12 18v4" />
    </Svg>
  );
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
  const { tracks, loading, error, addTrack, toggleFavorite } = useArtistTracks(artistId);
  const [newTitle, setNewTitle] = useState('');
  const { scrollY, onScroll } = useScrollHeader();

  const handleAddTrack = async () => {
    const result = await addTrack(newTitle);
    if (result.ok) {
      setNewTitle('');
    }
  };

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
        data={tracks}
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

            <Text style={styles.sectionLabel}>AJOUTER UN SON</Text>
            <View style={styles.addRow}>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Titre du son"
                placeholderTextColor="#555"
                style={styles.input}
              />
              <Pressable
                onPress={handleAddTrack}
                disabled={newTitle.trim().length === 0}
                style={[styles.micButton, newTitle.trim().length === 0 && styles.micButtonDisabled]}
              >
                <MicIcon color={newTitle.trim().length === 0 ? '#555' : '#000'} />
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>MORCEAUX</Text>
            {loading && <Text style={styles.info}>Chargement...</Text>}
            {error && <Text style={styles.info}>{error.message}</Text>}
            {!loading && !error && tracks.length === 0 && (
              <Text style={styles.info}>Pas encore de son pour cet artiste.</Text>
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
  artistInfo: { alignItems: 'center', paddingBottom: 8 },
  name: { color: '#fff', fontWeight: '700', fontSize: 24 },
  stats: { color: '#888', fontSize: 12, marginTop: 4 },
  sectionLabel: { color: '#888', fontSize: 11, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  input: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 18,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonDisabled: { backgroundColor: '#1a1a1a' },
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
