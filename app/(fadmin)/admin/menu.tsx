import { useNavigation } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { Link, useRouter } from 'expo-router';

const mealCategories = ['Breakfast', 'Lunch', 'Dinner'];

export default function MenuScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Link href="/add-food" asChild>
          <Pressable style={styles.headerIcon}>
            {({ pressed }) => (
              <FontAwesome
                name="plus"
                size={28}
                color="#2E7D32"
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        </Link>
      ),
    });
  }, [navigation]);

  const handlePress = (mealType: string) => {
    router.push(`/(fadmin)/admin/display-items?type=${mealType.toLowerCase()}` as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Select Meal Type</Text>
      <View style={styles.cardContainer}>
        {mealCategories.map((meal) => (
          <Pressable
            key={meal}
            style={({ pressed }) => [
              styles.mealCard,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => handlePress(meal)}
          >
            <Text style={styles.mealText}>{meal}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF8',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  headerIcon: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  mealCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  mealText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2E7D32',
  },
});
