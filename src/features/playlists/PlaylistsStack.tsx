import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AlbumDetailScreen } from '../albums/screens/AlbumDetailScreen';
import { ArtistDetailScreen } from '../artists/screens/ArtistDetailScreen';
import { AddPlaylistScreen } from './screens/AddPlaylistScreen';
import { AddTracksToPlaylistScreen } from './screens/AddTracksToPlaylistScreen';
import { PlaylistDetailScreen } from './screens/PlaylistDetailScreen';
import { PlaylistsListScreen } from './screens/PlaylistsListScreen';

export type PlaylistsStackParamList = {
  PlaylistsList: undefined;
  AddPlaylist: undefined;
  PlaylistDetail: { playlistId: string };
  AddTracksToPlaylist: { playlistId: string };
  /** Both reachable from the cross-context search results on the playlists list. */
  ArtistDetail: { artistId: string };
  AlbumDetail: { albumId: string };
};

const Stack = createNativeStackNavigator<PlaylistsStackParamList>();

export function PlaylistsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlaylistsList" component={PlaylistsListScreen} />
      <Stack.Screen name="AddPlaylist" component={AddPlaylistScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
      <Stack.Screen
        name="AddTracksToPlaylist"
        component={AddTracksToPlaylistScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
