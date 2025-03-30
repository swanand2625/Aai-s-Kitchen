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
  
    try {
      // ✅ Sign in with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (signInError || !signInData?.user) {
        Alert.alert('Login Failed', signInError?.message || 'Unable to login');
        return;
      }
  
      const userId = signInData.user.id;
  
      // ✅ Fetch user role from your `users` table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
  
      if (profileError || !userProfile) {
        Alert.alert('Error', 'User profile not found');
        return;
      }
  
      const role = userProfile.role;
  
      // ✅ Role-based logic
      if (role === 'franchise_admin') {
        const { data: franchiseAdmin, error: franchiseError } = await supabase
          .from('franchise_admins')
          .select('franchise_id')
          .eq('user_id', userId)
          .single();
  
        if (franchiseError || !franchiseAdmin?.franchise_id) {
          setUser(userId, role, null); // Not linked yet
          router.replace('/(auth)/admin_details');
        } else {
          setUser(userId, role, franchiseAdmin.franchise_id); // Linked
          router.replace('/(fadmin)');
        }
  
      } else if (role === 'mess_member') {
        setUser(userId, role);
        router.replace('/(user)');
  
      } else if (role === 'super_admin') {
        setUser(userId, role);
       // router.replace('/(super)/dashboard');
  
      } else {
        Alert.alert('Error', 'Unknown user role');
      }
  
    } catch (err: any) {
      Alert.alert('Unexpected Error', err.message || 'Something went wrong');
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
