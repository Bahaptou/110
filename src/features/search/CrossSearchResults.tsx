import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Cover } from '../images/Cover';

/** Which of the four kinds a result belongs to. Also the fixed order sections are shown in. */
export type SearchKind = 'artist' | 'album' | 'playlist' | 'track';

export type CrossSearchResult = {
  kind: SearchKind;
  id: string;
  name: string;
  /** Secondary line — an album's artist, a track's artist, a playlist's track count. */
  subtitle: string;
  /** Fallback tile colour when there is no image. */
  color: string;
  imageUri: string;
};

const SECTION_TITLES: Record<SearchKind, string> = {
  artist: 'ARTISTES',
  album: 'ALBUMS',
  playlist: 'PLAYLISTS',
  track: 'MORCEAUX',
};

/** Fixed order: artists, then albums, then playlists, then tracks. */
const SECTION_ORDER: SearchKind[] = ['artist', 'album', 'playlist', 'track'];

type Props = {
  /** Every match except the current screen's own kind, which the main grid already shows. */
  results: CrossSearchResult[];
  onSelect: (result: CrossSearchResult) => void;
};

/**
 * The "search anything" results shown under a list screen's own grid. The screen's own kind is
 * filtered out by the caller, so what remains is grouped into sections in SECTION_ORDER.
 */
export function CrossSearchResults({ results, onSelect }: Props): React.JSX.Element | null {
  if (results.length === 0) return null;

  return (
    <View style={styles.container}>
      {SECTION_ORDER.map((kind) => {
        const section = results.filter((result) => result.kind === kind);
        if (section.length === 0) return null;

        return (
          <View key={kind} style={styles.section}>
            <Text style={styles.sectionTitle}>{SECTION_TITLES[kind]}</Text>
            {section.map((result) => (
              <Pressable key={result.id} style={styles.row} onPress={() => onSelect(result)}>
                <Cover
                  imageUri={result.imageUri}
                  color={result.color}
                  fallbackText={result.kind === 'track' ? '' : result.name.slice(0, 2).toUpperCase()}
                  size={44}
                  borderRadius={12}
                  fontSize={result.kind === 'track' ? 0 : 15}
                />
                <View style={styles.text}>
                  <Text style={styles.name} numberOfLines={1}>
                    {result.name}
                  </Text>
                  {result.subtitle.length > 0 && (
                    <Text style={styles.subtitle} numberOfLines={1}>
                      {result.subtitle}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 8 },
  section: { paddingTop: 20 },
  sectionTitle: { color: '#888', fontSize: 11, letterSpacing: 1, fontWeight: '700', paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  text: { flex: 1 },
  name: { color: '#fff', fontSize: 15, fontWeight: '600' },
  subtitle: { color: '#888', fontSize: 12, marginTop: 2 },
});
