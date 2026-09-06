import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { ArtistsStack } from '../features/artists/ArtistsStack';
import { AlbumsTabIcon, ArtistsTabIcon, PlaylistsTabIcon, TracksTabIcon } from './TabIcons';

export type RootTabParamList = {
  Artists: undefined;
  Tracks: undefined;
  Albums: undefined;
  Playlists: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const darkTheme = {
  dark: true,
  colors: {
    primary: '#E8001C',
    background: '#000',
    card: '#000',
    text: '#fff',
    border: '#2a2a2a',
    notification: '#E8001C',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

function TracksScreen(): React.JSX.Element {
  return <PlaceholderScreen label="MORCEAUX" />;
}

function AlbumsScreen(): React.JSX.Element {
  return <PlaceholderScreen label="ALBUMS" />;
}

function PlaylistsScreen(): React.JSX.Element {
  return <PlaceholderScreen label="PLAYLISTS" />;
}

/** Root navigator: 4-tab bar (Artistes/Morceaux/Albums/Playlists), each tab owning its own stack for drill-down. */
export function RootNavigator(): React.JSX.Element {
  return (
    <NavigationContainer theme={darkTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#000', borderTopColor: '#2a2a2a' },
          tabBarActiveTintColor: '#E8001C',
          tabBarInactiveTintColor: '#555',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
        }}
      >
        <Tab.Screen
          name="Artists"
          component={ArtistsStack}
          options={{ tabBarLabel: 'ARTISTES', tabBarIcon: ({ focused }) => <ArtistsTabIcon active={focused} /> }}
        />
        <Tab.Screen
          name="Tracks"
          component={TracksScreen}
          options={{ tabBarLabel: 'MORCEAUX', tabBarIcon: ({ focused }) => <TracksTabIcon active={focused} /> }}
        />
        <Tab.Screen
          name="Albums"
          component={AlbumsScreen}
          options={{ tabBarLabel: 'ALBUMS', tabBarIcon: ({ focused }) => <AlbumsTabIcon active={focused} /> }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={{ tabBarLabel: 'PLAYLISTS', tabBarIcon: ({ focused }) => <PlaylistsTabIcon active={focused} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
