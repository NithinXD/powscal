import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { db } from "../firebase"; // Import your Firebase setup
import { useNavigation } from "@react-navigation/core";

const GoalsScreen = ({ route }) => {
  const { userId, email, phoneNumber } = route.params;
  const [goal, setGoal] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    currentWeight: '',
    currentHeight: '',
    goalWeight: '',
    calories: 0,
    protein: 0,
    maxFat: 0
  });
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const navigation = useNavigation();

  const calculateDiet = (goal) => {
    // Implement your diet calculation logic here based on the goal
    let calories, protein, maxFat;

    // Example calculation logic (to be replaced with actual formulas):
    switch(goal) {
      case 'Bulking':
        calories = 2500;
        protein = 150; // in grams
        maxFat = 80;   // in grams
        break;
      case 'Cutting':
        calories = 2000;
        protein = 180;
        maxFat = 60;
        break;
      case 'Strength':
        calories = 2200;
        protein = 200;
        maxFat = 70;
        break;
      default:
        calories = 2000;
        protein = 150;
        maxFat = 70;
        break;
    }

    setUserInfo(prev => ({ ...prev, calories, protein, maxFat }));
  };

  const handleGoalSelection = (selectedGoal) => {
    setGoal(selectedGoal);
    calculateDiet(selectedGoal);
    setIsDetailsVisible(true);
  };

  const handleSaveDetails = () => {
    db.collection('users').doc(userId).set({
      email,
      phoneNumber,
      ...userInfo,
      goal
    }).then(() => {
      navigation.navigate("PPP"); // Navigate to the next screen
    }).catch(error => console.error("Error saving user details: ", error));
  };

  return (
    <View style={styles.container}>
      {!isDetailsVisible ? (
        <View style={styles.goalsContainer}>
          <TouchableOpacity style={styles.goalBox} onPress={() => handleGoalSelection('Fitness')}>
            <Text style={styles.goalText}>Fitness</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goalBox} onPress={() => handleGoalSelection('Bulking')}>
            <Text style={styles.goalText}>Bulking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goalBox} onPress={() => handleGoalSelection('Cutting')}>
            <Text style={styles.goalText}>Cutting</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goalBox} onPress={() => handleGoalSelection('Strength')}>
            <Text style={styles.goalText}>Strength</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.detailsContainer}>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={userInfo.name}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
          />
          <TextInput
            placeholder="Current Weight (kg)"
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.currentWeight}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, currentWeight: text }))}
          />
          <TextInput
            placeholder="Current Height (cm) (optional)"
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.currentHeight}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, currentHeight: text }))}
          />
          <TextInput
            placeholder="Goal Weight (kg)"
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.goalWeight}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, goalWeight: text }))}
          />
          <View style={styles.dietInfoContainer}>
            <Text style={styles.dietText}>Suggested Caloric Intake: {userInfo.calories} kcal/day</Text>
            <Text style={styles.dietText}>Protein: {userInfo.protein} g/day</Text>
            <Text style={styles.dietText}>Max Fat: {userInfo.maxFat} g/day</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSaveDetails}>
            <Text style={styles.buttonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default GoalsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  goalBox: {
    width: '40%',
    height: 100,
    margin: 10,
    backgroundColor: '#343a40',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  goalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailsContainer: {
    width: '80%',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#343a40',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    color: 'white',
  },
  dietInfoContainer: {
    marginVertical: 20,
  },
  dietText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0782F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

