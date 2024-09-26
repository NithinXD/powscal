import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, FlatList, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { db } from '../firebase'; // Import your Firebase config

const commonWorkouts = [
  { name: "Push Up", description: "A basic upper body exercise", image: "url_to_pushup_image" },
  { name: "Squat", description: "A lower body exercise", image: "url_to_squat_image" },
  { name: "Bench Press", description: "An upper body strength exercise", image: "url_to_benchpress_image" },
  // ...more workouts
];

const WorkoutPlanScreen = ({ route }) => {
  const { userId } = route.params;
  if (!userId) {
    console.error('No userId provided!');
    return null;
  }

  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState({});
  const [currentDay, setCurrentDay] = useState("");
  const [currentDayName, setCurrentDayName] = useState("");
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [currentEditDay, setCurrentEditDay] = useState(null);
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [customWorkoutDescription, setCustomWorkoutDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomWorkoutForm, setShowCustomWorkoutForm] = useState(false);

  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutSets, setWorkoutSets] = useState("");
  const [workoutReps, setWorkoutReps] = useState("");
  const [workoutWeight, setWorkoutWeight] = useState("");
  const [editWorkout, setEditWorkout] = useState(null);

  const navigation = useNavigation();
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (option === 'inApp') {
      setCurrentDay(daysOfWeek[0]);
    } else if (option === 'noPlan') {
      navigation.replace("DietPlan", { userId });

    }
  };

  const handleAddWorkout = () => {
    setIsModalVisible(true);
  };

  const handleSelectWorkout = (workout) => {
    setCurrentWorkout(workout);
  };

  const handleSaveWorkoutDetails = () => {
    if (!workoutSets.trim() || !workoutReps.trim()) {
      alert("Please enter both sets and reps for the workout.");
      return;
    }

    const newWorkout = {
      ...currentWorkout,
      sets: workoutSets,
      reps: workoutReps,
      weight: workoutWeight,
      id: Date.now().toString(),
    };

    if (editWorkout) {
      setSelectedWorkouts((prev) =>
        prev.map((workout) =>
          workout.id === editWorkout.id ? newWorkout : workout
        )
      );
      setEditWorkout(null);
    } else {
      setSelectedWorkouts((prev) => [...prev, newWorkout]);
    }

    setCurrentWorkout(null);
    setWorkoutSets("");
    setWorkoutReps("");
    setWorkoutWeight("");
    setIsModalVisible(false);
  };

  const handleSaveWorkoutDay = () => {
    if (currentDayName || selectedWorkouts.length) {
      setWorkoutPlan(prev => ({
        ...prev,
        [currentDay]: { dayName: currentDayName, workouts: selectedWorkouts },
      }));

      setCurrentDayName("");
      setSelectedWorkouts([]);
      setIsModalVisible(false);

      if (!currentEditDay) {
        const nextDayIndex = daysOfWeek.indexOf(currentDay) + 1;
        if (nextDayIndex < daysOfWeek.length) {
          setCurrentDay(daysOfWeek[nextDayIndex]);
        } else {
          setShowSummary(true);
        }
      } else {
        setShowSummary(true);
      }
    }
  };

  const handleEditDay = (day) => {
    setCurrentEditDay(day);
    setCurrentDay(day);
    setCurrentDayName(workoutPlan[day].dayName);
    setSelectedWorkouts(workoutPlan[day].workouts);
    setShowSummary(false);
    setSelectedOption('inApp');
  };

  const handleSavePlan = async () => {
    try {
      await db.collection("workoutPlans").doc(userId).set({
        userId,
        plan: workoutPlan,
        createdAt: new Date(),
      });
      console.log("Plan saved successfully");
      navigation.replace("DietPlan", { userId }); // Navigate to the next screen after saving
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleAddCustomWorkout = () => {
    setShowCustomWorkoutForm(true);
  };

  const saveCustomWorkout = () => {
    if (!customWorkoutName.trim()) {
      alert("Workout name cannot be empty.");
      return;
    }

    const newWorkout = { name: customWorkoutName, description: customWorkoutDescription, id: Date.now().toString() };
    setSelectedWorkouts((prev) => [...prev, newWorkout]);
    setCustomWorkoutName("");
    setCustomWorkoutDescription("");
    setShowCustomWorkoutForm(false);
    setIsModalVisible(false);
  };

  const filteredWorkouts = commonWorkouts.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditWorkout = (workout) => {
    setEditWorkout(workout);
    setCurrentWorkout(workout);
    setWorkoutSets(workout.sets);
    setWorkoutReps(workout.reps);
    setWorkoutWeight(workout.weight);
    setIsModalVisible(true);
  };

  const handleDeleteWorkout = (workoutId) => {
    setSelectedWorkouts((prev) => prev.filter(workout => workout.id !== workoutId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Let’s start designing your workout plan</Text>

      {selectedOption === 'inApp' && currentDay && !showSummary && (
        <View style={styles.planContainer}>
          <View style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{currentDay} - </Text>
            <TextInput
              placeholder="Set day name for this day (e.g., Pull Day)"
              style={styles.input}
              value={currentDayName}
              onChangeText={setCurrentDayName}
            />
          </View>

          {selectedWorkouts.length > 0 && (
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Workout</Text>
              <Text style={styles.tableHeaderText}>Sets</Text>
              <Text style={styles.tableHeaderText}>Reps</Text>
              <Text style={styles.tableHeaderText}>Weight</Text>
            </View>
          )}
          
          <FlatList
            data={selectedWorkouts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleEditWorkout(item)} style={styles.workoutRow}>
                <Text style={styles.workoutText}>{item.name}</Text>
                <Text style={styles.workoutDetailText}>{item.sets}</Text>
                <Text style={styles.workoutDetailText}>{item.reps}</Text>
                <Text style={styles.workoutDetailText}>{item.weight}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.addWorkoutButton}
            onPress={handleAddWorkout}
          >
            <Text style={styles.buttonText}>Add Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveWorkoutDay}
          >
            <Text style={styles.buttonText}>Save and Next Day</Text>
          </TouchableOpacity>
        </View>
      )}

      {showSummary && (
        <ScrollView style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Workout Plan</Text>
          {Object.keys(workoutPlan).map((day, index) => (
            <TouchableOpacity key={index} onPress={() => handleEditDay(day)} style={styles.summaryDay}>
              <Text style={styles.dayName}>
                {day}{workoutPlan[day].dayName ? ` - ${workoutPlan[day].dayName}` : ""}
              </Text>
              {workoutPlan[day].workouts.map((workout, i) => (
                <Text key={i} style={styles.summaryWorkout}>{workout.name} (Sets: {workout.sets}, Reps: {workout.reps}, Weight: {workout.weight})</Text>
              ))}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.savePlanButton} onPress={handleSavePlan}>
            <Text style={styles.buttonText}>Save Plan</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {!selectedOption && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionSelect('uploadExcel')}>
            <Text style={styles.optionText}>Upload Excel Sheet (Placeholder)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionSelect('inApp')}>
            <Text style={styles.optionText}>Use In-App Feature to Design Workout Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionSelect('noPlan')}>
            <Text style={styles.optionText}>Proceed with No Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Workout Options Modal */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {currentWorkout ? (
              <>
                <TouchableOpacity onPress={() => setCurrentWorkout(null)} style={styles.backButton}>
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Workout Details</Text>
                <Text style={styles.modalItemText}>{currentWorkout.name}</Text>

                {/* Sets Input */}
                <TextInput
                  placeholder="Sets"
                  value={workoutSets}
                  onChangeText={setWorkoutSets}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => { /* handle the done action here if needed */ }}
                />
                
                {/* Reps Input */}
                <TextInput
                  placeholder="Reps"
                  value={workoutReps}
                  onChangeText={setWorkoutReps}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => { /* handle the done action here if needed */ }}
                />
                
                {/* Weight Input */}
                <TextInput
                  placeholder="Weight (optional)"
                  value={workoutWeight}
                  onChangeText={setWorkoutWeight}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => { /* handle the done action here if needed */ }}
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkoutDetails}>
                  <Text style={styles.buttonText}>Save Workout</Text>
                </TouchableOpacity>
                {editWorkout && (
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: 'red' }]}
                    onPress={() => handleDeleteWorkout(editWorkout.id)}
                  >
                    <Text style={styles.buttonText}>Delete Workout</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                {!showCustomWorkoutForm && (
                  <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.exitModalButton}>
                    <Text style={styles.exitModalButtonText}>Back</Text>
                  </TouchableOpacity>
                )}
                {showCustomWorkoutForm ? (
                  <>
                    <TouchableOpacity onPress={() => setShowCustomWorkoutForm(false)} style={styles.backButton}>
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Custom Workout</Text>
                    <TextInput
                      placeholder="Workout Name"
                      value={customWorkoutName}
                      onChangeText={setCustomWorkoutName}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Workout Description"
                      value={customWorkoutDescription}
                      onChangeText={setCustomWorkoutDescription}
                      style={styles.input}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={saveCustomWorkout}>
                      <Text style={styles.buttonText}>Save Custom Workout</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TextInput
                      placeholder="Search Workouts"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={styles.searchInput}
                    />
                    <FlatList
                      data={[...filteredWorkouts, { name: "Add Custom Workout", isCustom: true }]}
                      keyExtractor={(item) => item.name + Math.random().toString(36)}
                      renderItem={({ item }) => (
                        item.isCustom ? (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={handleAddCustomWorkout}
                          >
                            <Text style={styles.modalItemText}>{item.name}</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => handleSelectWorkout(item)}
                          >
                            <Text style={styles.modalItemText}>{item.name}</Text>
                            <Text style={styles.modalItemDescription}>{item.description}</Text>
                          </TouchableOpacity>
                        )
                      )}
                    />
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WorkoutPlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#343a40',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  planContainer: {
    width: '100%',
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dayTitle: {
    color: 'white',
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    backgroundColor: '#FFFFFF', // White background for input fields
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: 'black', // Black text color
    flex: 1,
    marginBottom: 10,
  },
  addWorkoutButton: {
    backgroundColor: '#0782F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0782F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  savePlanButton: {
    backgroundColor: '#0782F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  workoutText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
  },
  workoutDetailText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#555960', // Lighter grey for modal background
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalItemText: {
    fontSize: 18,
    color: 'white',
  },
  modalItemDescription: {
    fontSize: 14,
    color: 'gray',
  },
  summaryContainer: {
    width: '100%',
    marginTop: 20,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryDay: {
    marginBottom: 20,
  },
  dayName: {
    color: 'white',
    fontSize: 20,
    marginBottom: 10,
  },
  summaryWorkout: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  searchInput: {
    backgroundColor: '#343a40',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: 'black',
    marginBottom: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  exitModalButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  exitModalButtonText: {
    color: '#0782F9',
    fontSize: 16,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#0782F9',
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'white',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderText: {
    color: 'white',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
});
