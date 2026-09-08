import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { COVER_COLORS, CoverPicker } from '../images/CoverPicker';
import { useArtists } from './useArtists';

type Props = {
  onDone: () => void;
};

/** Shared "add a friend" form — used both as its own stack screen and inside the ChangeArtistSheet. */
export function AddArtistForm({ onDone }: Props): React.JSX.Element {
  const { addArtist } = useArtists();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(COVER_COLORS[0]);
  const [imageUri, setImageUri] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await addArtist({ name, color, imageUri });
    setSubmitting(false);
    if (result.ok) {
      onDone();
      return;
    }
    setError('Le prénom ne peut pas être vide.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>PRÉNOM</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="ex. Mathieu"
        placeholderTextColor="#555"
        style={styles.input}
        autoFocus
      />

      <Text style={styles.label}>PHOTO</Text>
      <CoverPicker
        imageUri={imageUri}
        color={color}
        fallbackText={name.slice(0, 2).toUpperCase()}
        onImageChange={setImageUri}
        onColorChange={setColor}
      />

      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="AJOUTER AU CATALOGUE" onPress={handleSubmit} disabled={submitting || name.trim().length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 8, gap: 16 },
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
