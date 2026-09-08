import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLibraryTransfer } from '../useLibraryTransfer';

/** Structurally typed: only needs a way back, like the other track-editing screens. */
type Props = {
  navigation: { goBack: () => void };
};

/**
 * Export the whole library as one shareable file, or merge someone else's into this one. Importing
 * never deletes anything: entries already present are skipped.
 */
export function LibraryTransferScreen({ navigation }: Props): React.JSX.Element {
  const { status, shareLibrary, importFromFile } = useLibraryTransfer();
  const busy = status !== 'idle';

  const handleImport = async () => {
    const summary = await importFromFile();
    if (!summary) return;

    const added = summary.artists + summary.albums + summary.tracks + summary.playlists;
    if (added === 0) {
      Alert.alert('Rien à ajouter', 'Tous les sons de cette bibliothèque sont déjà chez toi.');
      return;
    }
    const parts = [
      summary.tracks > 0 ? `${summary.tracks} son${summary.tracks > 1 ? 's' : ''}` : null,
      summary.artists > 0 ? `${summary.artists} artiste${summary.artists > 1 ? 's' : ''}` : null,
      summary.albums > 0 ? `${summary.albums} album${summary.albums > 1 ? 's' : ''}` : null,
      summary.playlists > 0 ? `${summary.playlists} playlist${summary.playlists > 1 ? 's' : ''}` : null,
    ].filter((p): p is string => p !== null);
    Alert.alert('Import terminé', `${parts.join(', ')} ajouté${added > 1 ? 's' : ''}.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ RETOUR</Text>
        </Pressable>
        <Text style={styles.headerTitle}>BIBLIOTHÈQUE</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={styles.body}>
        <Pressable
          style={[styles.action, busy && styles.actionDisabled]}
          onPress={shareLibrary}
          disabled={busy}
        >
          <Text style={styles.actionLabel}>
            {status === 'exporting' ? 'PRÉPARATION...' : 'ENVOYER MA BIBLIOTHÈQUE'}
          </Text>
        </Pressable>
        <Text style={styles.hint}>
          Regroupe tous tes sons, artistes, albums et playlists dans un fichier à envoyer à un pote.
        </Text>

        <Pressable
          style={[styles.action, styles.actionSecondary, busy && styles.actionDisabled]}
          onPress={handleImport}
          disabled={busy}
        >
          <Text style={[styles.actionLabel, styles.actionLabelSecondary]}>
            {status === 'importing' ? 'IMPORT EN COURS...' : 'RECEVOIR UNE BIBLIOTHÈQUE'}
          </Text>
        </Pressable>
        <Text style={styles.hint}>
          Ajoute les sons d'un fichier reçu. Tes sons actuels sont conservés, et ceux que tu as déjà ne
          sont pas dupliqués.
        </Text>
      </View>
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
    paddingVertical: 12,
  },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 15, fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  body: { padding: 16, gap: 8 },
  action: {
    backgroundColor: '#FFD600',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  actionSecondary: { backgroundColor: '#111', borderWidth: 1, borderColor: '#2a2a2a' },
  actionDisabled: { opacity: 0.5 },
  actionLabel: { color: '#000', fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
  actionLabelSecondary: { color: '#fff' },
  hint: { color: '#888', fontSize: 12, lineHeight: 17, paddingHorizontal: 4 },
});
