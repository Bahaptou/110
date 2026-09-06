import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../components/ui/Button';
import { type ArtistsStackParamList } from '../ArtistsStack';
import { useArtists } from '../useArtists';

type Props = NativeStackScreenProps<ArtistsStackParamList, 'AddArtist'>;

export function AddArtistScreen({ navigation }: Props): React.JSX.Element {
  const { addArtist } = useArtists();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await addArtist(name);
    setSubmitting(false);
    if (result.ok) {
      navigation.goBack();
      return;
    }
    setError('Le prénom ne peut pas être vide.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.label}>PRÉNOM</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="ex. Mathieu"
        placeholderTextColor="#555"
        style={styles.input}
        autoFocus
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="AJOUTER AU CATALOGUE" onPress={handleSubmit} disabled={submitting || name.trim().length === 0} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 24, paddingTop: 32, gap: 20 },
  label: { color: '#888', fontSize: 13, letterSpacing: 1, fontWeight: '600' },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 2,
    color: '#fff',
    fontSize: 17,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  error: { color: '#E8001C', fontSize: 13 },
});
