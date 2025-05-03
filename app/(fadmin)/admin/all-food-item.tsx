import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import { useAuthStore } from '@/providers/useAuthStore';

const CATEGORIES = ['all', 'main', 'side', 'snack', 'dessert'];

type FoodItem = {
  food_item_id: string;
  name: string;
  category: string;
  image_url: string;
};

export default function AllFoodItemsScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { franchiseId } = useAuthStore();

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('food_items').select('*');
      if (error) {
        console.error('Error fetching items:', error.message);
        Alert.alert('Error', 'Could not fetch food items.');
      } else {
        setFoodItems(data || []);
        setFilteredItems(data || []);
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, activeCategory, foodItems]);

  const filterItems = () => {
    let items = [...foodItems];

    if (activeCategory !== 'all') {
      items = items.filter((item) => item.category?.toLowerCase() === activeCategory);
    }

    if (searchQuery.trim()) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(items);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    const selectedItems = foodItems.filter(item => selected.includes(item.food_item_id));

    const menu = {
      franchise_id: franchiseId,
      items: selectedItems.map(item => ({
        food_item_id: item.food_item_id,
        name: item.name,
        image_url: item.image_url,
      })),
    };

    const { error } = await supabase.from('meals').insert([{
      meal_type: type,
      date: new Date().toISOString().split('T')[0],
      menu,
      franchise_id: franchiseId,
    }]);

    if (error) {
      console.error('Insert error:', error.message);
      Alert.alert('Error', 'Failed to add items to meal.');
    } else {
      Alert.alert('Success', 'Items added successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/logo.jpg')} style={styles.logo} />
      <Text style={styles.title}>Select Food Items</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.categoryButton,
              activeCategory === cat && styles.activeCategoryButton,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat && styles.activeCategoryText,
              ]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.food_item_id}
        numColumns={2}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.food_item_id);
          return (
            <Pressable
              onPress={() => toggleSelect(item.food_item_id)}
              style={[styles.card, isSelected && styles.selectedCard]}
            >
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {selected.length > 0 && (
        <View style={styles.footer}>
          <Button text={`Add to ${type}`} onPress={handleAdd} />
        </View>
      )}
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
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#14532d',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryScroll: {
    marginTop: 5,
    marginBottom: 35,
  },
  categoryButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 1,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: '#A7F3D0',
  },
  categoryText: {
    fontSize: 14,
    color: '#374151',
  },
  activeCategoryText: {
    color: '#065F46',
    fontWeight: '600',
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  itemName: {
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
    color: '#111827',
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});
