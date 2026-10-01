import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Flip & Brew</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6EEE1' },
  title: { fontSize: 32, fontWeight: '700', color: '#2B1A12' },
});
