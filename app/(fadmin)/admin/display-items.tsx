import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { useLayoutEffect, useEffect, useState } from 'react';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';

export default function DisplayItemsScreen() {
  const { type } = useLocalSearchParams();
  const navigation = useNavigation();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: type
        ? `${type.toString().charAt(0).toUpperCase()}${type.toString().slice(1)} Items`
        : 'Items',
    });
  }, [navigation, type]);

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('meal_type', type)
        .order('date', { ascending: false }) // Latest first
        .limit(1)
        .single();

      if (error) {
        console.error('Fetch error:', error.message);
        setItems([]);
      } else {
        const menuItems = data?.menu?.items || [];
        setItems(menuItems);
      }

      setLoading(false);
    };

    if (type) fetchMeal();
  }, [type]);

  const hasItems = items.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Selected for today</Text>

      <View style={styles.selectedContainer}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : hasItems ? (
          <FlatList
            data={items}
            numColumns={2}
            keyExtractor={(item, index) => item.food_item_id || index.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Image source={{ uri: item.image_url }} style={styles.image} />
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.noItemsText}>No items selected</Text>
        )}
      </View>

      <Button
        text="Add Item"
        onPress={() => {
          router.push({
            pathname: '/(fadmin)/admin/all-food-item',
            params: { type },
          });
        }}
      />
    </View>
  );
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      padding: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
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
      color: '#6b7280',
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
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 12,
      marginBottom: 8,
    },
    itemText: {
      fontSize: 16,
      textAlign: 'center',
    },
  });
  