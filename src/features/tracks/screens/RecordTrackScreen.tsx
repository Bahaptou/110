import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type TracksStackParamList } from '../TracksStack';
import { useRecorder } from '../useRecorder';

type Props = NativeStackScreenProps<TracksStackParamList, 'RecordTrack'>;

function formatElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

/** Default title for a recording — the user renames it on the save screen if they care to. */
function defaultTitle(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `Son du ${pad(now.getDate())}/${pad(now.getMonth() + 1)} à ${pad(now.getHours())}h${pad(now.getMinutes())}`;
}

/**
 * Full-screen recorder opened by the tab bar's centre button. Once stopped, it hands the file to
 * SaveTrackScreen — the same screen the import flow uses, so titling and artist choice live in one
 * place.
 */
export function RecordTrackScreen({ navigation }: Props): React.JSX.Element {
  const { status, elapsedSeconds, start, stop, cancel } = useRecorder();
  const isRecording = status === 'recording';

  const handleStop = async () => {
    const recording = await stop();
    if (!recording) {
      Alert.alert('Enregistrement raté', "Le son n'a pas pu être enregistré. Réessaie.");
      return;
    }
    // replace: leaving the save screen shouldn't come back to a recorder that has nothing to stop.
    navigation.replace('SaveTrack', {
      sourceUri: recording.sourceUri,
      extension: recording.extension,
      suggestedTitle: defaultTitle(),
    });
  };

  const handleClose = async () => {
    await cancel();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerLabel}>ENREGISTRER</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.elapsed}>{formatElapsed(isRecording ? elapsedSeconds : 0)}</Text>
        <Text style={styles.hint}>
          {status === 'denied'
            ? "L'accès au micro a été refusé. Autorise-le dans les réglages du téléphone."
            : status === 'failed'
              ? "Le micro n'a pas répondu. Réessaie."
              : isRecording
                ? 'Enregistrement en cours'
                : 'Appuie pour enregistrer'}
        </Text>

        <Pressable
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? handleStop : start}
        >
          <View style={isRecording ? styles.stopGlyph : styles.recordGlyph} />
        </Pressable>
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
  backLabel: { color: '#888', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  headerLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 32 },
  elapsed: { color: '#fff', fontSize: 56, fontWeight: '700', letterSpacing: -1 },
  hint: { color: '#888', fontSize: 14, textAlign: 'center' },
  recordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#111',
    borderWidth: 3,
    borderColor: '#E8001C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  recordButtonActive: { backgroundColor: '#1a0508' },
  recordGlyph: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#E8001C' },
  stopGlyph: { width: 34, height: 34, borderRadius: 6, backgroundColor: '#E8001C' },
});
