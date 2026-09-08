import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Alert } from 'react-native';

import { persistImageFile } from './imageStorage';

export type PickImageSource = 'library' | 'camera';

type UsePickImageResult = {
  /** Returns the persisted file:// URI, or null if the user cancelled or denied permission. */
  pickImage: (source: PickImageSource) => Promise<string | null>;
  /** Prompts for the source, then picks. Returns the persisted URI, or null if dismissed. */
  pickImageWithPrompt: () => Promise<string | null>;
};

/** Square crop: every cover in the app is displayed as a square tile. */
const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

export function usePickImage(): UsePickImageResult {
  const pickImage = useCallback(async (source: PickImageSource) => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission refusée',
        source === 'camera'
          ? "L'accès à l'appareil photo est nécessaire pour prendre une photo."
          : "L'accès aux photos est nécessaire pour choisir une image."
      );
      return null;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
        : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

    if (result.canceled || result.assets.length === 0) return null;
    return persistImageFile(result.assets[0].uri);
  }, []);

  const pickImageWithPrompt = useCallback(
    () =>
      new Promise<string | null>((resolve) => {
        Alert.alert('Changer l’image', undefined, [
          { text: 'Choisir dans la galerie', onPress: () => resolve(pickImage('library')) },
          { text: 'Prendre une photo', onPress: () => resolve(pickImage('camera')) },
          { text: 'Annuler', style: 'cancel', onPress: () => resolve(null) },
        ]);
      }),
    [pickImage]
  );

  return { pickImage, pickImageWithPrompt };
}
