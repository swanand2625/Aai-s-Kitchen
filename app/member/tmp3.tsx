import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import { Calendar } from 'react-native-calendars';

export default function HolidayRequest() {
  const { userId } = useAuthStore();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [franchiseId, setFranchiseId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const [pastRequests, setPastRequests] = useState<any[]>([]);
  const [holidayCount, setHolidayCount] = useState(0);

  useEffect(() => {
    if (userId) fetchMemberInfo(userId);
  }, [userId]);

  async function fetchMemberInfo(userId: string) {
    const { data, error } = await supabase
      .from('mess_members')
      .select('id, franchise_id')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching member info:', error.message);
    } else {
      setMemberId(data.id);
      setFranchiseId(data.franchise_id);
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
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end dates.');
      return;
    }

    if (holidayCount >= 8) {
      Alert.alert('Holiday Limit Reached', 'You have already taken 8 holidays in this plan.');
      return;
    }

    if (!memberId || !franchiseId) return;

    const { error } = await supabase
      .from('holidays')
      .insert({
        member_id: memberId,
        franchise_id: franchiseId,
        start_date: startDate,
        end_date: endDate,
        status: 'pending'
      });

    if (error) {
      console.error('Error requesting holiday:', error.message);
    } else {
      Alert.alert('Success', 'Holiday requested successfully!');
      fetchPastHolidays(memberId);
      setStartDate(null);
      setEndDate(null);
      setSelectingEnd(false);
    }
  }

  const markedDates = (): any => {
    let marks: any = {};
    if (startDate && endDate) {
      let start = new Date(startDate);
      let end = new Date(endDate);
      while (start <= end) {
        const key = start.toISOString().split('T')[0];
        marks[key] = {
          selected: true,
          color: '#228b22',
          textColor: 'white'
        };
        start.setDate(start.getDate() + 1);
      }
    } else if (startDate) {
      marks[startDate] = {
        selected: true,
        color: '#228b22',
        textColor: 'white'
      };
    }
    return marks;
  };

  const handleDateSelect = (day: any) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setSelectingEnd(true);
    } else if (selectingEnd && day.dateString >= startDate) {
      setEndDate(day.dateString);
    } else {
      Alert.alert('Invalid End Date', 'End date should be after start date.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Holiday Request</Text>

      <Text style={styles.label}>
        {startDate && endDate
          ? `Selected: ${startDate} → ${endDate}`
          : startDate
          ? `Select end date after ${startDate}`
          : 'Select start date'}
      </Text>

      <Calendar
        minDate={new Date().toISOString().split('T')[0]}
        onDayPress={handleDateSelect}
        markedDates={markedDates()}
        markingType="period"
        theme={{
          selectedDayBackgroundColor: '#228b22',
          todayTextColor: 'red',
        }}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 30, marginBottom: 10 },
  label: { fontSize: 16, marginVertical: 10, color: '#555' },
  listItem: { padding: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 }
});
