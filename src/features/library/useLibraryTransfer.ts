import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { exportLibrary } from './exportLibrary';
import { importLibrary, type ImportSummary } from './importLibrary';

export type TransferStatus = 'idle' | 'exporting' | 'importing';

type UseLibraryTransferResult = {
  status: TransferStatus;
  /** Packs the library and opens the share sheet. */
  shareLibrary: () => Promise<void>;
  /** Picks a bundle and merges it in, returning what was added. */
  importFromFile: () => Promise<ImportSummary | null>;
};

const IMPORT_ERRORS: Record<'unreadable' | 'not_a_bundle' | 'unsupported_version', string> = {
  unreadable: "Le fichier n'a pas pu être lu.",
  not_a_bundle: "Ce fichier n'est pas une bibliothèque 110.",
  unsupported_version: 'Cette bibliothèque vient d\u2019une version plus récente de l\u2019app.',
};

/** Export and import of the whole library, with the user-facing messaging that goes with them. */
export function useLibraryTransfer(): UseLibraryTransferResult {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<TransferStatus>('idle');

  const shareLibrary = useCallback(async () => {
    setStatus('exporting');
    try {
      const fileUri = await exportLibrary(db, 'Bibliothèque 110');
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Partage indisponible', "Le partage n'est pas disponible sur cet appareil.");
        return;
      }
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Partager la bibliothèque',
        UTI: 'public.json',
      });
    } catch {
      Alert.alert('Export impossible', "La bibliothèque n'a pas pu être exportée.");
    } finally {
      setStatus('idle');
    }
  }, [db]);

  const importFromFile = useCallback(async (): Promise<ImportSummary | null> => {
    // Bundles are JSON, but pickers and messaging apps label them inconsistently — accept anything
    // and let parsing decide.
    const picked = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (picked.canceled || picked.assets.length === 0) return null;

    setStatus('importing');
    try {
      const result = await importLibrary(db, picked.assets[0].uri);
      if (!result.ok) {
        Alert.alert('Import impossible', IMPORT_ERRORS[result.error]);
        return null;
      }
      return result.summary;
    } catch {
      Alert.alert('Import impossible', "La bibliothèque n'a pas pu être importée.");
      return null;
    } finally {
      setStatus('idle');
    }
  }, [db]);

  return { status, shareLibrary, importFromFile };
}
