import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type Track } from './types';
import { useShareTrack } from './useShareTrack';

type Props = {
  visible: boolean;
  /** The track being acted on — needed for actions the sheet performs itself, like sharing. */
  track: Track | null;
  onClose: () => void;
  onRename: () => void;
  onChangeImage: () => void;
  onChangeArtist: () => void;
  onChangeAlbum: () => void;
  onChangePlaylists: () => void;
  onDelete: () => void;
};

/** Bottom sheet opened from the "⋯" button on a track row. */
export function TrackActionsSheet({
  visible,
  track,
  onClose,
  onRename,
  onChangeImage,
  onChangeArtist,
  onChangeAlbum,
  onChangePlaylists,
  onDelete,
}: Props): React.JSX.Element {
  const { share } = useShareTrack();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrapper} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']}>
            <View style={styles.sheet}>
              <Pressable
                style={styles.action}
                onPress={() => {
                  const shared = track;
                  onClose();
                  if (shared) void share(shared);
                }}
              >
                <Text style={styles.actionLabel}>Partager</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onRename}>
                <Text style={styles.actionLabel}>Renommer</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onChangeImage}>
                <Text style={styles.actionLabel}>Changer l'image</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onChangeArtist}>
                <Text style={styles.actionLabel}>Changer d'artiste</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onChangeAlbum}>
                <Text style={styles.actionLabel}>Album</Text>
              </Pressable>
              <Pressable style={styles.action} onPress={onChangePlaylists}>
                <Text style={styles.actionLabel}>Playlists</Text>
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
