import { View, Text, StyleSheet } from 'react-native';

export default function Holiday() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌴 Holiday Request</Text>
      <Text style={styles.text}>Submit your holiday request here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#E8F8F5',
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
