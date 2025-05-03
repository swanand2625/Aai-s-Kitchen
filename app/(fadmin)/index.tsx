import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const adminDashboardItems = [
  {
    title: 'Total Customers',
    icon: <Ionicons name="people" size={40} color="#4B9CD3" />,
    navigateTo: 'admin/tmp',
  },
  {
    title: "Today's Guests",
    icon: <Ionicons name="person" size={40} color="#FF8C42" />,
    navigateTo: 'admin/todays-guests',
  },
  {
    title: 'Menu',
    icon: <MaterialIcons name="restaurant-menu" size={40} color="#00BFA6" />,
    navigateTo: 'admin/menu',
  },
  {
    title: 'Attendance',
    icon: <FontAwesome name="calendar-check-o" size={40} color="#FF6363" />,
    navigateTo: 'admin/tmp2',
  },
  {
    title: 'Feedback Book',
    icon: <MaterialIcons name="feedback" size={40} color="#4CAF50" />,
    navigateTo: 'admin/feedback-book',
  },
  {
    title: 'Payments',
    icon: <FontAwesome name="credit-card" size={40} color="#FFC107" />,
    navigateTo: 'admin/payments',
  },
  {
    title: 'Holiday Requests',
    icon: <FontAwesome name="calendar" size={40} color="#6A1B9A" />,
    navigateTo: 'admin/holidayreq',
  },
];

export default function FranchiseAdminDashboard() {
  const navigation = useNavigation();

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.navigateTo as never)}
    >
      <View style={styles.icon}>{item.icon}</View>
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.headerContainer}>
        <Image
          source={require('../../assets/images/logo.jpg')} // Update the path if needed
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Centered Title */}
      <Text style={styles.title}>Franchise Admin Dashboard</Text>

      {/* Dashboard Grid */}
      <FlatList
        data={adminDashboardItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F0FFF8', // light green background
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  logo: {
    width: 120, // increase the width for a larger appearance
    height: 70, // adjust height as needed
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 8,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 5,
    textAlign: 'center',
  },
});
