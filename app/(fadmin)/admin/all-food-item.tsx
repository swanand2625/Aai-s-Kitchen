import {
  View,
  TextInput,
  Button,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import 'react-native-url-polyfill/auto'; // Needed for Supabase
import { supabase } from '@/lib/supabase';

export default function AddFood() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [veg_type, setvegType] = useState('veg'); // ✅ Default is 'veg'
  const [category, setCategory] = useState('main');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  // 🔐 Fetch the authenticated user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Auth Error:', error);
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []);

  // 📸 Pick Image from Gallery
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // 🚀 Upload Image to Supabase
  const uploadImage = async (fileUri: string, fileName: string) => {
    if (!user) {
      Alert.alert('Unauthorized', 'You must be logged in to upload images.');
      return null;
    }

    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('food.images')
        .upload(`user_${user.id}/${fileName}`, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload Error:', error);
        Alert.alert('Upload Error', error.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('food.images')
        .getPublicUrl(`user_${user.id}/${fileName}`);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Unexpected Upload Error:', error);
      Alert.alert('Error uploading', error.message || 'Unknown error');
      return null;
    }
  };

  // 🛒 Handle Food Item Submission
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Unauthorized', 'You must be logged in to add food items.');
      return;
    }

    if (!name || !price || !image) {
      Alert.alert('Please fill all fields and select an image.');
      return;
    }

    try {
      setUploading(true);

      const fileUri = image.uri;
      const fileExt = fileUri.split('.').pop();
      const fileName = `${name}-${Date.now()}.${fileExt}`;

      // ✅ Upload Image & Get Public URL
      const imageUrl = await uploadImage(fileUri, fileName);
      if (!imageUrl) {
        console.error('⛔ Image upload failed.');
        Alert.alert('⛔ Image upload failed.');
        return;
      }

      // ✅ Insert Food Item in Database
      const { data: insertData, error: insertError } = await supabase
        .from('food_items')
        .insert([
          {
            name,
            category,
            price: parseFloat(price),
            image_url: imageUrl,
            veg_type,
            user_id: user.id, // ✅ Associate food item with the user
          },
        ])
        .select();

      if (insertError) {
        console.error('Insert Error:', insertError);
        Alert.alert('Insert Error', insertError.message);
        return;
      }

      console.log('✅ Food item inserted successfully:', insertData);
      Alert.alert('✅ Food item added successfully!');

      // Reset Form
      setName('');
      setPrice('');
      setCategory('main');
      setvegType('veg');
      setImage(null);
    } catch (error) {
      console.error('Unexpected Error:', error);
      Alert.alert('Error adding food', error.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Food Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        style={styles.input}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="₹0.00"
        keyboardType="decimal-pad"
        style={styles.input}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Main" value="main" />
          <Picker.Item label="Side" value="side" />
          <Picker.Item label="Dessert" value="dessert" />
          <Picker.Item label="Drink" value="drink" />
          <Picker.Item label="Snack" value="snack" />
        </Picker>
      </View>

      <Text style={styles.label}>Veg Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={veg_type}
          onValueChange={(itemValue) => setvegType(itemValue)}
        >
          <Picker.Item label="Veg" value="veg" />
          <Picker.Item label="Non-Veg" value="nonveg" />
        </Picker>
      </View>

      <Button title="Pick an image from gallery" onPress={pickImage} />

      {image && (
        <Image source={{ uri: image.uri }} style={styles.previewImage} />
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={uploading}
        style={[styles.submitButton, uploading && styles.disabled]}
      >
        <Text style={styles.submitText}>
          {uploading ? 'Uploading...' : 'Submit'}
        </Text>
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: '#888',
  },
});

