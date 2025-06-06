import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import moment from 'moment';
import CalendarStrip from 'react-native-calendar-strip';
import QRCode from 'react-native-qrcode-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['FontSize should be a positive value']);

export default function AttendanceScreen() {
  console.log('Rendering AttendanceScreen...');
 


  const { userId, franchiseId } = useAuthStore();
  console.log(franchiseId);

  const [selectedDate, setSelectedDate] = useState(moment());
  const [attendance, setAttendance] = useState<Record<string, number>>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [qrVisible, setQrVisible] = useState<string | null>(null);

  // Fetch Attendance Data
  useEffect(() => {
    if (!franchiseId) return;

    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from('meal_qr_codes')
        .select('meal_type')
        .eq('franchise_id', franchiseId)
        .eq('date', selectedDate.format('YYYY-MM-DD'));

      if (error) {
        Alert.alert('Error', 'Could not fetch attendance');
        return;
      }

      const attendanceData: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0 };
      data.forEach((item) => {
        if (typeof item === 'object' && 'meal_type' in item) {
          const mealType = item.meal_type as string;
          attendanceData[mealType] = (attendanceData[mealType] || 0) + 1;
        }
      });

      setAttendance(attendanceData);
    };

    fetchAttendance();
  }, [franchiseId, selectedDate]);

  // Generate QR Codes
  const generateQRCodes = async () => {
    if (!franchiseId) {
      Alert.alert('Error', 'Franchise ID not found');
      return;
    }

    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const generatedQRCodes: Record<string, string> = {};
    const qrCodeEntries = mealTypes.map((meal) => {
      const qrString = `QR_${meal.toUpperCase()}_${selectedDate.format('YYYY-MM-DD')}_${franchiseId}`;
      generatedQRCodes[meal] = qrString;
      return {
        franchise_id: franchiseId,
        date: selectedDate.format('YYYY-MM-DD'),
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
    }
  };

  return (
    <View style={styles.container}>
        
      {/* Horizontal Calendar */}
      <CalendarStrip
        style={styles.calendar}
        selectedDate={selectedDate}
        onDateSelected={(date) => setSelectedDate(moment(date))}
        highlightDateNameStyle={{ color: '#4B9CD3' }}
        highlightDateNumberStyle={{ color: '#4B9CD3' }}
        daySelectionAnimation={{ type: 'background', duration: 200, highlightColor: '#E8F0FE' }}
      />

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

      {/* Generate QR Codes Button */}
      <TouchableOpacity style={styles.generateButton} onPress={generateQRCodes}>
        <Text style={styles.buttonText}>Generate QR Codes for {selectedDate.format('YYYY-MM-DD')}</Text>
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F6F8',
  },
  calendar: {
    height: 100,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
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
  generateButton: {
    backgroundColor: '#4B9CD3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontWeight: '700',
    color: '#fff',
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
});
