import { View, Text, StyleSheet } from 'react-native';

export default function Menu() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽️ Today’s Menu</Text>
      <Text style={styles.text}>Check what’s being served today!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#444',
  },
});
