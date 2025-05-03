import { View, Text, StyleSheet, ActivityIndicator, Alert, Image } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/providers/useAuthStore";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router"; // Using expo-router for navigation

type ProfileData = {
  name?: string;
  email?: string;
  messName?: string;
  vegPref?: string;
  planStart?: string;
  planEnd?: string;
};

export default function Profile() {
  const { userId } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId);

        // Fetch user data
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", userId)
          .single();

        if (userError) console.warn("User Fetch Warning:", userError.message);

        // Fetch mess member data
        const { data: memberData, error: memberError } = await supabase
          .from("mess_members")
          .select("*, franchise_id")
          .eq("user_id", userId)
          .single();

        if (memberError) console.warn("Mess Member Fetch Warning:", memberError.message);

        // Fetch franchise data
        const { data: franchiseData, error: franchiseError } = await supabase
          .from("franchises")
          .select("name")
          .eq("id", memberData?.franchise_id)
          .single();

        if (franchiseError) console.warn("Franchise Fetch Warning:", franchiseError.message);

        // Set profile data
        setProfileData({
          name: userData?.name || "Unknown",
          email: userData?.email || "NA",
          messName: franchiseData?.name || "Unknown Mess",
          vegPref: memberData?.veg_pref ? "Veg" : "Non-Veg",
          planStart: memberData?.plan_start || "Not Set",
          planEnd: memberData?.plan_end || "Not Set",
        });
      } catch (error: any) {
        console.error("Error Fetching Profile:", error.message);
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleJoinMess = () => {
    navigation.navigate("member/join_mess"); // Navigate to the Join Mess screen
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>👤 Profile</Text>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <FontAwesome5 name="user" size={20} color="#4CAF50" />
          <Text style={styles.profileText}>{profileData?.name}</Text>
        </View>

        <View style={styles.profileRow}>
          <MaterialIcons name="phone" size={20} color="#4CAF50" />
          <Text style={styles.profileText}>{profileData?.email}</Text>
        </View>

        <View style={styles.profileRow}>
          <FontAwesome5 name="utensils" size={20} color="#4CAF50" />
          <Text style={styles.profileText}>{profileData?.messName}</Text>
        </View>

        <View style={styles.profileRow}>
          <FontAwesome5 name="leaf" size={20} color="#4CAF50" />
          <Text style={styles.profileText}>{profileData?.vegPref}</Text>
        </View>

        <View style={styles.profileRow}>
          <FontAwesome5 name="calendar-check" size={20} color="#4CAF50" />
          <Text style={styles.profileText}>{profileData?.planStart}</Text>
        </View>

        <View style={styles.profileRow}>
          <FontAwesome5 name="calendar-times" size={20} color="#4CAF50" />
          <Text style={styles.profileText}>{profileData?.planEnd}</Text>
        </View>
      </View>

      {/* Show Join Mess Button only if the user is not already in a mess */}
      {!profileData?.messName && (
        <TouchableOpacity style={styles.joinMessButton} onPress={handleJoinMess}>
          <Text style={styles.buttonText}>Join Mess</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
    justifyContent: "flex-start",
  },
  logo: {
    width: 140,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  joinMessButton: {
    marginTop: 20,
    backgroundColor: "#FF8C42", // Using a different color for the button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
