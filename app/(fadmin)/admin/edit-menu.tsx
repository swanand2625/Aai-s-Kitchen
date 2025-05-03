import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import Button from '@/components/Button';
import Checkbox from 'expo-checkbox';

const screenWidth = Dimensions.get('window').width;

const CATEGORIES = ['All', 'Main', 'Snack', 'Side', 'Dessert'];

export default function EditMenuScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const franchise_id = useAuthStore((state) => state.franchiseId);

  const [allItems, setAllItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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
        setSelectedItems(existing);
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

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit {type?.toString().toUpperCase()} Menu</Text>

      {/* Search Bar */}
      <TextInput
        placeholder="Search food..."
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.tab,
              selectedCategory === cat && styles.activeTab
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && styles.activeTabText
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredItems.length === 0 ? (
        <Text style={styles.emptyText}>No food items found.</Text>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.food_item_id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => {
            const isChecked = selectedItems.some(
              (i) => i.food_item_id === item.food_item_id
            );

            return (
              <View style={styles.itemCard}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.image} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={{ color: '#666' }}>No Image</Text>
                  </View>
                )}
                <Text style={styles.itemText}>{item.name}</Text>
                <Checkbox
                  value={isChecked}
                  onValueChange={() => toggleItem(item)}
                  color={isChecked ? '#4CAF50' : undefined}
                  style={styles.checkbox}
                />
              </View>
            );
          }}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button text="Save Menu" onPress={handleSave} />
      </View>
    </View>
  );
}

const cardSize = (screenWidth - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#388E3C',
    marginBottom: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  tabsContainer: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#444',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    justifyContent: 'space-between',
  },
  itemCard: {
    width: cardSize,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
    color: '#333',
  },
  checkbox: {
    marginTop: 6,
  },
  buttonContainer: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
});
