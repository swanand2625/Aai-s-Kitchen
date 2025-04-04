import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/providers/useAuthStore";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

// Profile Data Type
type ProfileData = {
  name?: string;
  contact?: string;
  messName?: string;
  vegPref?: string;
  planStart?: string;
  planEnd?: string;
};

export default function Profile() {
  const { userId } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching profile for userId:", userId);

        // Fetch user details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, contact")
          .eq("id", userId)
          .single();

        if (userError) console.warn("User Fetch Warning:", userError.message);

        // Fetch mess member details
        const { data: memberData, error: memberError } = await supabase
          .from("mess_members")
          .select("*, franchise_id")
          .eq("user_id", userId)
          .single();

        if (memberError) console.warn("Mess Member Fetch Warning:", memberError.message);

        // Fetch franchise name
        const { data: franchiseData, error: franchiseError } = await supabase
          .from("franchises")
          .select("name")
          .eq("id", memberData?.franchise_id)
          .single();

        if (franchiseError) console.warn("Franchise Fetch Warning:", franchiseError.message);

        // Set Profile Data
        setProfileData({
          name: userData?.name || "Unknown",
          contact: userData?.contact || "NA",
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

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}><FontAwesome5 name="user" size={18} color="#444" /> Name:</Text>
        <Text style={styles.value}>{profileData?.name}</Text>
        
        <Text style={styles.label}><MaterialIcons name="phone" size={18} color="#444" /> Contact:</Text>
        <Text style={styles.value}>{profileData?.contact}</Text>

        <Text style={styles.label}><FontAwesome5 name="utensils" size={18} color="#444" /> Mess:</Text>
        <Text style={styles.value}>{profileData?.messName}</Text>

        <Text style={styles.label}><FontAwesome5 name="leaf" size={18} color="#444" /> Preference:</Text>
        <Text style={styles.value}>{profileData?.vegPref}</Text>

        <Text style={styles.label}><FontAwesome5 name="calendar-check" size={18} color="#444" /> Plan Start:</Text>
        <Text style={styles.value}>{profileData?.planStart}</Text>

        <Text style={styles.label}><FontAwesome5 name="calendar-times" size={18} color="#444" /> Plan End:</Text>
        <Text style={styles.value}>{profileData?.planEnd}</Text>
      </View>

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
    justifyContent: "center",
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
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
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
