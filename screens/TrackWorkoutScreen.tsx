import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, Modal, Dimensions } from "react-native";
import { db, auth } from "../firebase"; // Ensure firebase is configured correctly

const TrackWorkoutScreen = () => {
  const [workoutData, setWorkoutData] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay());
  const [heaviestWeight, setHeaviestWeight] = useState({});
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [workoutSets, setWorkoutSets] = useState("");
  const [workoutReps, setWorkoutReps] = useState("");
  const [showReels, setShowReels] = useState(false);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const userId = auth.currentUser?.uid;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    fetchWorkoutsForDay(currentDayIndex);
  }, [currentDayIndex]);

  const fetchWorkoutsForDay = (dayIndex) => {
    const dayName = daysOfWeek[dayIndex];
    db.collection("workoutPlans")
      .doc(userId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const plan = doc.data().plan || {};
          setWorkoutData(plan[dayName]?.workouts || []);
        }
      })
      .catch((error) => console.error("Error fetching workouts: ", error));
  };

  const navigateDay = (direction) => {
    let newIndex = currentDayIndex + direction;
    if (newIndex < 0) newIndex = daysOfWeek.length - 1;
    if (newIndex >= daysOfWeek.length) newIndex = 0;
    setCurrentDayIndex(newIndex);
  };

  const handleAddSet = (workout) => {
    setCurrentWorkout(workout);
    setIsModalVisible(true);
  };

  const handleSaveSet = () => {
    if (!workoutSets.trim() || !workoutReps.trim()) {
      alert("Please enter both sets and reps for the workout.");
      return;
    }

    const newSet = { reps: workoutReps, weight: workoutSets };

    const updatedWorkouts = workoutData.map((workout) =>
      workout.id === currentWorkout.id
        ? {
            ...workout,
            sets: Array.isArray(workout.sets) ? [...workout.sets, newSet] : [newSet],
          }
        : workout
    );

    setWorkoutData(updatedWorkouts);

    db.collection("workoutPlans")
      .doc(userId)
      .update({
        [`plan.${daysOfWeek[currentDayIndex]}.workouts`]: updatedWorkouts,
      });

    setIsModalVisible(false);
    setWorkoutSets("");
    setWorkoutReps("");
    setCurrentWorkout(null);
  };

  const renderWorkoutItem = ({ item }) => (
    <View style={styles.workoutContainer}>
      <Text style={styles.workoutTitle}>{item.name}</Text>
      <Text style={styles.workoutDetail}>Current Heaviest: {heaviestWeight[item.id] || "NIL"}</Text>
      {(Array.isArray(item.sets) ? item.sets : []).map((set, index) => (
        <Text key={index} style={styles.setText}>
          Set {index + 1}: {set.reps} reps at {set.weight} kg/lbs
        </Text>
      ))}
      <Image
        source={item.image ? { uri: item.image } : require("../assets/images/logo.png")}
        style={styles.workoutImage}
      />
      <TouchableOpacity style={styles.addSetButton} onPress={() => handleAddSet(item)}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );

  const startWorkout = () => {
    setShowReels(true);
  };

  const renderReelItem = ({ item }) => (
    <View style={[styles.reelContainer, { height: screenHeight }]}>
      <Text style={styles.workoutTitle}>{item.name}</Text>
      <Text style={styles.workoutDetail}>Current Heaviest: {heaviestWeight[item.id] || "NIL"}</Text>
      {(Array.isArray(item.sets) ? item.sets : []).map((set, index) => (
        <Text key={index} style={styles.setText}>
          Set {index + 1}: {set.reps} reps at {set.weight} kg/lbs
        </Text>
      ))}
      <Image
        source={item.image ? { uri: item.image } : require("../assets/images/logo.png")}
        style={styles.workoutImage}
      />
      <TouchableOpacity style={styles.addSetButton} onPress={() => handleAddSet(item)}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {showReels ? (
        <FlatList
          data={workoutData}
          renderItem={renderReelItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          snapToAlignment="center"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
          decelerationRate="fast"
          snapToInterval={screenHeight}
          ListFooterComponent={
            <TouchableOpacity style={styles.finishWorkoutButton} onPress={() => setShowReels(false)}>
              <Text style={styles.finishWorkoutText}>Finish Workout</Text>
            </TouchableOpacity>
          }
        />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigateDay(-1)}>
              <Text style={styles.headerButton}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{daysOfWeek[currentDayIndex]}</Text>
            <TouchableOpacity onPress={() => navigateDay(1)}>
              <Text style={styles.headerButton}>{">"}</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={workoutData}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContainer}
          />

          <TouchableOpacity style={styles.startWorkoutButton} onPress={startWorkout}>
            <Text style={styles.startWorkoutText}>Start {daysOfWeek[currentDayIndex]} Workout</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Set for {currentWorkout?.name}</Text>
            <TextInput
              placeholder="Reps"
              value={workoutReps}
              onChangeText={setWorkoutReps}
              style={styles.input}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <TextInput
              placeholder="Weight"
              value={workoutSets}
              onChangeText={setWorkoutSets}
              style={styles.input}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveSet}>
              <Text style={styles.buttonText}>Save Set</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TrackWorkoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    height: 120,
    backgroundColor: "#1f1f1f",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerButton: {
    color: "white",
    fontSize: 24,
    paddingTop: 35,
  },
  headerTitle: {
    paddingTop: 40,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  workoutContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  workoutTitle: {
    color: "white",
    fontSize: 22,
    marginBottom: 10,
  },
  workoutDetail: {
    color: "white",
    fontSize: 16,
    marginBottom: 10,
  },
  setText: {
    color: "white",
    fontSize: 14,
    marginBottom: 5,
  },
  workoutImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  addSetButton: {
    backgroundColor: "#0782F9",
    padding: 10,
    borderRadius: 10,
  },
  addSetText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  startWorkoutButton: {
    backgroundColor: "#0782F9",
    padding: 15,
    alignItems: "center",
    margin: 20,
    borderRadius: 10,
  },
  startWorkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  reelContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    height: "100%",
  },
  finishWorkoutButton: {
    backgroundColor: "#0782F9",
    padding: 15,
    alignItems: "center",
    margin: 20,
    borderRadius: 10,
  },
  finishWorkoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#555960",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: "black",
    width: "100%",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#0782F9",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
