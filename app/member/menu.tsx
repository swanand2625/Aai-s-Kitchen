import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function Menu() {
  const userId = useAuthStore((state) => state.userId);
  const [mealsByType, setMealsByType] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFranchiseIdAndMeals = async () => {
      if (!userId) {
        console.error('User ID missing');
        return;
      }

      setLoading(true);

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
      const today = new Date().toISOString().split('T')[0];

      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('meal_type, menu')
        .eq('franchise_id', franchiseId)
        .eq('date', today);

      if (mealsError || !mealsData) {
        console.error('Error fetching meals:', mealsError?.message);
        setMealsByType({});
        setLoading(false);
        return;
      }

      const allFoodItemIds = mealsData
        .flatMap((meal) => meal.menu?.items || [])
        .filter((item: any) => item && item.food_item_id)
        .map((item: any) => item.food_item_id);

      const uniqueFoodItemIds = Array.from(new Set(allFoodItemIds));

      let foodItemsMap: { [id: string]: any } = {};
      if (uniqueFoodItemIds.length > 0) {
        const { data: foodItems, error: foodError } = await supabase
          .from('food_items')
          .select('*')
          .in('id', uniqueFoodItemIds);

        if (foodError) {
          console.error('Error fetching food items:', foodError.message);
        } else {
          foodItemsMap = Object.fromEntries(foodItems.map((item) => [item.id, item]));
        }
      }

      const organizedMeals: { [key: string]: any[] } = {};
      mealsData.forEach((meal) => {
        const type = meal.meal_type;
        const items = (meal.menu?.items || [])
          .map((item: any) => foodItemsMap[item.food_item_id])
          .filter(Boolean); // remove undefined

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

  const handleAddExtraItem = (mealType: string) => {
    Alert.alert(`Add extra item`, `You can add extra food item for ${mealType}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🍽 Today’s Menu</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        mealTypesOrder.map((mealType) => (
          <View key={mealType} style={styles.mealSection}>
            <Text style={styles.mealTitle}>
              {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
            </Text>

            {mealsByType[mealType] ? (
              <>
                <FlatList
                  data={mealsByType[mealType]}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <View style={styles.card}>
                      <Image source={{ uri: item.image_url }} style={styles.image} />
                      <Text style={styles.itemName}>{item.name}</Text>
                    </View>
                  )}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddExtraItem(mealType)}
                >
                  <Text style={styles.addButtonText}>+ Add Extra Item</Text>
                </TouchableOpacity>
              </>
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f9fff9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    textAlign: 'center',
  },
  mealSection: {
    marginBottom: 32,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  noItemText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#999',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
