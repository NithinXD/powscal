import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { db } from "../firebase"; // Import Firebase config

const VoucherCodeScreen = ({ route }) => {
  const { userId } = route.params;
  const [code, setCode] = useState("");
  const navigation = useNavigation();

  const handleCodeSubmit = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter a code.");
      return;
    }

    if (code === "voucher") {
      // Activate premium membership
      await db.collection("users").doc(userId).update({
        premiumMembership: true
      });
      Alert.alert("Success", "Premium membership activated!");
      navigation.navigate("Home"); // Navigate to Home or any other page

    } else if (code === "referral") {
      // Update referral points
      const userDoc = await db.collection("users").doc(userId).get();
      const currentPoints = userDoc.data().referralPoints || 0;
      await db.collection("users").doc(userId).update({
        referralPoints: currentPoints + 2 // Increment referral points
      });
      Alert.alert("Congrats!", `You have ${currentPoints + 2}/4 referral points. Invite more people to get a free premium membership.`);
      navigation.navigate("Home"); // Navigate to Home or any other page

    } else {
      Alert.alert("Invalid Code", "The code you entered is not valid.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Voucher or Referral Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your code"
        value={code}
        onChangeText={setCode}
      />
      <TouchableOpacity style={styles.button} onPress={handleCodeSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VoucherCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#343a40",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: "white",
    marginBottom: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#0782F9",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    backgroundColor: "#343a40",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});
