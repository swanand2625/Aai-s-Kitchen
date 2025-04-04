import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/providers/useAuthStore';

export default function QRScanner() {
  const { mealType } = useLocalSearchParams<{ mealType: string }>(); 
  const { userId } = useAuthStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync(); // ✅ Fixed function name
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const handleBarCodeScanned = async (event: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const qrCodeValue = event.data;
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: qrData, error: qrError } = await supabase
        .from('meal_qr_codes')
        .select('id, meal_type, franchise_id')
        .eq('qr_code', qrCodeValue)
        .eq('meal_type', mealType)
        .eq('date', today)
        .single();

      if (qrError || !qrData) {
        Alert.alert('Invalid QR Code');
        setScanned(false);
        return;
      }

      if (!userId) {
        Alert.alert('Not logged in');
        return;
      }

      const { data: messMember, error: memberError } = await supabase
        .from('mess_members')
        .select('id, franchise_id')
        .eq('user_id', userId)
        .single();

      if (memberError || !messMember) {
        Alert.alert('Mess member not found');
        return;
      }

      if (messMember.franchise_id !== qrData.franchise_id) {
        Alert.alert('Franchise mismatch ❌');
        return;
      }

      const { error: insertError } = await supabase.from('attendance').insert([
        {
          mess_member_id: messMember.id,
          meal_type: mealType,
          attended: true,
          date: today,
          franchise_id: messMember.franchise_id,
        },
      ]);

      if (insertError) {
        Alert.alert('Attendance already marked or error occurred');
      } else {
        Alert.alert('✅ Attendance marked!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Something went wrong', error.message);
    }

    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Text style={styles.info}>Scan complete</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  info: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    fontSize: 18,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
  },
});
