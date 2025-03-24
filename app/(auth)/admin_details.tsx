import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import { router } from 'expo-router';

export default function AdminDetailsScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const { userId, setUser } = useAuthStore();

  const handleSubmit = async () => {
    if (!name || !contact) {
      Alert.alert('Missing Info', 'Please fill in name and contact');
      return;
    }

    try {
      // 1. Insert into franchises
      const { data: franchise, error: franchiseError } = await supabase
        .from('franchises')
        .insert([{ name, address, contact }])
        .select()
        .single();

      if (franchiseError || !franchise) {
        throw franchiseError;
      }

      // 2. Link to franchise_admins
      const { error: linkError } = await supabase
        .from('franchise_admins')
        .insert([{ user_id: userId, franchise_id: franchise.id }]);

      if (linkError) {
        throw linkError;
      }

      // 3. Update auth store
      setUser(userId!, 'franchise_admin', franchise.id);

      // 4. Redirect to admin dashboard
      router.replace('/(fadmin)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Franchise Details</Text>
      <TextInput placeholder="Franchise Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
      <TextInput placeholder="Contact" value={contact} onChangeText={setContact} style={styles.input} />
      <Button text="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 12,
  },
});
