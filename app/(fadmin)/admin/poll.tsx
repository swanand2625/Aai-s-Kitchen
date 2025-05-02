import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import Button from '@/components/Button';
import Checkbox from 'expo-checkbox';

export default function CreatePollScreen() {
  const { type } = useLocalSearchParams(); // meal_type
  const router = useRouter();
  const franchise_id = useAuthStore((s) => s.franchiseId);
  const admin_user_id = useAuthStore((s) => s.userId);

  const [allItems, setAllItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('food_items').select('*');
      if (error) {
        console.error(error.message);
      } else {
        setAllItems(data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );
  };

  const handleCreatePoll = async () => {
    if (!franchise_id || !admin_user_id || !type) {
      Alert.alert("Missing Data", "Please make sure all fields are filled.");
      return;
    }
  
    try {
      // Fetching users (to validate that franchise_id exists)
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('franchise_id', franchise_id);
  
      if (usersError) {
        throw new Error(`Error fetching users: ${usersError.message}`);
      }
      if (!usersData || usersData.length === 0) {
        throw new Error('No users found for the specified franchise.');
      }
  
      // Fetching mess members
      const { data: messMembers, error: messError } = await supabase
        .from('mess_members')
        .select('id, user_id')
        .eq('franchise_id', franchise_id);
  
      if (messError) {
        throw new Error(`Error fetching mess members: ${messError.message}`);
      }
      if (!messMembers || messMembers.length === 0) {
        throw new Error('No mess members found for the specified franchise.');
      }
  
      // Create poll entries
      const pollEntries = messMembers.map((m) => ({
        user_id: m.user_id,
        mess_member_id: m.id,
        franchise_id,
        admin_user_id,
        meal_type:'breakfast',
        date: today,
        will_have_meal: true, // Default to true; you can change this as needed
      }));
  
      // Inserting the poll entries
      const { data, error: insertError } = await supabase
        .from('polls')
        .insert(pollEntries);
  
      if (insertError) {
        throw new Error(`Error inserting poll entries: ${insertError.message}`);
      }
  
      Alert.alert('Poll created!', `Poll created for all users`);
      router.replace('/admin/poll'); // Navigate to the polls list page
    } catch (err: any) {
      console.error('Poll creation error:', err.message);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Poll for {type?.toString().toUpperCase()}</Text>

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
              <Text style={styles.itemInfo}>Price: ₹{item.price}</Text>
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

      <Button text="Create Poll" onPress={handleCreatePoll} />
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
