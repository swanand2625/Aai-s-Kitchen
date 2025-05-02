import {
    View,
    Text,
    StyleSheet,
    TextInput,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
  } from 'react-native';
  import { useEffect, useState } from 'react';
  import { supabase } from '@/lib/supabase';
  import { useAuthStore } from '@/providers/useAuthStore';
  
  const categories = ['all', 'main', 'snack', 'side', 'dessert'];
  
  export default function AddonScreen() {
    const user = useAuthStore((state) => state.userId);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [memberId, setMemberId] = useState<string | null>(null);
  
    const fetchMember = async () => {
      const { data, error } = await supabase
        .from('mess_members')
        .select('id')
        .eq('user_id', user)
        .eq('active', true)
        .maybeSingle();
  
      if (data) setMemberId(data.id);
    };
  
    const fetchItems = async () => {
      setLoading(true);
      let query = supabase.from('food_items').select('*');
  
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }
  
      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }
  
      const { data, error } = await query;
  
      if (data) {
        setItems(data);
      }
  
      setLoading(false);
    };
  
    const handleAddItem = async (item: any) => {
      if (!memberId) return;
  
      const { error } = await supabase.from('extra_addons').insert({
        member_id: memberId,
        item_name: item.name,
        quantity: 1,
        price: item.price,
        meal_id: null, // Add logic if you want to link with a meal
      });
  
      if (!error) {
        alert(`${item.name} added as an add-on.`);
      }
    };
  
    useEffect(() => {
      fetchMember();
    }, [user]);
  
    useEffect(() => {
      fetchItems();
    }, [searchQuery, activeCategory]);
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🍱 Add-on Request</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={activeCategory === cat ? styles.categoryTextActive : styles.categoryText}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#00aa66" />
        ) : (
          <FlatList
            data={items}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            keyExtractor={(item) => item.food_item_id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddItem(item)}
                >
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0fff0',
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
      color: '#2b7a4b',
    },
    searchInput: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 10,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 12,
    },
    categoryRow: {
      flexDirection: 'row',
      marginBottom: 12,
      flexWrap: 'wrap',
      gap: 8,
    },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: '#e0e0e0',
    },
    categoryChipActive: {
      backgroundColor: '#2b7a4b',
    },
    categoryText: {
      color: '#333',
    },
    categoryTextActive: {
      color: '#fff',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 16,
      width: '48%',
      alignItems: 'center',
      padding: 12,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: '#eee',
    },
    name: {
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 4,
      textAlign: 'center',
    },
    price: {
      color: '#666',
      marginBottom: 8,
    },
    addButton: {
      backgroundColor: '#2b7a4b',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 8,
    },
    addText: {
      color: '#fff',
      fontWeight: '600',
    },
  });
  