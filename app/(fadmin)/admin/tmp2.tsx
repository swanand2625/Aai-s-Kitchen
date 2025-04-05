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

  // Fetch QR and attendance whenever selected date changes
  useEffect(() => {
    if (franchiseId) {
      fetchAttendanceAndQR();
    }
  }, [selectedDate, franchiseId]);

  const fetchAttendanceAndQR = async () => {
    const formattedDate = selectedDate.format('YYYY-MM-DD');

    // Fetch QR Codes
    const { data: qrData, error: qrError } = await supabase
      .from('meal_qr_codes')
      .select('meal_type, qr_code')
      .eq('franchise_id', franchiseId)
      .eq('date', formattedDate);

    if (qrError) {
      console.error('QR fetch error:', qrError.message);
    } else if (qrData) {
      const loadedQRCodes: Record<string, string> = {};
      qrData.forEach((item) => {
        loadedQRCodes[item.meal_type] = item.qr_code;
      });
      setQrCodes(loadedQRCodes);
    }

    // Fetch Attendance
    const { data: attendanceData, error: attendanceError } = await supabase
      .from('attendance') // <-- correct table name
      .select('meal_type')
      .eq('franchise_id', franchiseId)
      .eq('date', formattedDate);

    if (attendanceError) {
      console.error('Attendance fetch error:', attendanceError.message);
      setAttendance({ breakfast: 0, lunch: 0, dinner: 0 });
    } else if (attendanceData) {
      // Manually group by meal_type
      const counts: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0 };
      attendanceData.forEach((item) => {
        const mealType = item.meal_type;
        if (mealType && counts.hasOwnProperty(mealType)) {
          counts[mealType]++;
        }
      });
      setAttendance(counts);
    }
  };

  const handleDateChange = (days: number) => {
    setSelectedDate((prev) => prev.clone().add(days, 'days'));
  };

  const handleShowQR = (mealType: string) => {
    if (qrCodes[mealType]) {
      setQrVisible(mealType);
    } else {
      Alert.alert('No QR Code', `No QR code available for ${mealType}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.dateText}>{selectedDate.format('MMMM Do, YYYY')}</Text>

      <View style={styles.buttonRow}>
        <Button text="Previous" onPress={() => handleDateChange(-1)} />
        <Button text="Next" onPress={() => handleDateChange(1)} />
      </View>

      {['breakfast', 'lunch', 'dinner'].map((meal) => (
        <TouchableOpacity
          key={meal}
          style={styles.mealCard}
          onPress={() => handleShowQR(meal)}
        >
          <MaterialCommunityIcons name="food" size={24} color="black" />
          <Text style={styles.mealText}>{meal.toUpperCase()}</Text>
          <Text style={styles.countText}>{attendance[meal]} attendees</Text>
        </TouchableOpacity>
      ))}

      <Modal visible={qrVisible !== null} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.qrContainer}>
            {qrVisible && qrCodes[qrVisible] && (
              <QRCode value={qrCodes[qrVisible]} size={250} />
            )}
            <Button text="Close" onPress={() => setQrVisible(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  dateText: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  mealCard: {
    padding: 20,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  mealText: { fontSize: 18, marginTop: 10 },
  countText: { fontSize: 16, marginTop: 5, color: 'gray' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  qrContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center' },
});