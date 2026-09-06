import { Component, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Root-level crash guard. React error boundaries only catch errors thrown during render/lifecycle
 * (not inside event handlers or async code — those are handled via QueryError, see src/data/queryError.ts).
 * This is the last resort for genuinely unexpected bugs, not a substitute for normal error handling.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error('Unhandled render error caught by ErrorBoundary:', error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>UN PROBLÈME EST SURVENU</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  title: { color: '#E8001C', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  message: { color: '#888', fontSize: 13, textAlign: 'center' },
});
