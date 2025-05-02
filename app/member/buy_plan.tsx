// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useAuthStore } from '@/providers/useAuthStore';
// import * as Linking from 'expo-linking';

// export default function BuyPlanScreen() {
//   const { userId } = useAuthStore();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState<any>(null);
//   const [transactionId, setTransactionId] = useState('');
//   const [awaitingTxnId, setAwaitingTxnId] = useState(false);

//   const plans = [
//     { label: 'Monthly Plan', duration: 30, amount: 3 },
//     { label: '3-Month Plan', duration: 90, amount: 2 },
//     { label: 'Temporary Plan', duration: 7, amount: 1 },
//   ];

//   const handleBuy = async () => {
//     if (!selectedPlan) {
//       Alert.alert('Select a plan to continue.');
//       return;
//     }

//     try {
//       setLoading(true);

//       const upiId = '9325044986@ybl';
//       const amount = selectedPlan.amount;
//       const name = 'Swanand Mahabal';

//       const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
//         name
//       )}&am=${amount}&cu=INR`;

//       const supported = await Linking.canOpenURL(upiUrl);
//       if (supported) {
//         await Linking.openURL(upiUrl);
//         setAwaitingTxnId(true);
//       } else {
//         Alert.alert(
//           'No UPI App Found',
//           'Install a UPI-supported app to proceed with the payment.'
//         );
//       }
//     } catch (error) {
//       console.error('UPI Payment Error:', error);
//       Alert.alert('Error', 'Could not initiate payment. Try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyTransaction = async () => {
//     if (!transactionId) {
//       Alert.alert('Error', 'Please enter the Transaction ID.');
//       return;
//     }

//     try {
//       setLoading(true);

//       if (transactionId.trim() === '123456') {
//         Alert.alert('Success', 'Payment verified!');
//         router.replace('/(user)');
//       } else {
//         Alert.alert(
//           'Failed',
//           'Invalid Transaction ID. Please try again or contact support.'
//         );
//       }
//     } catch (err) {
//       console.error('Transaction verification error:', err);
//       Alert.alert('Error', 'Something went wrong.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Choose a Subscription Plan</Text>

//       {plans.map((plan, idx) => (
//         <TouchableOpacity
//           key={idx}
//           style={[
//             styles.planButton,
//             selectedPlan?.label === plan.label && styles.selectedPlan,
//           ]}
//           onPress={() => setSelectedPlan(plan)}
//         >
//           <Text style={styles.planText}>
//             {plan.label} - ₹{plan.amount}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       {!awaitingTxnId ? (
//         <TouchableOpacity
//           style={styles.buyButton}
//           onPress={handleBuy}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.buyText}>Pay Now</Text>
//           )}
//         </TouchableOpacity>
//       ) : (
//         <View style={styles.transactionInputContainer}>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Transaction ID"
//             value={transactionId}
//             onChangeText={setTransactionId}
//           />
//           <TouchableOpacity
//             style={styles.verifyButton}
//             onPress={verifyTransaction}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buyText}>Verify Payment</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   planButton: {
//     padding: 15,
//     backgroundColor: '#f0f0f0',
//     marginVertical: 5,
//     borderRadius: 10,
//   },
//   selectedPlan: {
//     backgroundColor: '#c8e6c9',
//   },
//   planText: {
//     fontSize: 18,
//     textAlign: 'center',
//   },
//   buyButton: {
//     backgroundColor: '#2196f3',
//     padding: 15,
//     borderRadius: 10,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   buyText: {
//     color: '#fff',
//     fontSize: 18,
//   },
//   transactionInputContainer: {
//     marginTop: 30,
//   },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//   },
//   verifyButton: {
//     backgroundColor: '#4caf50',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
// });


import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/providers/useAuthStore';
import dayjs from 'dayjs';

export default function BuyPlanScreen() {
  const { userId } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const plans = [
    { label: 'Monthly Plan', duration: 30 },
    { label: '3-Month Plan', duration: 90 },
  ];

  const handleBuyPlan = async (duration: number) => {
    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    const startDate = dayjs().format('YYYY-MM-DD');
    const endDate = dayjs().add(duration, 'day').format('YYYY-MM-DD');

    // Check if user is in mess_members
    const { data: existingMember, error: fetchError } = await supabase
      .from('mess_members')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingMember) {
      setLoading(false);
      Alert.alert('Error', 'You need to join a mess before buying a plan');
      return;
    }

    const { error } = await supabase
      .from('mess_members')
      .update({ plan_start: startDate, plan_end: endDate })
      .eq('user_id', userId);

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to update plan');
    } else {
      Alert.alert('Success', 'Plan purchased successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose Your Plan</Text>
      {plans.map((plan, index) => {
        const start = dayjs().format('DD MMM YYYY');
        const end = dayjs().add(plan.duration, 'day').format('DD MMM YYYY');

        return (
          <View key={index} style={styles.card}>
            <Text style={styles.planTitle}>{plan.label}</Text>
            <Text style={styles.planDates}>Start: {start}</Text>
            <Text style={styles.planDates}>End: {end}</Text>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => handleBuyPlan(plan.duration)}
              disabled={loading}
            >
              <Text style={styles.buyButtonText}>
                {loading ? 'Processing...' : 'Buy'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F4F6F8',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  planDates: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  buyButton: {
    backgroundColor: '#4B9CD3',
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});