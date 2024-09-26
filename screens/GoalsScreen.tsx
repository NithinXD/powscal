import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, SafeAreaView, Alert, Image } from "react-native";
import Slider from "@react-native-community/slider";
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from "@react-navigation/core";
import { db } from '../firebase'; // Import your Firebase setup

const GoalsScreen = ({ route }) => {
  const { userId, email, phoneNumber } = route.params;
  const [name, setName] = useState('');
  const [age, setAge] = useState({ day: '', month: '', year: '' });
  const [height, setHeight] = useState(5.5); // Example in feet
  const [weight, setWeight] = useState(63); // Example weight in kg or lbs
  const [targetWeight, setTargetWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('ft');
  const [gender, setGender] = useState('Male');
  const [goal, setGoal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [errors, setErrors] = useState({});
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [maxFat, setMaxFat] = useState(0);
  const navigation = useNavigation();

  const validateFields = () => {
    let tempErrors = {};
    let isValid = true;

    if (!name) {
      tempErrors.name = "Name is required.";
      isValid = false;
    }
    if (!age.day || !age.month || !age.year) {
      tempErrors.age = "Age is required.";
      isValid = false;
    }
    if (height === null || height === '') {
      tempErrors.height = "Height is required.";
      isValid = false;
    }
    if (weight === null || weight === '') {
      tempErrors.weight = "Weight is required.";
      isValid = false;
    }
    if (targetWeight === null || targetWeight === '') {
      tempErrors.targetWeight = "Target weight is required.";
      isValid = false;
    }
    if (!gender) {
      tempErrors.gender = "Gender is required.";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleGoalSelection = (selectedGoal) => {
    setGoal(selectedGoal);
    setShowDetails(true);
  };

  const handleContinue = async () => {
    if (validateFields()) {
      // Convert all values to metric units
      let metricWeight = weight;
      let metricHeight = height;

      if (weightUnit === 'lbs') {
        metricWeight = (weight / 2.205).toFixed(1); // Convert lbs to kg
      }

      if (heightUnit === 'ft') {
        const [feet, inches] = height.toString().split('.');
        metricHeight = (parseFloat(feet) * 30.48 + parseFloat(inches) * 2.54).toFixed(1); // Convert ft to cm
      }

      // Calculate nutritional values based on goal and metrics
      const nutritionalValues = calculateNutritionalValues({
        weight: metricWeight,
        height: metricHeight,
        age: age.year, // Using year as a proxy for age calculation
        targetWeight,
        gender,
        goal
      });

      setCalories(nutritionalValues.calories);
      setProtein(nutritionalValues.protein);
      setCarbs(nutritionalValues.carbs);
      setMaxFat(nutritionalValues.maxFat);

      setShowResults(true);
    } else {
      Alert.alert("Validation Error", "Please fill out all required fields.");
    }
  };

  const calculateNutritionalValues = ({ weight, height, age, targetWeight, gender, goal }) => {
    // Example formula; replace with a proper formula based on online research
    let calories, protein, carbs, maxFat;

    // Simple logic for demonstration, replace with actual formulas
    if (goal === 'Bulk') {
      calories = 3000;
      protein = 200;
      carbs = 350;
      maxFat = 80;
    } else if (goal === 'Cut') {
      calories = 2000;
      protein = 180;
      carbs = 150;
      maxFat = 60;
    } else if (goal === 'Fitness') {
      calories = 2500;
      protein = 160;
      carbs = 300;
      maxFat = 70;
    } else if (goal === 'Strength') {
      calories = 2800;
      protein = 210;
      carbs = 320;
      maxFat = 75;
    }

    return { calories, protein, carbs, maxFat };
  };

  const handleNext = async () => {
    // Save all values to Firestore
    try {
      await db.collection('users').doc(userId).set({
        name,
        age: `${age.day}-${age.month}-${age.year}`,
        height: heightUnit === 'ft' ? `${Math.floor(height)}' ${((height - Math.floor(height)) * 12).toFixed(0)}"` : `${height.toFixed(1)} cm`,
        weight: weightUnit === 'kg' ? `${weight} kg` : `${weight} lbs`,
        targetWeight: weightUnit === 'kg' ? `${targetWeight} kg` : `${targetWeight} lbs`,
        gender,
        goal,
        calories,
        protein,
        carbs,
        maxFat,
        email,
        phoneNumber
      });

      navigation.navigate("WorkoutPlan", { userId });
    } catch (error) {
      Alert.alert("Error", "There was an error saving your details. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.mainHeading}>Let's get started</Text>
        {!showDetails ? (
          <>
            <Text style={styles.heading}>Select Your Goal</Text>
            <View style={styles.goalContainer}>
              <TouchableOpacity style={[styles.goalBox, goal === 'Bulk' && styles.selectedGoal]} onPress={() => handleGoalSelection('Bulk')}>
                <Text style={styles.goalText}>Bulk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.goalBox, goal === 'Cut' && styles.selectedGoal]} onPress={() => handleGoalSelection('Cut')}>
                <Text style={styles.goalText}>Cut</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.goalBox, goal === 'Fitness' && styles.selectedGoal]} onPress={() => handleGoalSelection('Fitness')}>
                <Text style={styles.goalText}>Fitness</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.goalBox, goal === 'Strength' && styles.selectedGoal]} onPress={() => handleGoalSelection('Strength')}>
                <Text style={styles.goalText}>Strength</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : showResults ? (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <Text style={styles.label}>Caloric Intake (kcal/day)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={calories.toString()}
                onChangeText={(text) => setCalories(parseInt(text))}
              />
              <Text style={styles.label}>Minimum Protein Intake (g/day)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={protein.toString()}
                onChangeText={(text) => setProtein(parseInt(text))}
              />
              <Text style={styles.label}>Carbohydrates (g/day)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={carbs.toString()}
                onChangeText={(text) => setCarbs(parseInt(text))}
              />
              <Text style={styles.label}>Maximum Fat Intake (g/day)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={maxFat.toString()}
                onChangeText={(text) => setMaxFat(parseInt(text))}
              />

              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.formContainer}>
              <TextInput
                placeholder="Name"
                placeholderTextColor="gray"
                style={[styles.input, errors.name && { borderColor: 'red' }]}
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <View style={styles.ageContainer}>
                <Text style={styles.label}>Age</Text>
                <View style={styles.agePickerContainer}>
                  <RNPickerSelect
                    onValueChange={(value) => setAge(prev => ({ ...prev, day: value }))}
                    items={[...Array(31).keys()].map((val) => ({
                      label: (val + 1).toString(),
                      value: (val + 1).toString()
                    }))}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Day', value: null }}
                  />
                  <RNPickerSelect
                    onValueChange={(value) => setAge(prev => ({ ...prev, month: value }))}
                    items={[...Array(12).keys()].map((val) => ({
                      label: (val + 1).toString(),
                      value: (val + 1).toString()
                    }))}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Month', value: null }}
                  />
                  <RNPickerSelect
                    onValueChange={(value) => setAge(prev => ({ ...prev, year: value }))}
                    items={[...Array(100).keys()].map((val) => ({
                      label: (new Date().getFullYear() - val).toString(),
                      value: (new Date().getFullYear() - val).toString()
                    }))}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Year', value: null }}
                  />
                </View>
                {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
              </View>

              <View style={styles.heightContainer}>
                <Text style={styles.label}>Height</Text>
                <View style={styles.unitToggle}>
                  <TouchableOpacity onPress={() => setHeightUnit('cm')}>
                    <Text style={[styles.unitText, heightUnit === 'cm' && styles.selectedUnitText]}>cm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setHeightUnit('ft')}>
                    <Text style={[styles.unitText, heightUnit === 'ft' && styles.selectedUnitText]}>ft</Text>
                  </TouchableOpacity>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={heightUnit === 'ft' ? 8 : 250} // For feet, adjust according to height range
                  step={0.1}
                  value={height}
                  onValueChange={setHeight}
                  minimumTrackTintColor="#1fb28a"
                  maximumTrackTintColor="#d3d3d3"
                />
                <Text style={styles.heightText}>
                  {heightUnit === 'ft' ? `${Math.floor(height)}' ${((height - Math.floor(height)) * 12).toFixed(0)}"` : `${height.toFixed(1)} cm`}
                </Text>
                {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
              </View>

              <View style={styles.weightContainer}>
                <Text style={styles.label}>Weight</Text>
                <View style={styles.unitToggle}>
                  <TouchableOpacity onPress={() => setWeightUnit('lbs')}>
                    <Text style={[styles.unitText, weightUnit === 'lbs' && styles.selectedUnitText]}>lbs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setWeightUnit('kg')}>
                    <Text style={[styles.unitText, weightUnit === 'kg' && styles.selectedUnitText]}>kg</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.weightPickerContainer}>
                  <RNPickerSelect
                    onValueChange={(value) => setWeight(value)}
                    items={[...Array(200).keys()].map((val) => ({
                      label: (val + 1).toString(),
                      value: (val + 1).toString()
                    }))}
                    style={pickerSelectStyles}
                    value={weight}
                    useNativeAndroidPickerStyle={false}
                  />
                </View>
                {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
              </View>

              <View style={styles.weightContainer}>
                <Text style={styles.label}>Target Weight</Text>
                <View style={styles.unitToggle}>
                  <TouchableOpacity onPress={() => setWeightUnit('lbs')}>
                    <Text style={[styles.unitText, weightUnit === 'lbs' && styles.selectedUnitText]}>lbs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setWeightUnit('kg')}>
                    <Text style={[styles.unitText, weightUnit === 'kg' && styles.selectedUnitText]}>kg</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.weightPickerContainer}>
                  <RNPickerSelect
                    onValueChange={(value) => setTargetWeight(value)}
                    items={[...Array(200).keys()].map((val) => ({
                      label: (val + 1).toString(),
                      value: (val + 1).toString()
                    }))}
                    style={pickerSelectStyles}
                    value={targetWeight}
                    useNativeAndroidPickerStyle={false}
                  />
                </View>
                {errors.targetWeight && <Text style={styles.errorText}>{errors.targetWeight}</Text>}
              </View>

              <View style={styles.genderContainer}>
                <Text style={styles.label}>Select Gender</Text>
                <View style={styles.genderSelector}>
                  <TouchableOpacity onPress={() => setGender('Female')} style={styles.genderButton}>
                    <Image source={require('../assets/images/female.png')} style={styles.genderImage} />
                    <Text style={[styles.genderText, gender === 'Female' && styles.selectedGenderText]}>Female</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setGender('Male')} style={styles.genderButton}>
                    <Image source={require('../assets/images/male.png')} style={styles.genderImage} />
                    <Text style={[styles.genderText, gender === 'Male' && styles.selectedGenderText]}>Male</Text>
                  </TouchableOpacity>
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default GoalsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  mainHeading: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  goalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalBox: {
    width: '48%',
    height: 100,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  selectedGoal: {
    backgroundColor: '#0782F9',
  },
  goalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
  },
  ageContainer: {
    marginBottom: 20,
  },
  agePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heightContainer: {
    marginBottom: 20,
  },
  unitToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  unitText: {
    fontSize: 16,
    color: 'grey',
  },
  selectedUnitText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
  },
  heightText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'white',
  },
  weightContainer: {
    marginBottom: 20,
  },
  weightPickerContainer: {
    marginTop: 10,
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    alignItems: 'center',
    flex: 1,
  },
  genderImage: {
    width: 50,
    height: 120,
    marginBottom: 10,
  },
  genderText: {
    fontSize: 16,
    color: 'grey',
  },
  selectedGenderText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#0782F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'white',
    paddingRight: 30,
    backgroundColor: '#2a2a2a',
    marginTop: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'white',
    paddingRight: 30,
    backgroundColor: '#2a2a2a',
  },
};