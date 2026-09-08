import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { useArtists } from '../../artists/useArtists';
import { type Artist } from '../../artists/types';
import { Cover } from '../../images/Cover';
import { usePickImage } from '../../images/usePickImage';
import { AudioSourceUnreadableError } from '../audioStorage';
import { type TracksStackParamList } from '../TracksStack';
import { useAudioDuration } from '../useAudioDuration';
import { useCreateTrack } from '../useCreateTrack';

type Props = NativeStackScreenProps<TracksStackParamList, 'SaveTrack'>;

export function SaveTrackScreen({ route, navigation }: Props): React.JSX.Element {
  const { sourceUri, extension, suggestedTitle } = route.params;
  const { artists } = useArtists();
  const { save } = useCreateTrack();
  const { pickImage } = usePickImage();
  const durationState = useAudioDuration(sourceUri);
  const [title, setTitle] = useState(suggestedTitle);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    title.trim().length > 0 && selectedArtistId !== null && !submitting && durationState.status === 'loaded';

  const pickAndSet = async (source: 'library' | 'camera') => {
    const uri = await pickImage(source);
    if (uri) setImageUri(uri);
  };

  const handleSave = async () => {
    if (!selectedArtistId || durationState.status !== 'loaded') return;
    setSubmitting(true);
    try {
      const result = await save(
        selectedArtistId,
        title,
        { sourceUri, extension, durationSeconds: durationState.durationSeconds },
        imageUri
      );
      if (result.ok) {
        navigation.popToTop();
      }
    } catch (cause) {
      const message =
        cause instanceof AudioSourceUnreadableError
          ? "Ce fichier n'est plus accessible — reviens en arrière et choisis-le à nouveau."
          : "Une erreur inattendue a empêché l'enregistrement du son.";
      Alert.alert('Impossible de sauvegarder', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.backLabel}>‹ ANNULER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>NOUVEAU SON</Text>
        <View style={{ width: 70 }} />
      </View>

      <Text style={styles.sectionLabel}>TITRE</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="ex. Rire du jeudi"
        placeholderTextColor="#555"
        style={styles.input}
        autoFocus
      />

      <Text style={styles.sectionLabel}>POCHETTE (OPTIONNEL)</Text>
      <View style={styles.coverRow}>
        <Cover
          imageUri={imageUri}
          color="#1a1a1a"
          fallbackText="♪"
          size={64}
          borderRadius={16}
          fontSize={24}
        />
        <View style={styles.coverActions}>
          <Pressable style={styles.coverButton} onPress={() => pickAndSet('library')}>
            <Text style={styles.coverButtonLabel}>GALERIE</Text>
          </Pressable>
          <Pressable style={styles.coverButton} onPress={() => pickAndSet('camera')}>
            <Text style={styles.coverButtonLabel}>PHOTO</Text>
          </Pressable>
          {imageUri.length > 0 && (
            <Pressable style={styles.coverButton} onPress={() => setImageUri('')}>
              <Text style={styles.coverButtonLabelMuted}>RETIRER</Text>
            </Pressable>
          )}
        </View>
      </View>
      <Text style={styles.coverHint}>Sans photo, le son prend celle de son album ou de son artiste.</Text>

      <Text style={styles.sectionLabel}>ARTISTE</Text>
      {artists.length === 0 ? (
        <Text style={styles.info}>Ajoute d'abord un ami dans l'onglet Artistes.</Text>
      ) : (
        <FlatList
          data={artists}
          keyExtractor={(artist: Artist) => artist.id}
          contentContainerStyle={styles.artistList}
          renderItem={({ item }: { item: Artist }) => {
            const isSelected = selectedArtistId === item.id;
            return (
              <Pressable
                style={[styles.artistRow, isSelected && styles.artistRowSelected]}
                onPress={() => setSelectedArtistId(item.id)}
              >
                <View style={[styles.avatar, { backgroundColor: item.color }]}>
                  <Text style={styles.avatarInitials}>{item.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.artistName}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      )}

      <View style={styles.footer}>
        {durationState.status === 'loading' && <Text style={styles.statusInfo}>Vérification du fichier audio...</Text>}
        {durationState.status === 'failed' && (
          <Text style={styles.statusError}>Ce fichier ne semble pas être un son valide. Essaie un autre fichier.</Text>
        )}
        <Button label="ENREGISTRER LE SON" onPress={handleSave} disabled={!canSubmit} />
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  backLabel: { color: '#fff', opacity: 0.7, fontSize: 15, fontWeight: '700' },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  sectionLabel: { color: '#888', fontSize: 11, letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  input: {
    marginHorizontal: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 18,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  info: { color: '#888', paddingHorizontal: 16, fontSize: 13 },
  coverRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  coverActions: { flex: 1, flexDirection: 'row', gap: 8 },
  coverButton: { backgroundColor: '#1a1a1a', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12 },
  coverButtonLabel: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  coverButtonLabelMuted: { color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  coverHint: { color: '#555', fontSize: 11, paddingHorizontal: 16, paddingTop: 8 },
  artistList: { paddingHorizontal: 16, gap: 8 },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#111',
  },
  artistRowSelected: { borderColor: '#E8001C' },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#000', fontWeight: '700', fontSize: 14 },
  artistName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footer: { padding: 16, gap: 8 },
  statusInfo: { color: '#888', fontSize: 12, textAlign: 'center' },
  statusError: { color: '#E8001C', fontSize: 12, textAlign: 'center' },
});
