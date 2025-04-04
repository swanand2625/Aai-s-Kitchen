import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { format } from "date-fns";

const mealTypes = [
  { name: "Breakfast", icon: "free-breakfast" },
  { name: "Lunch", icon: "lunch-dining" },
  { name: "Dinner", icon: "dinner-dining" },
];

export default function Attendance() {
  const router = useRouter();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const handlePress = (meal: string) => {
    router.push({ pathname: '/member/QRScanner', params: { mealType: meal } });
  };

  return (
    <View style={styles.container}>
      {/* Display Current Date */}
      <Text style={styles.dateText}>{today}</Text>

      {/* Meal Attendance Buttons */}
      <View style={styles.gridContainer}>
        {mealTypes.map(({ name, icon }) => (
          <Pressable
            key={name}
            onPress={() => handlePress(name)}
            style={({ pressed }) => [styles.gridBox, pressed && styles.pressed]}
          >
            <MaterialIcons name={icon} size={32} color="#fff" />
            <Text style={styles.gridText}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  gridBox: {
    backgroundColor: "#007AFF",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  gridText: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
  },
});
