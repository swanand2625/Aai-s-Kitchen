import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Text, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import dayjs from 'dayjs';

type DashboardItem = {
  title: string;
  icon: React.ReactNode;
  navigateTo: string;
};

type Franchise = {
  name: string;
  address: string;
  contact: string;
};

const dashboardItems: DashboardItem[] = [
  {
    title: 'Profile',
    icon: <Ionicons name="person-circle" size={40} color="#4B9CD3" />,
    navigateTo: 'member/profile',
  },
  {
    title: "Today's Menu",
    icon: <MaterialIcons name="restaurant-menu" size={40} color="#FF8C42" />,
    navigateTo: 'member/menu',
  },
  {
    title: 'Holiday Request',
    icon: <Ionicons name="calendar" size={40} color="#00BFA6" />,
    navigateTo: 'member/holiday',
  },
  {
    title: 'Bill Section',
    icon: <MaterialIcons name="receipt" size={40} color="#FF6363" />,
    navigateTo: 'member/bill',
  },
  {
    title: 'Join Mess',
    icon: <MaterialIcons name="restaurant" size={40} color="#FF6363" />,
    navigateTo: 'member/join_mess',
  },
  {
    title: 'Mark Attendance',
    icon: <MaterialIcons name="check-circle" size={40} color="#4CAF50" />,
    navigateTo: 'member/attendance',
  },
];

export default function TabOneScreen() {
  const navigation = useNavigation();
  const { userId } = useAuthStore();
  const [franchise, setFranchise] = useState<Franchise | null>(null);
  const [planStart, setPlanStart] = useState<string | null>(null);
  const [planEnd, setPlanEnd] = useState<string | null>(null);

  useEffect(() => {
    const fetchFranchise = async () => {
      try {
        const { data, error } = await supabase
          .from('mess_members')
          .select('franchise_id, plan_start, plan_end')
          .eq('user_id', userId)
          .single();

        if (error || !data) {
          Alert.alert('Error', 'No franchise found for this user');
          return;
        }

        setPlanStart(data.plan_start);
        setPlanEnd(data.plan_end);

        const { data: franchiseData, error: franchiseError } = await supabase
          .from('franchises')
          .select('*')
          .eq('id', data.franchise_id)
          .single();

        if (franchiseError || !franchiseData) {
          Alert.alert('Error', 'No franchise details found');
          return;
        }

        setFranchise(franchiseData);
      } catch (err) {
        Alert.alert('Error', 'Failed to fetch franchise data');
      }
    };

    if (userId) {
      fetchFranchise();
    }
  }, [userId]);

  const isPlanExpired = planEnd ? dayjs().isAfter(dayjs(planEnd)) : true;
  const hasPlan = planStart && planEnd && !isPlanExpired;

  const handleBuyPlan = () => {
    navigation.navigate('member/buy_plan' as never);
  };

  const renderItem = ({ item }: { item: DashboardItem }) => {
    console.log('Rendering:', item.title); // Debug log
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate(item.navigateTo as never)}
      >
        <View style={styles.icon}>{item.icon}</View>
        <Text style={styles.cardText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mess Member Dashboard</Text>
      
      {franchise && (
        <View style={styles.franchiseInfo}>
          <Text style={styles.franchiseTitle}>{franchise.name}</Text>
          <Text style={styles.franchiseDetails}>{franchise.address}</Text>
          <Text style={styles.franchiseDetails}>{franchise.contact}</Text>

          {!hasPlan && (
            <>
              {isPlanExpired && (
                <Text style={{ color: 'red', marginTop: 10 }}>
                  Your plan has expired.
                </Text>
              )}
              <TouchableOpacity style={styles.buyPlanButton} onPress={handleBuyPlan}>
                <Text style={styles.buyPlanButtonText}>Buy Plan</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <FlatList
        data={dashboardItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.navigateTo}
        numColumns={2}
        contentContainerStyle={[styles.grid, { paddingBottom: 20 }]} // Ensure space for all items
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
    marginBottom: 20,
    color: '#333',
    alignSelf: 'center',
  },
  franchiseInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
  },
  franchiseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  franchiseDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buyPlanButton: {
    backgroundColor: '#4B9CD3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  buyPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
