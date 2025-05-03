import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Image } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function TotalCustomersScreen() {
  const { userId } = useAuthStore();
  const [franchiseId, setFranchiseId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalActive, setTotalActive] = useState<number>(0);
  const [profiles, setProfiles] = useState<any>({});

  useEffect(() => {
    const fetchFranchiseId = async () => {
      try {
        const { data, error } = await supabase
          .from('franchise_admins')
          .select('franchise_id')
          .eq('user_id', userId)
          .single();

        if (error || !data) return;
        setFranchiseId(data.franchise_id);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch franchise ID.');
      }
    };

    if (userId) fetchFranchiseId();
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

        const profilesData: any = {};
        for (const customer of data) {
          const profile = await fetchCustomerProfile(customer.user_id);
          profilesData[customer.user_id] = profile;
        }
        setProfiles(profilesData);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch customers.');
      }
    };

    if (franchiseId) fetchCustomers();
  }, [franchiseId]);

  const fetchCustomerProfile = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (userError) console.warn('User Fetch Warning:', userError.message);

      const { data: memberData, error: memberError } = await supabase
        .from('mess_members')
        .select('veg_pref')
        .eq('user_id', userId)
        .single();

      if (memberError) console.warn('Mess Member Fetch Warning:', memberError.message);

      return {
        name: userData?.name || 'Unknown',
        email: userData?.email || 'NA',
        vegPref: memberData?.veg_pref ? 'Veg' : 'Non-Veg',
      };
    } catch (error: any) {
      console.error('Error Fetching Profile:', error.message);
      return {
        name: 'Unknown',
        contact: 'NA',
        vegPref: 'Unknown',
      };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const profile = profiles[item.user_id];

    if (!profile) {
      return <Text style={styles.loadingText}>Loading...</Text>;
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardText}>Name: {profile.name}</Text>
        <Text style={styles.cardText}>Email: {profile.email}</Text>
        <Text style={styles.cardText}>Status: {item.active ? 'Active' : 'Inactive'}</Text>
        <Text style={styles.cardText}>Preference: {profile.vegPref}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../../assets/images/logo.jpg')} // Adjust path if needed
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Centered Title */}
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
    backgroundColor: '#F0FFF8', // light green background
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  logo: {
    width: 120,
    height: 70,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#388E3C',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 4,
  },
  loadingText: {
    textAlign: 'center',
    padding: 10,
    color: '#888',
  },
});
