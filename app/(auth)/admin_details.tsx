import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import { router } from 'expo-router';
import AdminAddressInput from '@/components/autocom';

export default function AdminDetailsScreen() {
  const [franchise, setFranchise] = useState<{
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  }>({
    name: '',
    address: '',
    latitude: null,
    longitude: null,
  });

  const [contact, setContact] = useState('');

  const { userId, setUser } = useAuthStore();

  const handleSubmit = async () => {
    const { name, address, latitude, longitude } = franchise;

    if (!name || !contact || !address) {
      Alert.alert('Missing Info', 'Please fill in all required fields');
      return;
    }

    try {
      // Insert into franchises
      const { data: insertedFranchise, error: franchiseError } = await supabase
        .from('franchises')
        .insert([{ name, address, contact, latitude, longitude }])
        .select()
        .single();

      if (franchiseError || !insertedFranchise) {
        throw franchiseError;
      }

      // Link to franchise_admins
      const { error: linkError } = await supabase
        .from('franchise_admins')
        .insert([{ user_id: userId, franchise_id: insertedFranchise.id }]);

      if (linkError) {
        throw linkError;
      }

      // Update auth store and redirect
      setUser(userId!, 'franchise_admin', insertedFranchise.id);
      router.replace('/(fadmin)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Franchise Details</Text>

      <TextInput
        placeholder="Franchise Name"
        value={franchise.name}
        onChangeText={(text) => setFranchise({ ...franchise, name: text })}
        style={styles.input}
      />

      <View style={styles.addressInputWrapper}>
        <AdminAddressInput
          onSelectAddress={(locationData: { address: string; latitude: number; longitude: number }) => {
            setFranchise((prev) => ({
              ...prev,
              address: locationData.address,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            }));
          }}
        />
      </View>

      {/* Contact input moved to the bottom */}
      <View style={styles.footer}>
        <TextInput
          placeholder="Contact"
          value={contact}
          onChangeText={setContact}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <Button text="Submit" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addressInputWrapper: {
    marginBottom: 16,
    zIndex: 2,
  },
  footer: {
    marginTop: 'auto', // Pushes Contact and Submit to the bottom
  },
});
