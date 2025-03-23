import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router'; 

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Aai's Kitchen</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(user)')}
      >
        <Text style={styles.buttonText}>User Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(fadmin)')}
      >
        <Text style={styles.buttonText}>Franchise Admin Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#4B9CD3',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
