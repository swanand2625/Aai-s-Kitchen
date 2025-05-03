import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Text, Alert, Image } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import dayjs from 'dayjs';

const logo = require('../../assets/images/logo.jpg'); // ✅ Logo path

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
    navigateTo: 'member/tmp3',
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
    title: 'Guest Request',
    icon: <Ionicons name="person" size={40} color="#00BFA6" />,
    navigateTo: 'member/guestreq',
  },
  {
    title: 'Mark Attendance',
    icon: <MaterialIcons name="check-circle" size={40} color="#4CAF50" />,
    navigateTo: 'member/attendance',
  },
  {
    title: 'Feedback Book',
    icon: <MaterialIcons name="event" size={40} color="#4CAF50" />,
    navigateTo: 'member/feedback',
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
      {/* ✅ LOGO SECTION */}
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.header}>Mess Member Dashboard</Text>

      {franchise && (
        <View style={styles.franchiseInfo}>
          <Text style={styles.franchiseTitle}>{franchise.name}</Text>

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
        contentContainerStyle={[styles.grid, { paddingBottom: 20 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F0FFF8',
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    height: 70,
    width: 200,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 20,
  },
  franchiseInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    elevation: 5,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  franchiseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  buyPlanButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
    elevation: 3,
  },
  buyPlanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 8,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 5,
  },
  icon: {
    marginBottom: 10,
  },
});
