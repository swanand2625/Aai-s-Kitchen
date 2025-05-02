import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

interface GuestMeal {
  id: string;
  guest_name: string;
  meal_type: string;
  date: string;
  price: number;
  no_of_person: number; // Added to reflect the number of persons
  mess_member_id: string;
  created_at: string;
}

export default function ViewGuestRequestsScreen() {
  const franchiseId = useAuthStore((state) => state.franchiseId);
  const [guestMeals, setGuestMeals] = useState<GuestMeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuestMeals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('guest_meals')
        .select('*')
        .eq('franchise_id', franchiseId)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching guest meals:', error);
        setLoading(false);
        return;
      }

      setGuestMeals(data || []);
      setLoading(false);
    };

    fetchGuestMeals();
  }, [franchiseId]);

  const renderItem = ({ item }: { item: GuestMeal }) => (
    <View style={styles.card}>
      <Text style={styles.guestName}>{item.guest_name}</Text>
      <Text style={styles.detail}>Meal: {item.meal_type.toUpperCase()}</Text>
      <Text style={styles.detail}>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.detail}>Price: ₹{item.price.toFixed(2)}</Text>
      <Text style={styles.detail}>Guest Count: {item.no_of_person}</Text>
      <Text style={styles.detail}>Submitted At: {new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Guest Meal Requests</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 30 }} />
      ) : guestMeals.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40, fontSize: 16 }}>No guest requests found.</Text>
      ) : (
        <FlatList
          data={guestMeals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
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
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f1fdf4',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  detail: {
    fontSize: 14,
    color: '#333',
  },
});
