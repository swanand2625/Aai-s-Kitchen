import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';

export default function AuthIndexScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
      return;
    }

    const userId = data.user.id;

    // Fetch user info from `users` table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      Alert.alert('Error', 'No user profile found');
      return;
    }

    const role = userProfile.role;

    // Now based on role
    if (role === 'franchise_admin') {
      // Check if franchise_admin has filled details
      const { data: franchiseAdmin, error: franchiseError } = await supabase
        .from('franchise_admins')
        .select('franchise_id')
        .eq('user_id', userId)
        .single();

      if (franchiseError || !franchiseAdmin?.franchise_id) {
        // Franchise admin has NOT filled details yet
        setUser(userId, role, null);
        router.replace('/(auth)/admin_details');
      } else {
        // Franchise admin already linked to franchise
        setUser(userId, role, franchiseAdmin.franchise_id);
        router.replace('/(fadmin)');
      }
    } else if (role === 'mess_member') {
      // Add your mess member logic here
      // router.replace('/(member)/home');
    } else if (role === 'super_admin') {
      // router.replace('/(super)/dashboard');
    } else {
      Alert.alert('Error', 'Unknown user role');
    }
  };

  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button text="Sign In" onPress={handleSignIn} />
      <View style={{ marginTop: 10 }} />
      <Button text="Sign Up as Member" onPress={handleSignUp} />
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
