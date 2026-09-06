import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '../../../components/layout/SearchBar';
import { StretchHeader } from '../../../components/layout/StretchHeader';
import { useScrollHeader } from '../../../components/layout/useScrollHeader';
import { type ArtistsStackParamList } from '../ArtistsStack';
import { useArtists } from '../useArtists';

type Props = NativeStackScreenProps<ArtistsStackParamList, 'ArtistsList'>;

const AnimatedFlatList = Animated.FlatList;

export function ArtistsListScreen({ navigation }: Props): React.JSX.Element {
  const { artists, loading, error } = useArtists();
  const { scrollY, onScroll } = useScrollHeader();
  const [search, setSearch] = useState('');

  const filteredArtists = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return artists;
    return artists.filter((artist) => artist.name.toLowerCase().includes(query));
  }, [artists, search]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AnimatedFlatList
        data={filteredArtists}
        keyExtractor={(artist: (typeof artists)[number]) => artist.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            <StretchHeader scrollY={scrollY}>
              <View style={styles.header}>
                <Text style={styles.title}>ARTISTES</Text>
                <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddArtist')}>
                  <Text style={styles.addButtonLabel}>+ AMI</Text>
                </Pressable>
              </View>
            </StretchHeader>
            <SearchBar scrollY={scrollY} value={search} onChangeText={setSearch} placeholder="Rechercher un artiste" />
            {loading && <Text style={styles.info}>Chargement...</Text>}
            {error && <Text style={styles.info}>{error.message}</Text>}
            {!loading && !error && filteredArtists.length === 0 && (
              <Text style={styles.info}>
                {search.trim().length > 0 ? 'Aucun résultat.' : "Aucun artiste pour l'instant."}
              </Text>
            )}
          </>
        }
        renderItem={({ item }: { item: (typeof artists)[number] }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id })}>
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
              <Text style={styles.initials}>{item.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
          </Pressable>
        )}
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
  addButton: { backgroundColor: '#FFD600', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 20 },
  addButtonLabel: { color: '#000', fontWeight: '700', fontSize: 15 },
  info: { color: '#888', padding: 16, fontSize: 13 },
  grid: { padding: 12 },
  card: { flex: 1, margin: 6, backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 14, alignItems: 'center', gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#000', fontWeight: '700', fontSize: 24 },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
