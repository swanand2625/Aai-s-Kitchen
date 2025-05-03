import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
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

    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please enter a rating between 1 and 5.');
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Give Feedback</Text>

        <Text style={styles.label}>Meal Type</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={mealType}
            onValueChange={(itemValue) => setMealType(itemValue)}
            style={styles.picker}
            dropdownIconColor="#4CAF50"
          >
            <Picker.Item label="Breakfast" value="breakfast" />
            <Picker.Item label="Lunch" value="lunch" />
            <Picker.Item label="Dinner" value="dinner" />
          </Picker>
        </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 30,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    color: '#333',
  },
  pickerWrapper: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    color: '#000',
  },
  input: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
