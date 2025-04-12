// app/(fadmin)/admin/edit-menu.tsx

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditMenuScreen() {
  const router = useRouter();

  const handleNavigate = (mealType: string) => {
    router.push(`/admin/edit-menu/${mealType.toLowerCase()}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Menu</Text>

      {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
        <TouchableOpacity
          key={meal}
          style={styles.button}
          onPress={() => handleNavigate(meal)}
        >
          <Text style={styles.buttonText}>Edit {meal}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fff0', // light greenish background
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#1b4332',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#38b000', // green button
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
