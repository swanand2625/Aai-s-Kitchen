import { View, TextInput, Button, Text, Image, Pressable, Alert } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';

import 'react-native-url-polyfill/auto'; // Needed for Supabase in React Native
import { supabase } from '@/lib/supabase';
export default function AddFood() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('main');
  const [image, setImage] = useState<any>(null);
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

      // 1. Upload image to Supabase Storage
      const fileExt = image.uri.split('.').pop();
      const fileName = `${name}-${Date.now()}.${fileExt}`;
      const response = await fetch(image.uri);
      const blob = await response.blob();

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food_images') // Make sure this bucket exists
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('food_images')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 3. Insert into food_items table
      const { error: insertError } = await supabase.from('food_items').insert([
        {
          name,
          category,
          price: parseFloat(price),
          image_url: imageUrl, // make sure your table has image_url column
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert('Food item added successfully!');
      setName('');
      setPrice('');
      setCategory('main');
      setImage(null);
    } catch (error: any) {
      Alert.alert('Error uploading', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-lg mb-2">Food Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        className="border p-2 rounded mb-4"
      />

      <Text className="text-lg mb-2">Price</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="₹0.00"
        keyboardType="decimal-pad"
        className="border p-2 rounded mb-4"
      />

      <Text className="text-lg mb-2">Category</Text>
      <View className="border rounded mb-4">
        <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
          <Picker.Item label="Main" value="main" />
          <Picker.Item label="Side" value="side" />
          <Picker.Item label="Dessert" value="dessert" />
          <Picker.Item label="Drink" value="drink" />
          <Picker.Item label="Snack" value="snack" />
        </Picker>
      </View>

      <Button title="Pick an image from gallery" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image.uri }} style={{ width: 100, height: 100, marginVertical: 10 }} />
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={uploading}
        className="bg-blue-500 mt-4 p-3 rounded items-center"
      >
        <Text className="text-white text-lg">{uploading ? 'Uploading...' : 'Submit'}</Text>
      </Pressable>
    </View>
  );
}
