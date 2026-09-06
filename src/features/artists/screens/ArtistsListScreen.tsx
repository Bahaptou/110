import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JiggleTile } from '../../../components/layout/JiggleTile';
import { SearchBar } from '../../../components/layout/SearchBar';
import { StretchHeader } from '../../../components/layout/StretchHeader';
import { useEditMode } from '../../../components/layout/useEditMode';
import { useScrollHeader } from '../../../components/layout/useScrollHeader';
import { getTrackCountByArtist } from '../../tracks/service';
import { type ArtistsStackParamList } from '../ArtistsStack';
import { type Artist } from '../types';
import { useArtists } from '../useArtists';

type Props = NativeStackScreenProps<ArtistsStackParamList, 'ArtistsList'>;

const AnimatedFlatList = Animated.FlatList;

export function ArtistsListScreen({ navigation }: Props): React.JSX.Element {
  const db = useSQLiteContext();
  const { artists, loading, error, deleteArtist } = useArtists();
  const { scrollY, onScroll } = useScrollHeader();
  const { isEditing, enter, exit } = useEditMode();
  const [search, setSearch] = useState('');

  const filteredArtists = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return artists;
    return artists.filter((artist) => artist.name.toLowerCase().includes(query));
  }, [artists, search]);

  const confirmDelete = useCallback(
    async (artist: Artist) => {
      const trackCount = await getTrackCountByArtist(db, artist.id);
      const trackWarning =
        trackCount > 0 ? ` et ${trackCount} morceau${trackCount !== 1 ? 'x' : ''} associé${trackCount !== 1 ? 's' : ''}` : '';
      Alert.alert(
        `Supprimer ${artist.name} ?`,
        `Cet artiste${trackWarning} ainsi que ses morceaux et ses albums seront supprimés définitivement. Cette action est irréversible.`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              await deleteArtist(artist.id);
              exit();
            },
          },
        ]
      );
    },
    [db, deleteArtist, exit]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.stack}>
        {isEditing && <Pressable style={StyleSheet.absoluteFill} onPress={exit} />}
        <AnimatedFlatList
          data={filteredArtists}
          keyExtractor={(artist: Artist) => artist.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={isEditing ? exit : undefined}
          ListHeaderComponent={
            <>
              <StretchHeader scrollY={scrollY}>
                <View style={styles.header} pointerEvents={isEditing ? 'none' : 'auto'}>
                  <Text style={styles.title}>ARTISTES</Text>
                  <Pressable style={styles.addButton} onPress={() => navigation.navigate('AddArtist')}>
                    <Text style={styles.addButtonLabel}>+ AMI</Text>
                  </Pressable>
                </View>
              </StretchHeader>
              <View pointerEvents={isEditing ? 'none' : 'auto'}>
                <SearchBar scrollY={scrollY} value={search} onChangeText={setSearch} placeholder="Rechercher un artiste" />
              </View>
              {loading && <Text style={styles.info}>Chargement...</Text>}
              {error && <Text style={styles.info}>{error.message}</Text>}
              {!loading && !error && filteredArtists.length === 0 && (
                <Text style={styles.info}>
                  {search.trim().length > 0 ? 'Aucun résultat.' : "Aucun artiste pour l'instant."}
                </Text>
              )}
            </>
          }
          renderItem={({ item }: { item: Artist }) => (
            <JiggleTile isEditing={isEditing} onDelete={() => confirmDelete(item)} style={styles.tileWrapper}>
              <Pressable
                style={styles.card}
                onPress={() => (isEditing ? exit() : navigation.navigate('ArtistDetail', { artistId: item.id }))}
                onLongPress={enter}
              >
                <View style={[styles.avatar, { backgroundColor: item.color }]}>
                  <Text style={styles.initials}>{item.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{item.name}</Text>
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
  addButton: { backgroundColor: '#FFD600', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 20 },
  addButtonLabel: { color: '#000', fontWeight: '700', fontSize: 15 },
  info: { color: '#888', padding: 16, fontSize: 13 },
  grid: { padding: 12 },
  tileWrapper: { flex: 1, margin: 6 },
  card: { flex: 1, backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a', borderRadius: 20, padding: 14, alignItems: 'center', gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#000', fontWeight: '700', fontSize: 24 },
  name: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
