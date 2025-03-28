import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';

const GOOGLE_API_KEY = 'AIzaSyBuV0Nzhsjzt5ftVqMq5jpP3pncBG_6kLs';

type Props = {
  onSelectAddress: (locationData: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
};

type Prediction = {
  description: string;
  place_id: string;
};

export default function AdminAddressInput({ onSelectAddress }: Props) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length > 2) {
        fetchAutocompleteResults(query);
      } else {
        setPredictions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchAutocompleteResults = async (input: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&types=establishment&language=en&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'OK') {
        setPredictions(json.predictions);
      } else {
        console.warn('Autocomplete error:', json.status);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchPlaceDetails = async (placeId: string, description: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === 'OK') {
        const location = json.result.geometry.location;

        setSelectedAddress(description);
        setPredictions([]);
        setQuery(description); // update the input field

        onSelectAddress({
          address: description,
          latitude: location.lat,
          longitude: location.lng,
        });
      } else {
        Alert.alert('Location Error', 'Unable to retrieve location coordinates.');
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Error', 'Something went wrong while fetching place details.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter College/Location</Text>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Start typing college name..."
        autoCapitalize="none"
        autoCorrect={false}
      />
      <FlatList
        data={predictions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => fetchPlaceDetails(item.place_id, item.description)}
            style={styles.suggestion}
          >
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
        style={styles.suggestionList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  suggestionList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    backgroundColor: 'white',
  },
  suggestion: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
