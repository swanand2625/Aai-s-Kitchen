import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import { Picker } from '@react-native-picker/picker';

export default function GuestRequestScreen() {
  const userId = useAuthStore((state) => state.userId);
  const [guestName, setGuestName] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [date, setDate] = useState(new Date());
  const [numGuests, setNumGuests] = useState('1');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [messMemberId, setMessMemberId] = useState('');
  const [franchiseId, setFranchiseId] = useState('');

  useEffect(() => {
    const fetchIds = async () => {
      const { data, error } = await supabase
        .from('mess_members')
        .select('id, franchise_id')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        Alert.alert('Error', 'Unable to fetch mess member info.');
        return;
      }

      setMessMemberId(data.id);
      setFranchiseId(data.franchise_id);
    };

    fetchIds();
  }, [userId]);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const submitRequest = async () => {
    if (!guestName.trim() || !mealType || !date || !numGuests) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    const now = new Date();
    const fiveHoursLater = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    if (date < fiveHoursLater) {
      Alert.alert('Invalid Date', 'Guest meal date and time must be at least 5 hours from now.');
      return;
    }

    const pricePerMeal = 50;
    const totalPrice = pricePerMeal * parseInt(numGuests);

    const guestsToInsert = {
      mess_member_id: messMemberId,
      franchise_id: franchiseId,
      guest_name: guestName.trim(),
      meal_type: mealType.toLowerCase(),
      date: date,
      price: totalPrice,
      no_of_person: parseInt(numGuests),
    };

    const { error } = await supabase.from('guest_meals').insert(guestsToInsert);

    if (error) {
      Alert.alert('Error', 'Failed to submit guest meal request.');
      console.error(error);
    } else {
      Alert.alert('Success', 'Guest meal request submitted.');
      setGuestName('');
      setNumGuests('1');
      setMealType('lunch');
      setDate(new Date());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Request Guest Meal</Text>

      <Text style={styles.label}>Guest Name</Text>
      <TextInput
        style={styles.input}
        value={guestName}
        onChangeText={setGuestName}
        placeholder="Enter guest name"
      />

      <Text style={styles.label}>Meal Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={mealType} onValueChange={(itemValue) => setMealType(itemValue)}>
          <Picker.Item label="Breakfast" value="breakfast" />
          <Picker.Item label="Lunch" value="lunch" />
          <Picker.Item label="Dinner" value="dinner" />
        </Picker>
      </View>

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
      )}

      <Text style={styles.label}>Number of Guests</Text>
      <TextInput
        style={styles.input}
        value={numGuests}
        onChangeText={setNumGuests}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Price (₹)</Text>
      <TextInput
        style={styles.input}
        value={(parseInt(numGuests) * 50).toString()}
        editable={false}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit Request" color="#4CAF50" onPress={submitRequest} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
  },
});
