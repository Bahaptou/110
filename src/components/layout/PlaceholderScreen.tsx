import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = { label: string };

/** Stand-in for a tab whose feature isn't implemented yet. Replace with the real screen when its slice lands. */
export function PlaceholderScreen({ label }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>{label}</Text>
      <Text style={styles.message}>Bientôt disponible.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { color: '#fff', fontWeight: '700', fontSize: 18, letterSpacing: -0.5 },
  message: { color: '#888', fontSize: 13 },
});
