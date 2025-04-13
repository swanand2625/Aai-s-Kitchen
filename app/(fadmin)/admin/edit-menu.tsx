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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
        .eq('meal_type', type.toString())
        .eq('franchise_id', franchise_id)
        .eq('date', today);

      if (allItemsError || mealError) {
        console.error('Fetch error:', allItemsError?.message || mealError?.message);
      }

      setAllItems(allFoodItems || []);

      if (mealsData && mealsData.length > 0) {
        const items = mealsData[0]?.menu?.items || [];
        const ids = items.map((item: any) => item.food_item_id);
        setSelectedIds(ids);
        console.log('Pre-selected food_item_ids:', ids);
      }

      setLoading(false);
    };

    fetchData();
  }, [type, franchise_id]);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!franchise_id || !type) return;

    const { data: existingMeals } = await supabase
      .from('meals')
      .select('id')
      .eq('franchise_id', franchise_id)
      .eq('meal_type', type.toString())
      .eq('date', today);

    const menuData = {
      items: selectedIds.map((id) => ({ food_item_id: id })),
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
        meal_type: type.toString(),
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
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const isChecked = selectedIds.includes(item.id);

          return (
            <View style={styles.itemCard}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={styles.imagePlaceholderText}>No Image</Text>
                </View>
              )}
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemInfo}>Calories: {item.calories}</Text>
              <Text style={styles.itemInfo}>Price: ${item.price}</Text>
              <Checkbox
                value={isChecked}
                onValueChange={() => toggleItem(item.id)}
                style={styles.checkbox}
                color={isChecked ? '#2E7D32' : undefined}
              />
            </View>
          );
        }}
      />

      <Button text="Save Menu" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF8',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 16,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    margin: 8,
    alignItems: 'center',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemInfo: {
    fontSize: 14,
    color: '#555',
  },
  checkbox: {
    marginTop: 8,
    width: 24,
    height: 24,
  },
});
