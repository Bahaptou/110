import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ArtistDetailScreen } from '../artists/screens/ArtistDetailScreen';
import { ChangeTrackPlaylistsScreen } from '../playlists/screens/ChangeTrackPlaylistsScreen';
import { PlaylistDetailScreen } from '../playlists/screens/PlaylistDetailScreen';
import { ChangeTrackAlbumScreen } from '../tracks/screens/ChangeTrackAlbumScreen';
import { ChangeTrackArtistScreen } from '../tracks/screens/ChangeTrackArtistScreen';
import { AddAlbumScreen } from './screens/AddAlbumScreen';
import { AddTracksToAlbumScreen } from './screens/AddTracksToAlbumScreen';
import { AlbumDetailScreen } from './screens/AlbumDetailScreen';
import { AlbumsListScreen } from './screens/AlbumsListScreen';

export type AlbumsStackParamList = {
  AlbumsList: undefined;
  /** `artistId` pre-selects the artist when creating from an artist's page. */
  AddAlbum: { artistId?: string };
  AlbumDetail: { albumId: string };
  /** Both reachable from the cross-context search results on the albums list. */
  ArtistDetail: { artistId: string };
  PlaylistDetail: { playlistId: string };
  AddTracksToAlbum: { albumId: string };
  ChangeTrackArtist: { trackId: string };
  ChangeTrackAlbum: { trackId: string };
  ChangeTrackPlaylists: { trackId: string };
};

const Stack = createNativeStackNavigator<AlbumsStackParamList>();

export function AlbumsStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AlbumsList" component={AlbumsListScreen} />
      <Stack.Screen name="AddAlbum" component={AddAlbumScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen
        name="AddTracksToAlbum"
        component={AddTracksToAlbumScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ChangeTrackArtist" component={ChangeTrackArtistScreen} />
      <Stack.Screen name="ChangeTrackAlbum" component={ChangeTrackAlbumScreen} />
      <Stack.Screen name="ChangeTrackPlaylists" component={ChangeTrackPlaylistsScreen} />
    </Stack.Navigator>
  );
}
