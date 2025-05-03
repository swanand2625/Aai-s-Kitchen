import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
  Keyboard,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';
import { useAuthStore } from '@/providers/useAuthStore';
import { router } from 'expo-router';

export default function JoinMessScreen() {
  const [searchText, setSearchText] = useState('');
  const [franchises, setFranchises] = useState<any[]>([]);
  const [filteredFranchises, setFilteredFranchises] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = useAuthStore((state) => state.userId);

  const fetchFranchises = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('franchises').select('*');
    if (error) {
      console.error(error);
    } else {
      setFranchises(data);
      setFilteredFranchises(data); // show all initially
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  const handleSearch = () => {
    const results = franchises.filter((franchise) =>
      franchise.address?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredFranchises(results);
    Keyboard.dismiss();
  };

  const extractPlaceFromAddress = (address: string): string => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[parts.length - 3]?.trim() || '';
  };

  const allPlaces = Array.from(
    new Set(
      franchises
        .map((f) => extractPlaceFromAddress(f.address))
        .filter((place) => place !== '')
    )
  );

  const joinMess = async () => {
    if (!selectedFranchise) {
      Alert.alert('Error', 'Please select a mess/franchise before joining.');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User is not authenticated.');
      return;
    }

    const { error } = await supabase.from('mess_members').insert([
      {
        user_id: userId,
        franchise_id: selectedFranchise.id,
        veg_pref: true,
        active: true,
      },
    ]);

    if (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to join the mess.');
    } else {
      Alert.alert('Success', `You have successfully joined "${selectedFranchise.name}"`);
      router.push('/(user)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/logo.jpg')} style={styles.logo} />
          </View>

          <Text style={styles.label}>Search by Address</Text>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Start typing any part of address..."
            style={styles.input}
            onSubmitEditing={handleSearch}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#66BB6A" />
          ) : (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: filteredFranchises[0]?.latitude || 20.5937,
                longitude: filteredFranchises[0]?.longitude || 78.9629,
                latitudeDelta: 5,
                longitudeDelta: 5,
              }}
            >
              {filteredFranchises.map((franchise) => (
                <Marker
                  key={franchise.id}
                  coordinate={{
                    latitude: franchise.latitude,
                    longitude: franchise.longitude,
                  }}
                  title={franchise.name}
                  description={`Address: ${franchise.address}\nContact: ${franchise.contact}`}
                  onPress={() => setSelectedFranchise(franchise)}
                />
              ))}
            </MapView>
          )}

          <Text style={styles.label}>Or Select a Place</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPlace}
              onValueChange={(itemValue) => {
                setSelectedPlace(itemValue);
                const matched = franchises.filter(
                  (f) => extractPlaceFromAddress(f.address) === itemValue
                );
                setFilteredFranchises(matched);
                setSelectedFranchise(null);
              }}
            >
              <Picker.Item label="Select a place" value="" />
              {allPlaces.map((place, index) => (
                <Picker.Item key={`${place}-${index}`} label={place} value={place} />
              ))}
            </Picker>
          </View>

          {selectedFranchise && (
            <View style={styles.selectedInfo}>
              <Text style={styles.label}>Selected Mess</Text>
              <Text style={styles.selectedText}>{selectedFranchise.name}</Text>
              <Text style={styles.selectedText}>{selectedFranchise.address}</Text>
            </View>
          )}

          <Button text="Join Mess" onPress={joinMess} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#f9fff9',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
    borderColor: '#66BB6A', // Green color
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  map: {
    height: 250,
    borderRadius: 16,
    marginVertical: 16,
    borderColor: '#66BB6A', // Green border color
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#66BB6A', // Green text color
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#66BB6A', // Green border color
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedInfo: {
    marginVertical: 16,
    padding: 14,
    backgroundColor: '#E8F5E9', // Light green background
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A', // Green border color
  },
  selectedText: {
    fontSize: 15,
    color: '#66BB6A', // Green text color
    marginTop: 6,
  },
});
