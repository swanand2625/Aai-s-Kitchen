import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

interface GuestMeal {
  id: string;
  guest_name: string;
  meal_type: string;
  date: string;
  price: number;
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
      <Text style={styles.detail}>
        Date: {new Date(item.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </Text>
      <Text style={styles.detail}>Price: ₹{item.price.toFixed(2)}</Text>
      <Text style={styles.detail}>
        Submitted At: {new Date(item.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Guest Meal Requests</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 30 }} />
      ) : guestMeals.length === 0 ? (
        <Text style={styles.emptyText}>
          No guest requests found.
        </Text>
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
    backgroundColor: '#F4F6F8',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 60,
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#388E3C',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2E7D32',
  },
  detail: {
    fontSize: 14,
    color: '#444',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#888',
  },
});
