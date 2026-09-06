import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChangeTrackArtistScreen } from './screens/ChangeTrackArtistScreen';
import { SaveTrackScreen } from './screens/SaveTrackScreen';
import { TracksListScreen } from './screens/TracksListScreen';

export type TracksStackParamList = {
  TracksList: undefined;
  SaveTrack: { sourceUri: string; extension: string; suggestedTitle: string };
  ChangeTrackArtist: { trackId: string };
};

const Stack = createNativeStackNavigator<TracksStackParamList>();

export function TracksStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TracksList" component={TracksListScreen} />
      <Stack.Screen name="SaveTrack" component={SaveTrackScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ChangeTrackArtist" component={ChangeTrackArtistScreen} />
    </Stack.Navigator>
  );
}
