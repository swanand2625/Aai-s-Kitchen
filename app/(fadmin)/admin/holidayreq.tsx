import { View, Text, StyleSheet, FlatList, Button, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function FranchiseHolidayRequests() {
  const { franchiseId } = useAuthStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (franchiseId) {
      fetchHolidayRequests();
    }
  }, [franchiseId]);

  async function fetchHolidayRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from('holidays')
      .select(`
        id,
        member_id,
        start_date,
        end_date,
        status,
        requested_at,
        mess_members (
          user_id,
          users (
            name
          )
        )
      `)
      .eq('franchise_id', franchiseId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching holiday requests:', error.message);
    } else {
      setRequests(data || []);
    }

    setLoading(false);
  }

  async function updateStatus(id: number, newStatus: string) {
    const { error } = await supabase
      .from('holidays')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Updated', `Holiday marked as ${newStatus}`);
      fetchHolidayRequests();
    }
  }

  const renderItem = ({ item }: any) => {
    const name = item.mess_members?.users?.name || 'Unknown';

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{item.start_date} → {item.end_date}</Text>
        <Text>Status: {item.status}</Text>

        <View style={styles.buttonRow}>
          <Button title="Approve" color="#228b22" onPress={() => updateStatus(item.id, 'approved')} />
          <Button title="Reject" color="#cc0000" onPress={() => updateStatus(item.id, 'rejected')} />
          <Button title="Pending" color="#999999" onPress={() => updateStatus(item.id, 'pending')} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../../assets/images/logo.jpg')} // Path kept as requested
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Holiday Requests</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No holiday requests yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 8,
  },
  name: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  date: { fontSize: 14, color: '#555', marginBottom: 4 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 70,
  },
});
