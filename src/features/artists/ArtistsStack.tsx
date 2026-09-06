import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddArtistScreen } from './screens/AddArtistScreen';
import { ArtistDetailScreen } from './screens/ArtistDetailScreen';
import { ArtistsListScreen } from './screens/ArtistsListScreen';

export type ArtistsStackParamList = {
  ArtistsList: undefined;
  AddArtist: undefined;
  ArtistDetail: { artistId: string };
};

const Stack = createNativeStackNavigator<ArtistsStackParamList>();

export function ArtistsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', headerShown: false }}>
      <Stack.Screen name="ArtistsList" component={ArtistsListScreen} />
      <Stack.Screen name="AddArtist" component={AddArtistScreen} options={{ headerShown: true, title: 'Ajouter un ami' }} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
    </Stack.Navigator>
  );
}
