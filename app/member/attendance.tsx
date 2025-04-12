import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
} from "date-fns";
import { supabase } from "@/lib/supabase";
import Swiper from "react-native-swiper";

// Meal buttons data
const mealButtons = [
  { name: "Breakfast", icon: "free-breakfast" },
  { name: "Lunch", icon: "lunch-dining" },
  { name: "Dinner", icon: "dinner-dining" },
];

const monthList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Attendance = () => {
  const router = useRouter();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const params = useLocalSearchParams();

  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    new Date().getMonth()
  );

  // Fetch logged in user ID
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, []);

  // Fetch attendance when user or selected month changes
  useEffect(() => {
    if (userId) fetchAttendance();
  }, [userId, selectedMonthIndex]);

  // Show success message and reload if redirected from QR scan
  useEffect(() => {
    if (params?.success === "true" && params?.mealType) {
      Alert.alert(
        "Attendance Marked",
        `Your ${params.mealType} attendance was marked successfully.`,
        [
          {
            text: "OK",
            onPress: () => {
              fetchAttendance();
              router.replace("/member/attendance"); // Clean the params
            },
          },
        ]
      );
    }
  }, [params]);

  const fetchAttendance = async () => {
    setLoading(true);

    const { data: member, error: memberError } = await supabase
      .from("mess_members")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (memberError || !member) {
      console.error("Error fetching member", memberError);
      setLoading(false);
      return;
    }

    const year = new Date().getFullYear();
    const start = format(startOfMonth(new Date(year, selectedMonthIndex)), "yyyy-MM-dd");
    const end = format(endOfMonth(new Date(year, selectedMonthIndex)), "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("mess_member_id", member.id)
      .gte("date", start)
      .lte("date", end);

    if (error) {
      console.error("Error fetching attendance", error);
    } else {
      setAttendanceData(data);
    }

    setLoading(false);
  };

  const daysInMonth = Array.from(
    { length: getDaysInMonth(new Date(new Date().getFullYear(), selectedMonthIndex)) },
    (_, i) =>
      format(new Date(new Date().getFullYear(), selectedMonthIndex, i + 1), "yyyy-MM-dd")
  );

  const getColor = (date: string, mealType: string) => {
    const entry = attendanceData.find(
      (att) => att.date === date && att.meal_type === mealType.toLowerCase()
    );
    if (!entry) return "#dee2e6"; // grey
    return entry.attended ? "#2ECC71" : "#E74C3C"; // green/red
  };

  const isTodayMarked = (mealType: string) => {
    return attendanceData.some(
      (att) =>
        att.date === todayDate &&
        att.meal_type === mealType.toLowerCase() &&
        att.attended
    );
  };

  const handleQRPress = (meal: string) => {
    router.push(`/member/QRScanner?mealType=${meal}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Date Display */}
      <Text style={styles.dateText}>{today}</Text>

      {/* QR Meal Buttons */}
      <View style={styles.gridContainer}>
        {mealButtons.map(({ name, icon }) => {
          const isMarked = isTodayMarked(name);
          return (
            <Pressable
              key={name}
              onPress={() => handleQRPress(name)}
              disabled={isMarked}
              style={({ pressed }) => [
                styles.gridBox,
                isMarked && { backgroundColor: "#bdc3c7" },
                pressed && styles.pressed,
              ]}
            >
              <MaterialIcons name={icon} size={32} color="#fff" />
              <Text style={styles.gridText}>
                {isMarked ? `${name} ✔️` : name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Month Swiper */}
      <View style={{ height: 350 }}>
        <Swiper
          showsPagination={true}
          loop={false}
          index={selectedMonthIndex}
          onIndexChanged={(index) => setSelectedMonthIndex(index)}
        >
          {monthList.map((month, index) => (
            <View key={month} style={styles.swiperSlide}>
              <Text style={styles.summaryTitle}>({month} 2025)</Text>
              {loading ? (
                <ActivityIndicator size="large" color="#2ECC71" />
              ) : (
                <View>
                  {["breakfast", "lunch", "dinner"].map((meal) => (
                    <View key={meal} style={{ marginBottom: 20 }}>
                      <Text style={styles.mealLabel}>🍽️ {meal}</Text>
                      <View style={styles.dotRow}>
                        {daysInMonth.map((date) => (
                          <View
                            key={date + meal}
                            style={{
                              width: 14,
                              height: 14,
                              margin: 3,
                              backgroundColor: getColor(date, meal),
                              borderRadius: 3,
                            }}
                          />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </Swiper>
      </View>
    </ScrollView>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
    flexGrow: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#2ECC71",
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  gridBox: {
    backgroundColor: "#2ECC71",
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
    opacity: 0.8,
  },
  gridText: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
  },
  swiperSlide: {
    paddingVertical: 10,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  mealLabel: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: "capitalize",
    color: "#444",
    fontWeight: "600",
  },
  dotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});
