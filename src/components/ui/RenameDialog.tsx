import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  value: string;
  onChangeValue: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

/**
 * Small centred prompt for renaming something. Hand-built rather than using Alert.prompt, which
 * only exists on iOS.
 */
export function RenameDialog({
  visible,
  title,
  value,
  onChangeValue,
  onCancel,
  onSubmit,
}: Props): React.JSX.Element {
  const canSubmit = value.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholderTextColor="#555"
            style={styles.input}
            autoFocus
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancel} onPress={onCancel}>
              <Text style={styles.cancelLabel}>ANNULER</Text>
            </Pressable>
            <Pressable
              style={[styles.confirm, !canSubmit && styles.confirmDisabled]}
              onPress={onSubmit}
              disabled={!canSubmit}
            >
              <Text style={styles.confirmLabel}>VALIDER</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { width: '100%', backgroundColor: '#111', borderRadius: 20, padding: 20, gap: 16 },
  title: { color: '#888', fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 14,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancel: { paddingVertical: 10, paddingHorizontal: 16 },
  cancelLabel: { color: '#888', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  confirm: { backgroundColor: '#E8001C', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18 },
  confirmDisabled: { backgroundColor: '#1a1a1a' },
  confirmLabel: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
});
