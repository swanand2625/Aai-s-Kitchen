import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useNavigation } from 'expo-router';

// Franchise admin dashboard items
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
];

export default function FranchiseAdminDashboard() {
  const navigation = useNavigation();

  // Rendering each dashboard item
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to appropriate screen
        navigation.navigate(item.navigateTo as never);
      }}
    >
      <View style={styles.icon}>{item.icon}</View>
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Franchise Admin Dashboard</Text>
      <FlatList
        data={adminDashboardItems}
        renderItem={renderItem}
        keyExtractor={(item: { title: any }) => item.title}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

// Styles for the dashboard
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#333',
    alignSelf: 'center',
  },
  grid: {
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  icon: {
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
