import { View, Text, FlatList, StyleSheet, ActivityIndicator, ScrollView, Pressable, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import dayjs from 'dayjs';

export default function FranchiseFeedbackScreen() {
  const userId = useAuthStore((state) => state.userId);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);

      const { data: adminData, error: adminError } = await supabase
        .from('franchise_admins')
        .select('franchise_id')
        .eq('user_id', userId)
        .single();

      if (adminError || !adminData) {
        console.error('Error fetching franchise admin:', adminError);
        setLoading(false);
        return;
      }

      const franchiseId = adminData.franchise_id;

      const { data: membersData, error: membersError } = await supabase
        .from('mess_members')
        .select('id, user_id')
        .eq('franchise_id', franchiseId);

      if (membersError || !membersData) {
        console.error('Error fetching mess members:', membersError);
        setLoading(false);
        return;
      }

      const messMemberIds = membersData.map((member) => member.id);

      if (messMemberIds.length === 0) {
        setFeedbacks([]);
        setFilteredFeedbacks([]);
        setLoading(false);
        return;
      }

      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          id,
          meal_type,
          rating,
          comments,
          date,
          mess_members (
            user_id,
            users (
              name
            )
          )
        `)
        .in('mess_member_id', messMemberIds)
        .order('date', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedbacks:', feedbackError);
        setLoading(false);
        return;
      }

      const transformed = feedbackData.map((fb) => ({
        id: fb.id,
        meal_type: fb.meal_type,
        rating: fb.rating,
        comments: fb.comments,
        date: fb.date,
        userName: fb.mess_members?.users?.name || 'Unknown',
      }));

      setFeedbacks(transformed);
      setLoading(false);
    };

    fetchFeedbacks();
  }, [userId]);

  useEffect(() => {
    const filtered = feedbacks.filter((fb) => fb.date === selectedDate);
    setFilteredFeedbacks(filtered);
  }, [selectedDate, feedbacks]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.info}>Meal: {item.meal_type}</Text>
      <Text style={styles.info}>Rating: {item.rating} ⭐</Text>
      <Text style={styles.info}>Date: {item.date}</Text>
      {item.comments && <Text style={styles.comments}>“{item.comments}”</Text>}
    </View>
  );

  const renderCalendar = () => {
    const days = [];
    const today = dayjs();

    for (let i = 6; i >= 0; i--) {
      const date = today.subtract(i, 'day');
      const formatted = date.format('YYYY-MM-DD');
      days.push(
        <Pressable
          key={formatted}
          style={[
            styles.dateButton,
            selectedDate === formatted && styles.dateButtonSelected,
          ]}
          onPress={() => setSelectedDate(formatted)}
        >
          <Text
            style={[
              styles.dateText,
              selectedDate === formatted && styles.dateTextSelected,
            ]}
          >
            {date.format('DD')}
          </Text>
          <Text
            style={[
              styles.dayText,
              selectedDate === formatted && styles.dateTextSelected,
            ]}
          >
            {date.format('ddd')}
          </Text>
        </Pressable>
      );
    }

    return <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendar}>{days}</ScrollView>;
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

      <Text style={styles.title}>Feedback Book</Text>
      {renderCalendar()}

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />
      ) : filteredFeedbacks.length === 0 ? (
        <Text style={styles.noFeedback}>No feedback for this day.</Text>
      ) : (
        <FlatList
          data={filteredFeedbacks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 120,
    height: 70,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2e7d32',
  },
  calendar: {
    flexGrow: 0,
    marginBottom: 12,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    width: 60,
  },
  dateButtonSelected: {
    backgroundColor: '#4CAF50',
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    fontSize: 12,
    color: '#555',
  },
  dateTextSelected: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    color: '#1b5e20',
  },
  info: {
    fontSize: 14,
    color: '#333',
  },
  comments: {
    fontStyle: 'italic',
    color: '#555',
    marginTop: 6,
  },
  noFeedback: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});
