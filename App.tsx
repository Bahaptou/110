import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';

import { ErrorBoundary } from './src/components/layout/ErrorBoundary';
import { DATABASE_NAME, migrateDatabase } from './src/db/client';
import { RootNavigator } from './src/navigation/RootNavigator';

/** Root component of the app. */
export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase}>
        <RootNavigator />
        <StatusBar style="light" />
      </SQLiteProvider>
    </ErrorBoundary>
  );
}
