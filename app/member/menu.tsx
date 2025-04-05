import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore'; // To get userId

export default function Menu() {
  const userId = useAuthStore((state) => state.userId); // Get userId from auth store
  const [mealsByType, setMealsByType] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFranchiseIdAndMeals = async () => {
      if (!userId) {
        console.error('User ID missing');
        return;
      }

      setLoading(true);

      // Step 1: Get franchise_id from mess_member
      const { data: memberData, error: memberError } = await supabase
        .from('mess_members')
        .select('franchise_id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (memberError || !memberData) {
        console.error('Error fetching franchise_id:', memberError?.message);
        setMealsByType({});
        setLoading(false);
        return;
      }

      const franchiseId = memberData.franchise_id;

      // Step 2: Get today's meals
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];

      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('meal_type, menu')
        .eq('franchise_id', franchiseId)
        .eq('date', formattedToday);

      if (mealsError || !mealsData) {
        console.error('Error fetching meals:', mealsError?.message);
        setMealsByType({});
        setLoading(false);
        return;
      }

      // Organize meals by meal_type
      const organizedMeals: { [key: string]: any[] } = {};
      mealsData.forEach((meal) => {
        const type = meal.meal_type;
        const items = meal.menu?.items || [];
        if (items.length > 0) {
          organizedMeals[type] = items;
        }
      });

      setMealsByType(organizedMeals);
      setLoading(false);
    };

    fetchFranchiseIdAndMeals();
  }, [userId]);

  const mealTypesOrder = ['breakfast', 'lunch', 'dinner'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽 Today’s Menu</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        mealTypesOrder.map((mealType) => (
          <View key={mealType} style={styles.mealSection}>
            <Text style={styles.mealTitle}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>
            {mealsByType[mealType] ? (
              <FlatList
                data={mealsByType[mealType]}
                keyExtractor={(item) => item.food_item_id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <Image source={{ uri: item.image_url }} style={styles.image} />
                    <Text style={styles.itemName}>{item.name}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noItemText}>No {mealType} menu available</Text>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FFF8F0',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  mealSection: {
    marginBottom: 24,
  },
  mealTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  noItemText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
  },
});