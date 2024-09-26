import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { auth, db } from "../firebase"; // Assuming you have already set up firebase

const HomeScreen = () => {
  const navigation = useNavigation();
  const [friends, setFriends] = useState([]);
  const [nextMeal, setNextMeal] = useState(null);
  const [nutrition, setNutrition] = useState({ calories: 0, protein: 0, fat: 0, carbs: 0 });
  const [weeklyStats, setWeeklyStats] = useState(null);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    // Fetch friends' data from Firestore
    db.collection("friends")
      .where("userId", "==", auth.currentUser?.uid)
      .get()
      .then((querySnapshot) => {
        const friendsList = querySnapshot.docs.map((doc) => doc.data());
        setFriends(friendsList);
      })
      .catch((error) => console.error("Error fetching friends: ", error));

    // Fetch next meal from Firestore
    db.collection("meals")
      .where("userId", "==", auth.currentUser?.uid)
      .orderBy("time")
      .get()
      .then((querySnapshot) => {
        const mealsList = querySnapshot.docs.map((doc) => doc.data());
        const now = new Date();
        const upcomingMeal = mealsList.find((meal) => new Date(meal.time.toDate()) > now);
        setNextMeal(upcomingMeal || null);
      })
      .catch((error) => console.error("Error fetching meals: ", error));

    // Fetch daily nutrition intake from Firestore
    db.collection("nutrition")
      .doc(auth.currentUser?.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setNutrition(doc.data());
        }
      })
      .catch((error) => console.error("Error fetching nutrition data: ", error));

    // Fetch weekly stats from Firestore
    db.collection("weeklyStats")
      .doc(auth.currentUser?.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          setWeeklyStats(doc.data());
        }
      })
      .catch((error) => console.error("Error fetching weekly stats: ", error));
  }, []);

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch((error) => alert(error.message));
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Image source={{ uri: item.profilePicture }} style={styles.friendImage} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logoText}>PowerScale</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Friends DP like Instagram Stories */}
        <View style={styles.friendsContainer}>
          <FlatList
            data={friends}
            renderItem={renderFriendItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => navigation.navigate("SearchPage")}
          >
            <Image
              source={require("../assets/images/add-friend.png")}
              style={styles.friendImage}
            />
          </TouchableOpacity>
        </View>

        {/* Rectangular Boxes */}
        <View style={styles.boxContainer}>
          {/* Today's Workout Box */}
          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("TrackWorkout", { userId })}
          >
            <Text style={styles.boxTitle}>Today's Workout</Text>
            <Text style={styles.smallText}>Let's Start</Text>
          </TouchableOpacity>

          {/* Nutrition Stats Box */}
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.box, styles.leftBox]}
              onPress={() => navigation.navigate("NutritionDetails")}
            >
              <Text style={styles.boxTitle}>Today's Intake</Text>
              <Text style={styles.boxText}>
                Calories: {nutrition.calories} / {nutrition.maxCalories || 0}
              </Text>
              <Text style={styles.boxText}>
                Protein: {nutrition.protein} / {nutrition.maxProtein || 0}
              </Text>
              <Text style={styles.boxText}>
                Fat: {nutrition.fat} / {nutrition.maxFat || 0}
              </Text>
              <Text style={styles.boxText}>
                Carbs: {nutrition.carbs} / {nutrition.maxCarbs || 0}
              </Text>
            </TouchableOpacity>

            {/* Next Meal Box */}
            <TouchableOpacity
              style={[styles.box, styles.rightBox]}
              onPress={() => navigation.navigate(nextMeal ? "MealDetails" : "TrackMeal")}
            >
              <Text style={styles.boxTitle}>Next Meal</Text>
              {nextMeal ? (
                <Text style={styles.boxText}>{`${nextMeal.name} at ${new Date(
                  nextMeal.time.toDate()
                ).toLocaleTimeString()}`}</Text>
              ) : (
                <Text style={styles.boxText}>Track your meal</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Placeholder Box */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Placeholder</Text>
          </View>

          {/* Weekly Stats Box */}
          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate("WeeklyStats")}
          >
            <Text style={styles.boxTitle}>Weekly Stats</Text>
            {weeklyStats ? (
              <>
                <Text style={styles.boxText}>Calories: {weeklyStats.calories}</Text>
                <Text style={styles.boxText}>Protein: {weeklyStats.protein}</Text>
                <Text style={styles.boxText}>Fat: {weeklyStats.fat}</Text>
                <Text style={styles.boxText}>Carbs: {weeklyStats.carbs}</Text>
              </>
            ) : (
              <Text style={styles.boxText}>No stats available</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate("ProfilePage", { userId })}
        >
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
    backgroundColor: "#121212", // Dark theme background color
  },
  topBar: {
    height: 90,
    backgroundColor: "#121212",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingBottom: 5,
  },
  logoText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    paddingTop: 5,
  },
  signOutButton: {
    padding: 5,
  },
  signOutText: {
    color: "#FF0000",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainContent: {
    paddingVertical: 10,
  },
  friendsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  friendItem: {
    marginRight: 10,
    alignItems: "center",
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#fff",
  },
  boxContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  box: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Transparent grayish look
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    justifyContent: "center",
    flex: 1,
  },
  leftBox: {
    marginRight: 7.5,
  },
  rightBox: {
    marginLeft: 7.5,
  },
  boxTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  boxText: {
    color: "white",
    fontSize: 16,
  },
  smallText: {
    color: "white",
    fontSize: 14,
  },
  bottomBar: {
    height: 50,
    backgroundColor: "#121212",
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
