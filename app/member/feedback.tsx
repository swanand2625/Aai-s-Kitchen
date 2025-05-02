import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function FeedbackScreen() {
  const userId = useAuthStore((state) => state.userId);
  const [messMemberId, setMessMemberId] = useState<string | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMessMemberId = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('mess_members')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching mess member ID:', error.message);
      } else {
        setMessMemberId(data.id);
      }
    };

    fetchMessMemberId();
  }, [userId]);

  const submitFeedback = async () => {
    if (!messMemberId) {
      Alert.alert('Error', 'Mess member ID not found.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('feedback').insert([
      {
        mess_member_id: messMemberId,
        meal_type: mealType,
        rating,
        comments,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Submission Failed', error.message);
    } else {
      Alert.alert('Success', 'Thank you for your feedback!');
      setComments('');
      setRating(5);
      setMealType('breakfast');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Give Feedback</Text>

      <Text style={styles.label}>Meal Type</Text>
      <Picker
        selectedValue={mealType}
        onValueChange={(itemValue) => setMealType(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Breakfast" value="breakfast" />
        <Picker.Item label="Lunch" value="lunch" />
        <Picker.Item label="Dinner" value="dinner" />
      </Picker>

      <Text style={styles.label}>Rating (1-5)</Text>
      <TextInput
        style={styles.input}
        value={rating.toString()}
        onChangeText={(text) => setRating(Number(text))}
        keyboardType="numeric"
        maxLength={1}
      />

      <Text style={styles.label}>Comments (optional)</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={comments}
        onChangeText={setComments}
        placeholder="Your thoughts..."
      />

      <TouchableOpacity
        style={[styles.button, loading && { backgroundColor: '#ccc' }]}
        onPress={submitFeedback}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Feedback'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
  },
  picker: {
    backgroundColor: '#eee',
    marginBottom: 16,
    borderRadius: 8,
  },
  input: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
