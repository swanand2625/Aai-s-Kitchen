import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import Button from '@/components/Button'; // Replace with your actual Button component

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Signup Error', error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      Alert.alert('Signup Error', 'No user ID returned');
      return;
    }

    // 2. Insert into your `users` table with role='mess_member'
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: userId,
        name,
        email,
        password, // ⚠️ Note: don't store plaintext passwords in real apps!
        role: 'mess_member',
      },
    ]);

    if (insertError) {
      Alert.alert('DB Error', insertError.message);
      return;
    }

    // 3. Navigate to /user
    router.replace('/(user)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button text="Sign Up" onPress={handleSignup} />
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
    fontSize: 24,
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
});
