import { View, Text, StyleSheet } from 'react-native';

export default function Bills() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Bill Section</Text>
      <Text style={styles.text}>View and pay your mess bills here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9F9F9',
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
