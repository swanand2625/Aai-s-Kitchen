
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

export default function AllFoodItemsScreen() {
  const { type } = useLocalSearchParams();
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('food_items').select('*');
      if (error) console.error('Error fetching items:', error.message);
      else setFoodItems(data || []);
      setLoading(false);
    };
    fetchItems();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    // Filter selected food items from foodItems list
    const selectedItems = foodItems.filter(item => selected.includes(item.id));
  
    // Construct JSON structure for `menu`
    const menu = {
      franchise_id: 'default_franchise', // you can replace with actual later
      items: selectedItems.map(item => ({
        food_item_id: item.id,
        name: item.name,
        image_url: item.image_url,
      })),
    };
  
    const { error } = await supabase.from('meals').insert([
      {
        meal_type: type,
        date: new Date().toISOString().split('T')[0], // today's date in YYYY-MM-DD
        menu,
      },
    ]);
  
    if (error) {
      console.error('Insert error:', error.message);
    } else {
      router.back(); // Go back to display screen
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Food Items</Text>

      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <Pressable
              onPress={() => toggleSelect(item.id)}
              style={[styles.card, isSelected && styles.selectedCard]}
            >
              <Image source={{ uri: item.image_url }} style={styles.image} />
              <Text style={styles.itemName}>{item.name}</Text>
            </Pressable>
          );
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {selected.length > 0 && (
        <Button text={`Add to ${type}`} onPress={handleAdd} />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    card: {
      flex: 1,
      margin: 8,
      backgroundColor: '#f3f4f6',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    selectedCard: {
      borderColor: 'green',
      borderWidth: 2,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 12,
    },
    itemName: {
      marginTop: 8,
      textAlign: 'center',
      fontWeight: '600',
    },
  });
  