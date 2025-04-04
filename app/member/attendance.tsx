import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const mealTypes = ['breakfast', 'lunch', 'dinner'];

export default function Attendance() {
  const router = useRouter();

  const handlePress = (meal: string) => {
    router.push({ pathname: '/member/QRScanner', params: { mealType: meal } });
  };

  return (
    <View style={styles.container}>
      {mealTypes.map((meal) => (
        <Pressable key={meal} onPress={() => handlePress(meal)} style={styles.gridBox}>
          <Text style={styles.gridText}>{meal.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
  },
  gridBox: {
    backgroundColor: '#007AFF',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  gridText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
