import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/providers/useAuthStore";

// Define ProfileData type but make it optional in the state
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

        // Fetch user details (name & contact)
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name")
          .eq("id", userId)
          .single();


          console.log(userData)

        if (userError) {
          console.warn("User Fetch Warning:", userError.message);
        }

        // Fetch mess member details
        const { data: memberData, error: memberError } = await supabase
          .from("mess_members")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (memberError) {
          console.warn("Mess Member Fetch Warning:", memberError.message);
        }

        // Fetch franchise name
        const { data: franchiseData, error: franchiseError } = await supabase
          .from("franchises")
          .select("name")
          .eq("id", memberData?.franchise_id)
          .single();

        if (franchiseError) {
          console.warn("Franchise Fetch Warning:", franchiseError.message);
        }

        // Set Profile Data
        setProfileData({
          name: userData?.name || "Unknown",
          contact: userData?.contact || "N/A",
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
      {profileData ? (
        <>
          <Text style={styles.text}>Name: {profileData.name}</Text>
          <Text style={styles.text}>Contact: {profileData.contact}</Text>
          <Text style={styles.text}>Mess: {profileData.messName}</Text>
          <Text style={styles.text}>Preference: {profileData.vegPref}</Text>
          <Text style={styles.text}>Plan Start: {profileData.planStart}</Text>
          <Text style={styles.text}>Plan End: {profileData.planEnd}</Text>
        </>
      ) : (
        <Text style={styles.text}>Profile data not available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    color: "#555",
    marginVertical: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
