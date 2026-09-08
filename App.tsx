import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ErrorBoundary } from './src/components/layout/ErrorBoundary';
import { DATABASE_NAME, migrateDatabase } from './src/db/client';
import { PlaybackProvider } from './src/features/playback/PlaybackProvider';
import { SettingsProvider } from './src/features/settings/SettingsProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

/** Root component of the app. */
export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
          <SettingsProvider>
            <PlaybackProvider>
              <RootNavigator />
              <StatusBar style="light" />
            </PlaybackProvider>
          </SettingsProvider>
        </SQLiteProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
