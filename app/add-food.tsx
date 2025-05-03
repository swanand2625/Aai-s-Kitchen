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
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import 'react-native-url-polyfill/auto'; // Needed for Supabase
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export default function AddFood() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [veg_type, setvegType] = useState('veg');
  const [category, setCategory] = useState('main');
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      Alert.alert('Please fill all fields and select an image.');
      return;
    }

    try {
      setUploading(true);
      const fileUri = image.uri;
      const fileExt = fileUri.split('.').pop();
      const fileName = `${name}-${Date.now()}.${fileExt}`;

      // Convert local file to base64 and buffer
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBuffer = Buffer.from(base64, 'base64');

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('food.images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.log('Upload Error:', uploadError);
        throw uploadError;
      }

      // Get public image URL
      const { data: publicUrlData } = supabase.storage
        .from('food.images')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // Insert into database
      const { error: insertError } = await supabase.from('food_items').insert([
        {
          name,
          category,
          price: parseFloat(price),
          image_url: imageUrl,
          veg_type,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert('✅ Food item added successfully!');

      // Reset form
      setName('');
      setPrice('');
      setCategory('main');
      setvegType('veg');
      setImage(null);
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('⛔ Error uploading', error.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../assets/images/logo.jpg')} // Updated logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Add New Food Item</Text>
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
          <Picker.Item label="Nonveg" value="nonveg" />
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

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 70,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#228b22', // Green color for title
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
    color: '#228b22', // Green color for labels
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
    backgroundColor: '#228b22', // Green background for submit button
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
