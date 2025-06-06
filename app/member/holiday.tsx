import { View, Text, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
//import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function HolidayRequest() {
  const { userId } = useAuthStore();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [startHoliday, setStartHoliday] = useState<Date | null>(null);
  const [endHoliday, setEndHoliday] = useState<Date | null>(null);

  const [isStartPickerVisible, setStartPickerVisibility] = useState(false);
  const [isEndPickerVisible, setEndPickerVisibility] = useState(false);

  const [pastRequests, setPastRequests] = useState<any[]>([]);
  const [holidayCount, setHolidayCount] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchMemberInfo(userId);
    }
  }, [userId]);

  async function fetchMemberInfo(userId: string) {
    const { data, error } = await supabase
      .from('mess_members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching member info:', error.message);
    } else {
      setMemberId(data.id);
      fetchPastHolidays(data.id);
    }
  }

  async function fetchPastHolidays(memberId: string) {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('member_id', memberId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching past holidays:', error.message);
    } else {
      setPastRequests(data || []);
      calculateHolidayCount(data || []);
    }
  }

  function calculateHolidayCount(holidays: any[]) {
    const approvedHolidays = holidays.filter(h => h.status === 'approved');
    setHolidayCount(approvedHolidays.length);
  }

  async function requestHoliday() {
    if (!startHoliday || !endHoliday) {
      Alert.alert('Error', 'Please select both start and end dates.');
      return;
    }

    if (holidayCount >= 8) {
      Alert.alert('Holiday Limit Reached', 'You have already taken 8 holidays in this plan.');
      return;
    }

    if (!memberId) return;

    const { error } = await supabase
      .from('holidays')
      .insert({
        member_id: memberId,
        start_date: startHoliday,
        end_date: endHoliday,
        status: 'pending'
      });

    if (error) {
      console.error('Error requesting holiday:', error.message);
    } else {
      Alert.alert('Success', 'Holiday requested successfully!');
      fetchPastHolidays(memberId);
      setStartHoliday(null);
      setEndHoliday(null);
    }
  }

  const today = new Date();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Holiday Request</Text>

      <TouchableOpacity onPress={() => setStartPickerVisibility(true)} style={styles.dateButton}>
        <Text>{startHoliday ? startHoliday.toDateString() : 'Select Start Date'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEndPickerVisibility(true)} style={styles.dateButton}>
        <Text>{endHoliday ? endHoliday.toDateString() : 'Select End Date'}</Text>
      </TouchableOpacity>

      <Button title="Request Holiday" onPress={requestHoliday} />

      <Text style={styles.subtitle}>Past Requests</Text>
      <FlatList
        data={pastRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.start_date} → {item.end_date}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
      />

      <DateTimePickerModal
        isVisible={isStartPickerVisible}
        mode="date"
        minimumDate={today}
        onConfirm={(date) => {
          setStartHoliday(date);
          setStartPickerVisibility(false);
        }}
        onCancel={() => setStartPickerVisibility(false)}
      />

      <DateTimePickerModal
        isVisible={isEndPickerVisible}
        mode="date"
        minimumDate={startHoliday || today}
        onConfirm={(date) => {
          setEndHoliday(date);
          setEndPickerVisibility(false);
        }}
        onCancel={() => setEndPickerVisibility(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff'
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 20
  },
  subtitle: {
    fontSize: 18, fontWeight: '600', marginTop: 30, marginBottom: 10
  },
  dateButton: {
    padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 10, alignItems: 'center'
  },
  listItem: {
    padding: 10, borderBottomColor: '#ccc', borderBottomWidth: 1
  }
});
