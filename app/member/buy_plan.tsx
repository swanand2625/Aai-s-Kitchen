import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import dayjs from 'dayjs';

export default function BuyPlanScreen() {
  const { userId } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const plans = [
    { label: 'Monthly Plan', duration: 30 },
    { label: '3-Month Plan', duration: 90 },
  ];

  const handleBuyPlan = async (duration: number) => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(duration, 'day').format('YYYY-MM-DD');

    // Check if user is in mess_members
    const { data: existingMember, error: fetchError } = await supabase
      .from('mess_members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingMember) {
      setLoading(false);
      Alert.alert('Error', 'You need to join a mess before buying a plan');
      return;
    }

    const { error } = await supabase
      .from('mess_members')
      .update({ plan_start: startDate, plan_end: endDate })
      .eq('user_id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to update plan');
    } else {
      Alert.alert('Success', 'Plan purchased successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Your Plan</Text>
      {plans.map((plan, index) => {
        const start = dayjs().format('DD MMM YYYY');
        const end = dayjs().add(plan.duration, 'day').format('DD MMM YYYY');

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.planTitle}>{plan.label}</Text>
            <Text style={styles.planDates}>Start: {start}</Text>
            <Text style={styles.planDates}>End: {end}</Text>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => handleBuyPlan(plan.duration)}
              disabled={loading}
            >
              <Text style={styles.buyButtonText}>
                {loading ? 'Processing...' : 'Buy'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F4F6F8',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  planDates: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  buyButton: {
    backgroundColor: '#4B9CD3',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
