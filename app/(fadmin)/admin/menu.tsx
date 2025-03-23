import { useNavigation } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { Link, useRouter } from 'expo-router';

const mealCategories = ['Breakfast', 'Lunch', 'Dinner'];

export default function MenuScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const meal=''

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Link href="/add-food" asChild>
          <Pressable style={styles.headerIcon}>
            {({ pressed }) => (
              <FontAwesome
                name="plus"
                size={34}
                color="white"
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
      {mealCategories.map((meal) => (
        <Pressable
          key={meal}
          style={({ pressed }) => [
            styles.mealCard,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => handlePress(meal)}
        >
          <Text style={styles.mealText}>{meal}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerIcon: {
    marginRight: 16,
  },
  mealCard: {
    backgroundColor: '#fbbf24', // Warm yellow shade
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  mealText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
});
