import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function TotalCustomersScreen() {
  const { userId } = useAuthStore();
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalActive, setTotalActive] = useState<number>(0);

  useEffect(() => {
    const fetchFranchiseId = async () => {
      try {
        const { data, error } = await supabase
          .from('franchise_admins')
          .select('franchise_id')
          .eq('user_id', userId)
          .single();

        if (error || !data) {
          return;
        }
        setFranchiseId(data.franchise_id);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch franchise ID.');
      }
    };

    if (userId) {
      fetchFranchiseId();
    }
  }, [userId]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!franchiseId) return;

      try {
        const { data, error } = await supabase
          .from('mess_members')
          .select('id, user_id, active')
          .eq('franchise_id', franchiseId);

        if (error || !data) {
          Alert.alert('Error', 'Failed to fetch customers.');
          return;
        }

        setCustomers(data);
        setTotalActive(data.filter((customer) => customer.active).length);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch customers.');
      }
    };

    if (franchiseId) {
      fetchCustomers();
    }
  }, [franchiseId]);

  const fetchCustomerProfile = async (userId: string) => {
    try {
      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, contact')
        .eq('id', userId)
        .single();

      if (userError) console.warn("User Fetch Warning:", userError.message);

      // Fetch mess member details
      const { data: memberData, error: memberError } = await supabase
        .from('mess_members')
        .select('veg_pref')
        .eq('user_id', userId)
        .single();

      if (memberError) console.warn("Mess Member Fetch Warning:", memberError.message);

      return {
        name: userData?.name || 'Unknown',
        contact: userData?.contact || 'NA',
        vegPref: memberData?.veg_pref ? 'Veg' : 'Non-Veg',
      };
    } catch (error) {
      console.error("Error Fetching Profile:", error.message);
      return {
        name: 'Unknown',
        contact: 'NA',
        vegPref: 'Unknown',
      };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
      const loadProfile = async () => {
        const profileData = await fetchCustomerProfile(item.user_id);
        setProfile(profileData);
      };

      loadProfile();
    }, [item.user_id]);

    if (!profile) {
      return <Text>Loading...</Text>;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardText}>Name: {profile.name}</Text>
        <Text style={styles.cardText}>Contact: {profile.contact}</Text>
        <Text style={styles.cardText}>Status: {item.active ? 'Active' : 'Inactive'}</Text>
        <Text style={styles.cardText}>Preference: {profile.vegPref}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Total Customers</Text>
      <Text style={styles.subHeader}>Active Customers: {totalActive}</Text>

      <FlatList
        data={customers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B9CD3',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
});
