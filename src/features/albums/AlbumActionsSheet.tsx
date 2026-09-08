import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onManageTracks: () => void;
  onChangeImage: () => void;
  onRename: () => void;
  onDelete: () => void;
};

/** Bottom sheet opened from the "⋯" button on an album's screen. Mirrors ArtistActionsSheet. */
export function AlbumActionsSheet({
  visible,
  onClose,
  onManageTracks,
  onChangeImage,
  onRename,
  onDelete,
}: Props): React.JSX.Element {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrapper} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.sheet}>
              <Pressable style={styles.action} onPress={onManageTracks}>
                <Text style={styles.actionLabel}>Ajouter des sons</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onChangeImage}>
                <Text style={styles.actionLabel}>Changer la pochette</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onRename}>
                <Text style={styles.actionLabel}>Renommer</Text>
              </Pressable>
              <Pressable style={[styles.action, styles.actionLast]} onPress={onDelete}>
                <Text style={styles.actionLabelDanger}>Supprimer l'album</Text>
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
  },
  actionLast: { borderBottomWidth: 0 },
  actionLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  actionLabelDanger: { color: '#E8001C', fontSize: 16, fontWeight: '600' },
});
