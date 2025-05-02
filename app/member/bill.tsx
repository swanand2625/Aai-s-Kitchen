import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function Bills() {
  const userId = useAuthStore((state) => state.userId);
  const [loading, setLoading] = useState(true);
  const [baseAmount, setBaseAmount] = useState(2500);
  const [guestMeals, setGuestMeals] = useState<any[]>([]);
  const [snacks, setSnacks] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  const fetchAllBills = async () => {
    setLoading(true);
    if (!userId) return;

    const { data: memberData, error: memberError } = await supabase
      .from('mess_members')
      .select('id')
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle();

    if (memberError || !memberData) {
      console.error('Mess member fetch error:', memberError);
      setLoading(false);
      return;
    }

    const mId = memberData.id;
    setMemberId(mId);

    const { data: gm } = await supabase
      .from('guest_meals')
      .select('price')
      .eq('mess_member_id', mId);

    const { data: es } = await supabase
      .from('evening_snacks')
      .select('price')
      .eq('mess_member_id', mId);

    const { data: ea } = await supabase
      .from('extra_addons')
      .select('price, quantity, item_name')
      .eq('member_id', mId);

    setGuestMeals(gm ?? []);
    setSnacks(es ?? []);
    setAddons(ea ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllBills();
  }, [userId]);

  const calculateTotal = () => {
    const guestTotal = guestMeals.reduce((sum, g) => sum + (parseFloat(g.price) || 0), 0);
    const snackTotal = snacks.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
    const addonTotal = addons.reduce((sum, a) => {
      const price = parseFloat(a.price) || 0;
      const qty = a.quantity || 1;
      return sum + price * qty;
    }, 0);
    return baseAmount + guestTotal + snackTotal + addonTotal;
  };

  if (loading) return <Text style={{ textAlign: 'center', marginTop: 40 }}>Loading bill...</Text>;

  const guestTotal = guestMeals.reduce((sum, g) => sum + (parseFloat(g.price) || 0), 0);
  const snackTotal = snacks.reduce((sum, s) => sum + (parseFloat(s.price) || 0), 0);
  const addonTotal = addons.reduce((sum, a) => {
    const price = parseFloat(a.price) || 0;
    const qty = a.quantity || 1;
    return sum + price * qty;
  }, 0);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🧾 Monthly Bill Receipt</Text>

      {/* Monthly Amount */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Base Mess Fee</Text>
        <View style={styles.row}>
          <Text>Monthly Subscription</Text>
          <Text>₹{baseAmount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Guest Meals */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Guest Meals</Text>
        <View style={styles.row}>
          <Text>Total Guests</Text>
          <Text>{guestMeals.length}</Text>
        </View>
        <View style={styles.row}>
          <Text>Total Cost</Text>
          <Text>₹{guestTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Add-ons */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Extra Add-ons</Text>
        {addons.length === 0 ? (
          <Text style={styles.empty}>No extra add-ons</Text>
        ) : (
          addons.map((item, idx) => (
            <View style={styles.row} key={idx}>
              <Text>{item.item_name} × {item.quantity || 1}</Text>
              <Text>₹{((parseFloat(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</Text>
            </View>
          ))
        )}
        <View style={styles.rowTotal}>
          <Text>Total</Text>
          <Text>₹{addonTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Snacks */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Evening Snacks</Text>
        <View style={styles.row}>
          <Text>Snacks Taken</Text>
          <Text>{snacks.length}</Text>
        </View>
        <View style={styles.row}>
          <Text>Total Cost</Text>
          <Text>₹{snackTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Final Total */}
      <View style={[styles.card, styles.finalCard]}>
        <Text style={styles.finalText}>Total Due: ₹{calculateTotal().toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F9F4',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2C6E49',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#14532d',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 6,
  },
  finalCard: {
    backgroundColor: '#D1FAE5',
  },
  finalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#777',
    marginTop: 4,
  },
});
