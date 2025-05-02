import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import Button from '@/components/Button';
import Checkbox from 'expo-checkbox';

export default function EditMenuScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const franchise_id = useAuthStore((state) => state.franchiseId);

  const [allItems, setAllItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      if (!franchise_id || !type) return;
      setLoading(true);

      const { data: allFoodItems, error: allItemsError } = await supabase
        .from('food_items')
        .select('*');

      const { data: mealsData, error: mealError } = await supabase
        .from('meals')
        .select('menu')
        .eq('meal_type', type.toString().toLowerCase())
        .eq('franchise_id', franchise_id)
        .eq('date', today);

      if (allItemsError || mealError) {
        console.error('Fetch error:', allItemsError?.message || mealError?.message);
      }

      setAllItems(allFoodItems || []);

      if (mealsData && mealsData.length > 0) {
        const existing = mealsData[0]?.menu?.items || [];
        setSelectedItems(existing); // Already in correct format
      }

      setLoading(false);
    };

    fetchData();
  }, [type, franchise_id]);

  const toggleItem = (item: any) => {
    const exists = selectedItems.find((i) => i.food_item_id === item.food_item_id);
    if (exists) {
      setSelectedItems((prev) => prev.filter((i) => i.food_item_id !== item.food_item_id));
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          name: item.name,
          image_url: item.image_url,
          food_item_id: item.food_item_id,
        },
      ]);
    }
  };

  const handleSave = async () => {
    if (!franchise_id || !type) return;

    const { data: existingMeals } = await supabase
      .from('meals')
      .select('id')
      .eq('franchise_id', franchise_id)
      .eq('meal_type', type.toString().toLowerCase())
      .eq('date', today);

    const menuData = {
      items: selectedItems,
      franchise_id: franchise_id,
    };

    if (existingMeals && existingMeals.length > 0) {
      const mealId = existingMeals[0].id;

      const { error } = await supabase
        .from('meals')
        .update({ menu: menuData })
        .eq('id', mealId);

      if (error) console.error('Update failed:', error.message);
    } else {
      const { error } = await supabase.from('meals').insert([{
        meal_type: type.toString().toLowerCase(),
        franchise_id,
        date: today,
        menu: menuData,
      }]);

      if (error) console.error('Insert failed:', error.message);
    }

    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit {type?.toString().toUpperCase()} Menu</Text>

      <FlatList
        data={allItems}
        keyExtractor={(item) => item.food_item_id}
        numColumns={2}
        renderItem={({ item }) => {
          const isChecked = selectedItems.some((i) => i.food_item_id === item.food_item_id);

          return (
            <View style={styles.itemCard}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} />
              ) : (
                <View
                  style={[styles.image, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}
                >
                  <Text>No Image</Text>
                </View>
              )}
              <Text style={styles.itemText}>{item.name}</Text>
              <Checkbox
                value={isChecked}
                onValueChange={() => toggleItem(item)}
                style={styles.checkbox}
              />
            </View>
          );
        }}
      />

      <View style={{ marginTop: 20 }}>
        <Button text="Save Menu" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  itemText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  checkbox: {
    marginTop: 6,
  },
});
