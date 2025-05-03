import { useNavigation } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { useLayoutEffect } from 'react';
import { Link, useRouter } from 'expo-router';

const mealCategories = ['Breakfast', 'Lunch', 'Dinner'];

export default function MenuScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Link href="/add-food" asChild>
          <Pressable style={styles.headerIcon}>
            {({ pressed }) => (
              <FontAwesome
                name="plus"
                size={28}
                color="#2E7D32"
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>
        </Link>
      ),
    });
  }, [navigation]);

  const handlePress = (mealType: string) => {
    router.push(`/(fadmin)/admin/display-items?type=${mealType.toLowerCase()}` as any);
  };

  const handlePollPress = () => {
    router.push('/(fadmin)/admin/poll');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>Select Meal Type</Text>
      </View>

      <View style={styles.cardContainer}>
        {mealCategories.map((meal, index) => (
          <React.Fragment key={meal}>
            <Pressable
              style={({ pressed }) => [
                styles.mealCard,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => handlePress(meal)}
            >
              <Text style={styles.mealText}>{meal}</Text>
            </Pressable>

            {index === mealCategories.length - 1 && (
              <Pressable
                style={({ pressed }) => [
                  styles.pollButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={handlePollPress}
              >
                <FontAwesome name="calendar-plus-o" size={22} color="#ffffff" />
                <Text style={styles.pollText}>Add Menu Poll</Text>
              </Pressable>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FFF8',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerIcon: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  cardContainer: {
    flexDirection: 'column',
    gap: 20,
  },
  mealCard: {
    backgroundColor: '#ffffff',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  mealText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2E7D32',
  },
  pollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#388E3C',
    paddingVertical: 14,
    marginTop: 16,
    borderRadius: 16,
    gap: 10,
  },
  pollText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
