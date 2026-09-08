import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddAlbumScreen } from '../albums/screens/AddAlbumScreen';
import { AddTracksToAlbumScreen } from '../albums/screens/AddTracksToAlbumScreen';
import { AlbumDetailScreen } from '../albums/screens/AlbumDetailScreen';
import { ChangeTrackPlaylistsScreen } from '../playlists/screens/ChangeTrackPlaylistsScreen';
import { PlaylistDetailScreen } from '../playlists/screens/PlaylistDetailScreen';
import { ChangeTrackAlbumScreen } from '../tracks/screens/ChangeTrackAlbumScreen';
import { ChangeTrackArtistScreen } from '../tracks/screens/ChangeTrackArtistScreen';
import { AddArtistScreen } from './screens/AddArtistScreen';
import { ArtistDetailScreen } from './screens/ArtistDetailScreen';
import { ArtistsListScreen } from './screens/ArtistsListScreen';

export type ArtistsStackParamList = {
  ArtistsList: undefined;
  AddArtist: undefined;
  ArtistDetail: { artistId: string };
  ChangeTrackArtist: { trackId: string };
  ChangeTrackAlbum: { trackId: string };
  AddAlbum: { artistId?: string };
  AlbumDetail: { albumId: string };
  AddTracksToAlbum: { albumId: string };
  ChangeTrackPlaylists: { trackId: string };
  /** Reachable from the cross-context search results on the artists list. */
  PlaylistDetail: { playlistId: string };
};

const Stack = createNativeStackNavigator<ArtistsStackParamList>();

export function ArtistsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#000' }, headerTintColor: '#fff', headerShown: false }}>
      <Stack.Screen name="ArtistsList" component={ArtistsListScreen} />
      <Stack.Screen name="AddArtist" component={AddArtistScreen} options={{ headerShown: true, title: 'Ajouter un ami' }} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="ChangeTrackArtist" component={ChangeTrackArtistScreen} />
      <Stack.Screen name="ChangeTrackAlbum" component={ChangeTrackAlbumScreen} />
      <Stack.Screen name="ChangeTrackPlaylists" component={ChangeTrackPlaylistsScreen} />
      <Stack.Screen name="AddAlbum" component={AddAlbumScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen
        name="AddTracksToAlbum"
        component={AddTracksToAlbumScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
