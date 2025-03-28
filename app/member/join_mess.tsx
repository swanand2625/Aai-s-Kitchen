import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Text, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase';

export default function JoinMessScreen() {
  const [city, setCity] = useState('');
  const [franchises, setFranchises] = useState<any[]>([]);
  const [filteredFranchises, setFilteredFranchises] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchFranchises = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('franchises').select('*');

    if (error) {
      console.error(error);
    } else {
      setFranchises(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  const handleCitySearch = () => {
    const results = franchises.filter((franchise) =>
      franchise.city?.toLowerCase().includes(city.toLowerCase())
    );
    setFilteredFranchises(results);
    Keyboard.dismiss();
  };
  

  const allPlaces = Array.from(new Set(franchises.map(f => f.city)));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Search City</Text>
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Enter city name"
        style={styles.input}
        onSubmitEditing={handleCitySearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
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
              description={franchise.address}
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
            const matched = franchises.filter((f) => f.city === itemValue);
            setFilteredFranchises(matched);
          }}
        >
          <Picker.Item label="Select a city" value="" />
          {allPlaces.map((place) => (
            <Picker.Item key={place} label={place} value={place} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  map: {
    height: 250,
    borderRadius: 12,
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
