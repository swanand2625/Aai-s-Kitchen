import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
const dashboardItems = [
  {
    title: 'Profile',
    icon: <Ionicons name="person-circle" size={40} color="#4B9CD3" />,
    navigateTo: 'member/profile',
  },
  {
    title: "Today's Menu",
    icon: <MaterialIcons name="restaurant-menu" size={40} color="#FF8C42" />,
    navigateTo: 'member/menu',
  },
  {
    title: 'Holiday Request',
    icon: <Ionicons name="calendar" size={40} color="#00BFA6" />,
    navigateTo: 'member/holiday',
  },
  {
    title: 'Bill Section',
    icon: <MaterialIcons name="receipt" size={40} color="#FF6363" />,
    navigateTo: 'member/bill',
  },
  {
    title: 'Join Mess',
    icon: <MaterialIcons name="restaurant" size={40} color="#FF6363" />,
    navigateTo: 'member/join_mess',
  },
];



export default function TabOneScreen() {
  const navigation = useNavigation();

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
      <Text style={styles.header}>Mess Member Dashboard</Text>
      <FlatList
        data={dashboardItems}
        renderItem={renderItem}
        keyExtractor={(item: { title: any; }) => item.title}
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