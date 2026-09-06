import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onChangeArtist: () => void;
  onDelete: () => void;
};

/** Bottom sheet opened from the "⋯" button on a track row. Album/Playlist are disabled until those features exist. */
export function TrackActionsSheet({ visible, onClose, onChangeArtist, onDelete }: Props): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrapper} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.sheet}>
              <Pressable style={styles.action} onPress={onChangeArtist}>
                <Text style={styles.actionLabel}>Changer d'artiste</Text>
              </Pressable>
              <Pressable style={styles.action} disabled>
                <Text style={styles.actionLabelDisabled}>Ajouter à un album</Text>
                <Text style={styles.soon}>Bientôt disponible</Text>
              </Pressable>
              <Pressable style={styles.action} disabled>
                <Text style={styles.actionLabelDisabled}>Ajouter à une playlist</Text>
                <Text style={styles.soon}>Bientôt disponible</Text>
              </Pressable>
              <Pressable style={[styles.action, styles.actionLast]} onPress={onDelete}>
                <Text style={styles.actionLabelDanger}>Supprimer</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheetWrapper: {},
  sheet: {
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginHorizontal: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  action: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLast: { borderBottomWidth: 0 },
  actionLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionLabelDisabled: { color: '#555', fontSize: 16, fontWeight: '600' },
  actionLabelDanger: { color: '#E8001C', fontSize: 16, fontWeight: '600' },
  soon: { color: '#444', fontSize: 11 },
});
