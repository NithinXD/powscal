import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { db } from "../firebase"; // Import your Firebase setup
import { useNavigation } from "@react-navigation/core";

const GoalsScreen = ({ route }) => {
  const { userId, email, phoneNumber } = route.params;
  const [goal, setGoal] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    age: '',
    gender: 'Male',
    currentWeight: '',
    currentWeightUnit: 'kg',
    currentHeight: '',
    currentHeightUnit: 'cm',
    goalWeight: '',
    goalWeightUnit: 'kg',
    calories: 0,
    protein: 0,
    maxFat: 0
  });
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigation = useNavigation();

  const calculateDiet = (goal) => {
    const { currentWeight, currentHeight, age, gender, currentWeightUnit, currentHeightUnit } = userInfo;

    let weight = parseFloat(currentWeight);
    let height = parseFloat(currentHeight);

    if (currentWeightUnit === 'lbs') {
      weight /= 2.205;
    }

    if (currentHeightUnit === 'feet') {
      height *= 30.48;
    }

    let BMR;
    if (gender === 'Male') {
      BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      BMR = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let activityFactor = 1.55; // Moderate activity
    let TDEE = BMR * activityFactor;

    let calories, protein, maxFat;

    switch (goal) {
      case 'Bulking':
        calories = TDEE + 500; // Add 500 calories for weight gain
        protein = weight * 2.2; // 2.2 g/kg of body weight
        maxFat = (calories * 0.25) / 9; // 25% of total calories from fat
        break;
      case 'Cutting':
        calories = TDEE - 500; // Subtract 500 calories for weight loss
        protein = weight * 2.2; // 2.2 g/kg of body weight
        maxFat = (calories * 0.25) / 9; // 25% of total calories from fat
        break;
      case 'Fitness':
        calories = TDEE;
        protein = weight * 1.8; // 1.8 g/kg of body weight
        maxFat = (calories * 0.3) / 9; // 30% of total calories from fat
        break;
      case 'Strength':
        calories = TDEE + 200; // Slight calorie surplus for strength training
        protein = weight * 2.0; // 2.0 g/kg of body weight
        maxFat = (calories * 0.2) / 9; // 20% of total calories from fat
        break;
      default:
        calories = TDEE;
        protein = weight * 1.6;
        maxFat = (calories * 0.3) / 9;
        break;
    }

    setUserInfo(prev => ({ ...prev, calories: Math.round(calories), protein: Math.round(protein), maxFat: Math.round(maxFat) }));
    setIsResultsVisible(true);
  };

  const handleGoalSelection = (selectedGoal) => {
    setGoal(selectedGoal);
    setIsDetailsVisible(true);
  };

  const handleNext = () => {
    calculateDiet(goal);
  };

  const handleSaveDetails = () => {
    db.collection('users').doc(userId).set({
      email,
      phoneNumber,
      ...userInfo,
      goal
    }).then(() => {
      navigation.navigate("WorkoutPlan", { userId});  // Navigate to the next screen
    }).catch(error => console.error("Error saving user details: ", error));
  };

  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
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
      ) : !isResultsVisible ? (
        <View style={styles.detailsContainer}>
          <TouchableOpacity style={styles.modalButton} onPress={() => openModal('gender')}>
            <Text style={styles.buttonText}>{userInfo.gender}</Text>
          </TouchableOpacity>
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={userInfo.name}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, name: text }))}
          />
          <TextInput
            placeholder="Age"
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.age}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, age: text }))}
          />
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Current Weight"
              style={[styles.input, styles.inputShort]}
              keyboardType="numeric"
              value={userInfo.currentWeight}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, currentWeight: text }))}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => openModal('currentWeightUnit')}>
              <Text style={styles.buttonText}>{userInfo.currentWeightUnit}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Current Height"
              style={[styles.input, styles.inputShort]}
              keyboardType="numeric"
              value={userInfo.currentHeight}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, currentHeight: text }))}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => openModal('currentHeightUnit')}>
              <Text style={styles.buttonText}>{userInfo.currentHeightUnit}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Goal Weight"
              style={[styles.input, styles.inputShort]}
              keyboardType="numeric"
              value={userInfo.goalWeight}
              onChangeText={(text) => setUserInfo(prev => ({ ...prev, goalWeight: text }))}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => openModal('goalWeightUnit')}>
              <Text style={styles.buttonText}>{userInfo.goalWeightUnit}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.heading}>Your Daily Nutrient Intake</Text>
          <Text style={styles.label}>Caloric Intake (kcal/day)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.calories.toString()}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, calories: text }))}
          />
          <Text style={styles.label}>Minimum Protein Intake (g/day)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.protein.toString()}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, protein: text }))}
          />
          <Text style={styles.label}>Maximum Fat Intake (g/day)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={userInfo.maxFat.toString()}
            onChangeText={(text) => setUserInfo(prev => ({ ...prev, maxFat: text }))}
          />
          <TouchableOpacity style={styles.button} onPress={handleSaveDetails}>
            <Text style={styles.buttonText}>Save & Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {modalType === 'gender' && (
              <>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, gender: 'Male' })); closeModal(); }}>
                  <Text style={styles.modalText}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, gender: 'Female' })); closeModal(); }}>
                  <Text style={styles.modalText}>Female</Text>
                </TouchableOpacity>
              </>
            )}
            {modalType === 'currentWeightUnit' && (
              <>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, currentWeightUnit: 'kg' })); closeModal(); }}>
                  <Text style={styles.modalText}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, currentWeightUnit: 'lbs' })); closeModal(); }}>
                  <Text style={styles.modalText}>lbs</Text>
                </TouchableOpacity>
              </>
            )}
            {modalType === 'currentHeightUnit' && (
              <>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, currentHeightUnit: 'cm' })); closeModal(); }}>
                  <Text style={styles.modalText}>cm</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, currentHeightUnit: 'feet' })); closeModal(); }}>
                  <Text style={styles.modalText}>feet</Text>
                </TouchableOpacity>
              </>
            )}
            {modalType === 'goalWeightUnit' && (
              <>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, goalWeightUnit: 'kg' })); closeModal(); }}>
                  <Text style={styles.modalText}>kg</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setUserInfo(prev => ({ ...prev, goalWeightUnit: 'lbs' })); closeModal(); }}>
                  <Text style={styles.modalText}>lbs</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={closeModal} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    color: 'black',
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputShort: {
    flex: 1,
  },
  modalButton: {
    backgroundColor: '#343a40',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0782F9',
    marginTop:30,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  heading: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 18,
    marginVertical: 10,
  },
  closeModalButton: {
    marginTop: 20,
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
  },
});
