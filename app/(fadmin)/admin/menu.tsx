import { useNavigation } from 'expo-router';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { Link } from 'expo-router';

const dummyData = {
  breakfast: [],
  lunch: [],
  dinner: [],
};

export default function MenuScreen() {
  const navigation = useNavigation();

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

  return (
    <View style={styles.container}>
      <MealSection title="Breakfast" data={dummyData.breakfast} />
      <MealSection title="Lunch" data={dummyData.lunch} />
      <MealSection title="Dinner" data={dummyData.dinner} />
    </View>
  );
}

function MealSection({ title, data }: { title: string; data: any[] }) {
  return (
    <View style={styles.mealSection}>
      <Text style={styles.mealTitle}>{title}</Text>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(_, index) => `${title}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.foodCard}>
            <Text style={styles.foodText}>{item.name || 'Item'}</Text>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerIcon: {
    marginRight: 16,
  },
  mealSection: {
    marginBottom: 24,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  foodCard: {
    marginRight: 12,
    backgroundColor: '#e5e7eb', 
    padding: 12,
    borderRadius: 12,
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodText: {
    textAlign: 'center',
  },
});
