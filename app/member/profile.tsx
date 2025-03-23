import { View, Text, StyleSheet } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <Text style={styles.text}>Welcome to your profile page.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F2F2F2',
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
    color: '#555',
  },
});
