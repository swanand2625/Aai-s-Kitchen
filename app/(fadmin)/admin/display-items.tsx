import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { useLayoutEffect, useEffect, useState } from 'react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function DisplayItemsScreen() {
  const { type } = useLocalSearchParams();
  const navigation = useNavigation();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const franchise_id = useAuthStore((state) => state.franchiseId);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: type
        ? `${type.toString().charAt(0).toUpperCase()}${type.toString().slice(1)} Items`
        : 'Items',
    });
  }, [navigation, type]);

  useEffect(() => {
    const fetchMeal = async () => {
      if (!franchise_id || !type) {
        console.error('Franchise ID or type missing');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      console.log('Franchise ID:', franchise_id);
      console.log('Meal Type:', type);
      console.log("Today's Date:", today);

      setLoading(true);

      const { data, error } = await supabase
        .from('meals')
        .select('menu')
        .eq('meal_type', type)
        .eq('franchise_id', franchise_id)
        .eq('date', today);

      console.log('Meals fetch result:', data);
      if (error) {
        console.error('Fetch error:', error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const selectedItems = data?.[0]?.menu?.items ?? [];

      if (!Array.isArray(selectedItems)) {
        console.warn('Unexpected menu.items structure:', selectedItems);
        setItems([]);
        setLoading(false);
        return;
      }

      const validItems = selectedItems.filter(
        (item: any) => typeof item === 'object' && item.food_item_id
      );
      const foodItemIds = validItems.map((item: any) => item.food_item_id);

      if (foodItemIds.length === 0) {
        console.warn('No valid food item IDs found.');
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: foodItems, error: itemErr } = await supabase
        .from('food_items')
        .select('*')
        .in('food_item_id', foodItemIds);

      if (itemErr) {
        console.error('Item fetch error:', itemErr.message);
        setItems([]);
      } else {
        const normalized = foodItems?.map((item) => ({
          ...item,
          id: item.id ?? item.food_item_id,
        })) ?? [];
        setItems(normalized);
      }

      setLoading(false);
    };

    fetchMeal();
  }, [type, franchise_id]);

  const hasItems = items.length > 0;

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/logo.jpg')} style={styles.logo} />
      <Text style={styles.sectionTitle}>Selected for today</Text>

      <View style={styles.selectedContainer}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : hasItems ? (
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.image} />
                ) : (
                  <View
                    style={[
                      styles.image,
                      {
                        backgroundColor: '#ddd',
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Text style={{ color: '#666' }}>No Image</Text>
                  </View>
                )}
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noItemsText}>No items selected</Text>
        )}
      </View>

      <View style={styles.buttonGroup}>
        {!hasItems && (
          <>
            <Button
              text="Add Item"
              onPress={() => {
                router.push({
                  pathname: '/(fadmin)/admin/all-food-item',
                  params: { type },
                });
              }}
            />
            <View style={{ marginTop: 10 }} />
          </>
        )}
        <Button
          text="Edit Menu"
          onPress={() => {
            router.push({
              pathname: '/(fadmin)/admin/edit-menu',
              params: { type },
            });
          }}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50', // Green color
    marginBottom: 12,
  },
  selectedContainer: {
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    padding: 12,
    minHeight: 200,
  },
  noItemsText: {
    fontSize: 16,
    color: '#4CAF50', // Green color
    textAlign: 'center',
    marginTop: 40,
  },
  itemCard: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4CAF50', // Green border
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
    color: '#333', // Dark text for contrast
  },
  buttonGroup: {
    marginTop: 20,
  },
});
