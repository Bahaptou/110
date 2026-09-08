import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LibraryTransferScreen } from '../library/screens/LibraryTransferScreen';
import { ChangeTrackPlaylistsScreen } from '../playlists/screens/ChangeTrackPlaylistsScreen';
import { ChangeTrackAlbumScreen } from './screens/ChangeTrackAlbumScreen';
import { ChangeTrackArtistScreen } from './screens/ChangeTrackArtistScreen';
import { RecordTrackScreen } from './screens/RecordTrackScreen';
import { SaveTrackScreen } from './screens/SaveTrackScreen';
import { TracksListScreen } from './screens/TracksListScreen';

export type TracksStackParamList = {
  TracksList: undefined;
  RecordTrack: undefined;
  SaveTrack: { sourceUri: string; extension: string; suggestedTitle: string };
  ChangeTrackArtist: { trackId: string };
  ChangeTrackAlbum: { trackId: string };
  ChangeTrackPlaylists: { trackId: string };
  LibraryTransfer: undefined;
};

const Stack = createNativeStackNavigator<TracksStackParamList>();

export function TracksStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TracksList" component={TracksListScreen} />
      <Stack.Screen name="RecordTrack" component={RecordTrackScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SaveTrack" component={SaveTrackScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ChangeTrackArtist" component={ChangeTrackArtistScreen} />
      <Stack.Screen name="ChangeTrackAlbum" component={ChangeTrackAlbumScreen} />
      <Stack.Screen name="ChangeTrackPlaylists" component={ChangeTrackPlaylistsScreen} />
      <Stack.Screen name="LibraryTransfer" component={LibraryTransferScreen} />
    </Stack.Navigator>
  );
}
