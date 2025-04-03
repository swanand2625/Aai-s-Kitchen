const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 🔹 Supabase Credentials
const SUPABASE_URL = 'https://lbtesghgsfirlcueaxct.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidGVzZ2hnc2ZpcmxjdWVheGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTc3ODEsImV4cCI6MjA1ODE5Mzc4MX0.PW0EW56PyzR9uzsohAeraqtbyc6Aeq5aJI7Tog4mcYQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔹 Function to upload an image
async function uploadImage(imagePath) {
  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const fileName = `${Date.now()}-${imagePath.split('/').pop()}`;

    const { data, error } = await supabase.storage
      .from('food.images')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload Error:', error);
      return null;
    }

    const publicUrl = supabase.storage.from('food.images').getPublicUrl(fileName).data.publicUrl;
    console.log('✅ Image uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Unexpected error during upload:', error);
    return null;
  }
}

// 🔹 Function to insert a food item into `food_items`
async function addFoodItem(name, price, category, veg_type, image_url) {
  try {
    const { error } = await supabase.from('food_items').insert([
      { name, price, category, veg_type, image_url },
    ]);

    if (error) {
      console.error('Insert Error:', error);
      return;
    }

    console.log('✅ Food item inserted successfully!');
  } catch (error) {
    console.error('Unexpected error during insert:', error);
  }
}

// 🔹 Main function
async function uploadAndInsert(imagePath) {
  const imageUrl = await uploadImage(imagePath);
  if (!imageUrl) {
    console.error('⛔ Image upload failed. Exiting.');
    return;
  }

  const testFood = {
    name: 'Modak',
    price: 150.0,
    category: 'main',
    veg_type: 'veg',
    image_url: imageUrl,
    
  };

  await addFoodItem(
    testFood.name,
    testFood.price,
    testFood.category,
    testFood.veg_type,
    testFood.image_url,
   
  );
}

// 🔹 Run with test image
const testImagePath = 'image.png';
uploadAndInsert(testImagePath);
