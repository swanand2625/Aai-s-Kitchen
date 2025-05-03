import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
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
  const [qrGenerated, setQrGenerated] = useState(false);

  const fetchTotalAttendees = async () => {
    if (!franchiseId) return;

    const formattedDate = selectedDate.format('YYYY-MM-DD');
    const { data, error } = await supabase
      .from('attendance')
      .select('meal_type')
      .eq('franchise_id', franchiseId)
      .eq('date', formattedDate);

    if (error) {
      console.error('Error fetching total attendees:', error);
      return;
    }

    const newAttendance: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0 };
    data.forEach((item) => {
      if (item.meal_type in newAttendance) {
        newAttendance[item.meal_type]++;
      }
    });
    setAttendance(newAttendance);
  };

  const handleQR = async () => {
    if (!franchiseId) {
      Alert.alert('Error', 'Franchise ID not found');
      return;
    }

    const formattedDate = selectedDate.format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');

    if (formattedDate > today) {
      Alert.alert('Invalid Date', 'Cannot generate QR for future dates.');
      return;
    }

    const { data: existingQRCodes, error: fetchError } = await supabase
      .from('meal_qr_codes')
      .select('*')
      .eq('franchise_id', franchiseId)
      .eq('date', formattedDate);

    if (fetchError) {
      Alert.alert('Error', 'Failed to check existing QR codes.');
      return;
    }

    if (existingQRCodes && existingQRCodes.length > 0) {
      Alert.alert('QR Code', 'QR codes have already been generated for this date.');
      setQrCodes(
        existingQRCodes.reduce((acc, qr) => {
          acc[qr.meal_type] = qr.qr_code;
          return acc;
        }, {})
      );
      setQrGenerated(true);
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

    const { error: insertError } = await supabase
      .from('meal_qr_codes')
      .insert(qrCodeEntries);

    if (insertError) {
      Alert.alert('Error', 'Failed to generate QR codes');
    } else {
      setQrCodes(generatedQRCodes);
      Alert.alert('Success', 'QR codes generated successfully!');
      await AsyncStorage.setItem('last_qr_generated_date', formattedDate);
      setQrGenerated(true);
    }
  };

  useEffect(() => {
    const checkLastGeneratedDate = async () => {
      const lastGeneratedDate = await AsyncStorage.getItem('last_qr_generated_date');
      const today = moment().format('YYYY-MM-DD');
      setQrGenerated(lastGeneratedDate === today);
    };
    checkLastGeneratedDate();
  }, []);

  useEffect(() => {
    fetchTotalAttendees();
  }, [selectedDate, franchiseId]);

  useEffect(() => {
    if (!franchiseId) return;

    const fetchQrCodes = async () => {
      const { data, error } = await supabase
        .from('meal_qr_codes')
        .select('meal_type, qr_code')
        .eq('franchise_id', franchiseId)
        .eq('date', selectedDate.format('YYYY-MM-DD'));

      if (error) {
        Alert.alert('Error', 'Could not fetch QR codes');
        return;
      }

      const qrCodeData: Record<string, string> = {};
      data.forEach((item) => {
        if (typeof item === 'object' && 'meal_type' in item && 'qr_code' in item) {
          const mealType = item.meal_type as string;
          qrCodeData[mealType] = item.qr_code;
        }
      });
      setQrCodes(qrCodeData);
      setQrGenerated(data && data.length > 0);
    };

    fetchQrCodes();
  }, [franchiseId, selectedDate]);

  const generateButtonText = qrGenerated ? 'Already Generated' : 'Generate QR';

  return (
    <ScrollView style={styles.container}>
      {/* App Header */}
      <View style={styles.headerContainer}>
        <Image source={require('../../../assets/images/logo.jpg')} style={styles.logo} />
        <Text style={styles.title}>Attendance & QR Manager</Text>
      </View>

      {/* Date Picker */}
      <View style={styles.datePickerContainer}>
        {[...Array(7)].map((_, index) => {
          const date = moment().subtract(3, 'days').add(index, 'days');
          const isSelected = selectedDate.isSame(date, 'day');
          return (
            <TouchableOpacity
              key={index}
              style={[styles.dateButton, isSelected && styles.selectedDateButton]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {date.format('DD')}
              </Text>
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {date.format('ddd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Attendance Cards */}
      <View style={styles.attendanceContainer}>
        {['breakfast', 'lunch', 'dinner'].map((meal) => (
          <View key={meal} style={styles.attendanceCard}>
            <View>
              <Text style={styles.header}>{meal.toUpperCase()}</Text>
              <Text style={styles.paragraph}>Total Attendees: {attendance[meal] ?? 0}</Text>
            </View>
            {qrCodes[meal] && (
              <TouchableOpacity onPress={() => setQrVisible(meal)}>
                <MaterialCommunityIcons name="eye" size={26} color="#2E7D32" />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* QR Modal */}
      {qrVisible && (
        <Modal transparent animationType="slide" visible={!!qrVisible}>
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

      {/* QR Button */}
      <Button
        text={generateButtonText}
        onPress={handleQR}
        disabled={qrGenerated || selectedDate.isAfter(moment(), 'day')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#F1F8E9',
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#4CAF50',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  dayText: {
    fontSize: 12,
    color: '#777',
  },
  selectedDayText: {
    color: '#fff',
  },
  attendanceContainer: {
    flex: 1,
    marginBottom: 20,
  },
  attendanceCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B4B4B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 16,
  },
});
