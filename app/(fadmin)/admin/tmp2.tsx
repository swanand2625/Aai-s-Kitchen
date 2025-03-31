import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import moment from 'moment';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '@/components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AttendanceScreen() {

  
  
  const { franchiseId } = useAuthStore();
 
  const [selectedDate, setSelectedDate] = useState(moment());
  const [attendance, setAttendance] = useState<Record<string, number>>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [qrVisible, setQrVisible] = useState<string | null>(null);
  
const handleQR = async () => {
  if (!franchiseId) {
    Alert.alert('Error', 'Franchise ID not found');
    return;
  }

  const formattedDate = selectedDate.format('YYYY-MM-DD');

  // Check if QR codes were already generated for this date
  const lastGeneratedDate = await AsyncStorage.getItem('last_qr_generated_date');
  if (lastGeneratedDate === formattedDate) {
    Alert.alert('QR Code', 'QR codes have already been generated for today.');
    return;
  }

  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const generatedQRCodes = {};
  const qrCodeEntries = mealTypes.map((meal) => {
    const qrString = `QR_${meal.toUpperCase()}_${formattedDate}_${franchiseId}`;
    generatedQRCodes[meal] = qrString;
    return {
      franchise_id: franchiseId,
      date: formattedDate,
      meal_type: meal,
      qr_code: qrString,
    };
  });

  const { error } = await supabase.from('meal_qr_codes').insert(qrCodeEntries);

  if (error) {
    Alert.alert('Error', 'Failed to generate QR codes');
  } else {
    setQrCodes(generatedQRCodes);
    Alert.alert('Success', 'QR codes generated successfully!');

    // Store the generated date in AsyncStorage to disable the button
    await AsyncStorage.setItem('last_qr_generated_date', formattedDate);
    setQrGenerated(true); // Disable button
  }
};

// State to track button disable status
const [qrGenerated, setQrGenerated] = useState(false);

// Check if QR was already generated today on mount
useEffect(() => {
  const checkLastGeneratedDate = async () => {
    const lastGeneratedDate = await AsyncStorage.getItem('last_qr_generated_date');
    const today = moment().format('YYYY-MM-DD');

    setQrGenerated(lastGeneratedDate === today); // Disable if already generated today
  };

  checkLastGeneratedDate();
}, [selectedDate]);


  // Fetch Attendance Data from Supabase
  useEffect(() => {
    if (!franchiseId) return;

    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from('meal_qr_codes')
        .select('meal_type, qr_code')
        .eq('franchise_id', franchiseId)
        .eq('date', selectedDate.format('YYYY-MM-DD'));

      if (error) {
        Alert.alert('Error', 'Could not fetch attendance');
        return;
      }

      const attendanceData: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0 };
      const qrCodeData: Record<string, string> = {};

      data.forEach((item) => {
        if (typeof item === 'object' && 'meal_type' in item && 'qr_code' in item) {
          const mealType = item.meal_type as string;
          attendanceData[mealType] = (attendanceData[mealType] || 0) + 1;
          qrCodeData[mealType] = item.qr_code;
        }
      });

      setAttendance(attendanceData);
      setQrCodes(qrCodeData);
    };

    fetchAttendance();
  }, [franchiseId, selectedDate]);

  return (
    <View style={styles.container}>

      {/* Custom Horizontal Date Picker */}
      <View style={styles.datePickerContainer}>
        {[...Array(7)].map((_, index) => {
          const date = moment().subtract(3, 'days').add(index, 'days'); // 3 days before & 3 days after today
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate.isSame(date, 'day') && styles.selectedDateButton,
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={styles.dateText}>{date.format('DD')}</Text>
              <Text style={styles.dayText}>{date.format('ddd')}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Attendance Sections */}
      <View style={styles.attendanceContainer}>
        {['breakfast', 'lunch', 'dinner'].map((meal) => (
          <View key={meal} style={styles.attendanceCard}>
            <Text style={styles.header}>{meal.toUpperCase()}</Text>
            <Text style={styles.paragraph}>Total Attendees: {attendance[meal] ?? 0}</Text>

            {/* Eye Icon to Show QR Code */}
            {qrCodes[meal] && (
              <TouchableOpacity onPress={() => setQrVisible(meal)}>
                <MaterialCommunityIcons name="eye" size={24} color="#4B9CD3" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* QR Code Modal */}
      {qrVisible && (
        <Modal transparent={true} animationType="slide" visible={!!qrVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.header}>{qrVisible.toUpperCase()} QR Code</Text>
              <QRCode value={qrCodes[qrVisible]} size={200} />
              <TouchableOpacity style={styles.closeButton} onPress={() => setQrVisible(null)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <Button text="Generate QR" onPress={handleQR}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F6F8',
  },
  attendanceContainer: {
    flex: 1,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontWeight: '700',
    color: '#333',
  },
  paragraph: {
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4B9CD3',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: '700',
    color: '#fff',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#E8F0FE',
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#4B9CD3',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayText: {
    fontSize: 12,
    color: '#555',
  },
});

