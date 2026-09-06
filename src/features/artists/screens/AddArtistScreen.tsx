import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddArtistForm } from '../AddArtistForm';
import { type ArtistsStackParamList } from '../ArtistsStack';

type Props = NativeStackScreenProps<ArtistsStackParamList, 'AddArtist'>;

export function AddArtistScreen({ navigation }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'bottom']}>
      <AddArtistForm onDone={() => navigation.goBack()} />
    </SafeAreaView>
  );
}
