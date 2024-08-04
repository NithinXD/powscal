import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { auth } from "../firebase";

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>Instagram</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.emailText}>Email: {auth.currentUser?.email}</Text>
        {/* You can add more content like posts here */}
        <Text style={styles.postText}>This is a sample post</Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Dark theme background color
  },
  topBar: {
    height: 90,
    backgroundColor: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingBottom: 5, // Padding at the bottom to create space above the text
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 5, // Additional space above the text
  },
  signOutButton: {
    padding: 5,
  },
  signOutText: {
    color: "#FF0000", // Red color for the sign-out text
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emailText: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  postText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  bottomBar: {
    height: 50,
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#333",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    color: "white",
    fontSize: 14,
  },
});
