import { NavigationContainer, useNavigation, type NavigationProp } from '@react-navigation/native';
import { BottomTabBar, createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { PlaceholderScreen } from '../components/layout/PlaceholderScreen';
import { AlbumsStack } from '../features/albums/AlbumsStack';
import { ArtistsStack } from '../features/artists/ArtistsStack';
import { PlaylistsStack } from '../features/playlists/PlaylistsStack';
import { MiniPlayer } from '../features/playback/MiniPlayer';
import { PlayerScreen } from '../features/playback/PlayerScreen';
import { TracksStack, type TracksStackParamList } from '../features/tracks/TracksStack';
import { AlbumsTabIcon, ArtistsTabIcon, PlaylistsTabIcon, RecordTabIcon, TracksTabIcon } from './TabIcons';

export type RootTabParamList = {
  Artists: undefined;
  /**
   * Nested: the centre record button targets a screen inside the tracks stack. `initial: false`
   * keeps the stack's own first screen mounted underneath rather than replacing it.
   */
  Tracks: { screen: keyof TracksStackParamList; initial?: boolean } | undefined;
  Record: undefined;
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

/** Never actually navigated to — tabBarButton below intercepts the press instead. Required by Tab.Screen regardless. */
function RecordScreen(): React.JSX.Element | null {
  return null;
}

/**
 * Raised circular record button, like Instagram/TikTok's center camera tab. Opens the recorder
 * inside the Tracks stack rather than switching to a Record tab, so a finished recording lands on
 * the same save screen an import does.
 */
function RecordTabButton(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  return (
    <View style={styles.recordButtonWrapper}>
      <Pressable
        style={styles.recordButton}
        // Targeting the stack's initial route explicitly keeps TracksList underneath, so the save
        // screen that follows the recording has somewhere to pop back to.
        onPress={() =>
          navigation.navigate('Tracks', {
            screen: 'RecordTrack',
            initial: false,
          })
        }
      >
        <RecordTabIcon />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  recordButtonWrapper: { flex: 1, alignItems: 'center' },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8001C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: '#E8001C',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
});

/** Root navigator: 5-tab bar (Artistes/Morceaux/Record/Albums/Playlists), each tab owning its own stack for drill-down. */
export function RootNavigator(): React.JSX.Element {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

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
        tabBar={(props: BottomTabBarProps) => (
          <View>
            <MiniPlayer onOpen={() => setIsPlayerOpen(true)} />
            <BottomTabBar {...props} />
          </View>
        )}
      >
        <Tab.Screen
          name="Artists"
          component={ArtistsStack}
          options={{ tabBarLabel: 'ARTISTES', tabBarIcon: ({ focused }) => <ArtistsTabIcon active={focused} /> }}
        />
        <Tab.Screen
          name="Tracks"
          component={TracksStack}
          options={{ tabBarLabel: 'MORCEAUX', tabBarIcon: ({ focused }) => <TracksTabIcon active={focused} /> }}
        />
        <Tab.Screen
          name="Record"
          component={RecordScreen}
          options={{ tabBarLabel: '', tabBarButton: () => <RecordTabButton /> }}
        />
        <Tab.Screen
          name="Albums"
          component={AlbumsStack}
          options={{ tabBarLabel: 'ALBUMS', tabBarIcon: ({ focused }) => <AlbumsTabIcon active={focused} /> }}
        />
        <Tab.Screen
          name="Playlists"
          component={PlaylistsStack}
          options={{ tabBarLabel: 'PLAYLISTS', tabBarIcon: ({ focused }) => <PlaylistsTabIcon active={focused} /> }}
        />
      </Tab.Navigator>
      <Modal visible={isPlayerOpen} animationType="slide" onRequestClose={() => setIsPlayerOpen(false)}>
        <PlayerScreen onClose={() => setIsPlayerOpen(false)} />
      </Modal>
    </NavigationContainer>
  );
}
