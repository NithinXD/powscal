import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, FlatList, ScrollView, Keyboard, TouchableWithoutFeedback } from "react-native";
import RNPickerSelect from 'react-native-picker-select'; // Import the Picker library
import { useNavigation } from "@react-navigation/core";
import { db } from '../firebase'; // Import your Firebase config

const commonMeals = [
  { name: "Oatmeal", description: "A healthy breakfast option", image: "url_to_oatmeal_image" },
  { name: "Grilled Chicken", description: "A high-protein lunch", image: "url_to_chicken_image" },
  { name: "Salad", description: "A light dinner", image: "url_to_salad_image" },
  // ...more meals
];

const DietPlanScreen = ({ route }) => {
  const { userId } = route.params;
  if (!userId) {
    console.error('No userId provided!');
    return null;
  }

  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dietPlan, setDietPlan] = useState({});
  const [currentDay, setCurrentDay] = useState("");
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [mealTime, setMealTime] = useState({ hour: "00", minute: "00" }); // Change state to an object
  const [isAM, setIsAM] = useState(true); // State to toggle AM/PM
  const [mealWeight, setMealWeight] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [currentSummaryDayIndex, setCurrentSummaryDayIndex] = useState(0);
  const [showCustomMealForm, setShowCustomMealForm] = useState(false);
  const [customMealName, setCustomMealName] = useState("");
  const [customMealDescription, setCustomMealDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = useNavigation();
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (option === 'inApp') {
      setCurrentDay(daysOfWeek[0]);
    } else if (option === 'noPlan') {
      navigation.navigate("Home");
    }
  };

  const handleAddMeal = () => {
    setIsModalVisible(true);
  };

  const handleSelectMeal = (meal) => {
    setSelectedMeal(meal);
  };

  const handleSaveMealDetails = () => {
    if (!mealTime.hour || !mealTime.minute || !mealWeight.trim()) {
      alert("Please enter time and weight for the meal.");
      return;
    }

    let { hour, minute } = mealTime;
    hour = hour.padStart(2, '0');
    minute = minute.padStart(2, '0');
    let formattedTime = `${hour}:${minute}`;
    if (!isAM && hour !== "12") {
      formattedTime = `${(parseInt(hour) + 12).toString().padStart(2, '0')}:${minute}`;
    } else if (isAM && hour === "12") {
      formattedTime = `00:${minute}`;
    }

    setSelectedMeals((prev) => [
      ...prev,
      { ...selectedMeal, time: formattedTime, weight: mealWeight, id: Date.now().toString() }
    ]);
    setSelectedMeal(null);
    setMealTime({ hour: "00", minute: "00" });
    setMealWeight("");
    setIsAM(true); // Reset to AM
    setIsModalVisible(false);
  };

  const handleSaveDietDay = () => {
    if (selectedMeals.length) {
      setDietPlan(prev => ({
        ...prev,
        [currentDay]: { meals: selectedMeals },
      }));

      setSelectedMeals([]);
      const nextDayIndex = daysOfWeek.indexOf(currentDay) + 1;
      if (nextDayIndex < daysOfWeek.length) {
        setCurrentDay(daysOfWeek[nextDayIndex]);
      } else {
        setShowSummary(true);
      }
    }
  };

  const handleSavePlan = async () => {
    try {
      await db.collection("dietPlans").add({
        userId,
        plan: dietPlan,
        createdAt: new Date(),
      });
      console.log("Plan saved successfully");
      navigation.navigate("Home"); // Navigate to the next screen after saving
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const navigateSummary = (direction) => {
    if (direction === 'left' && currentSummaryDayIndex > 0) {
      setCurrentSummaryDayIndex(currentSummaryDayIndex - 1);
    } else if (direction === 'right' && currentSummaryDayIndex < Object.keys(dietPlan).length - 1) {
      setCurrentSummaryDayIndex(currentSummaryDayIndex + 1);
    }
  };

  const handleAddCustomMeal = () => {
    setShowCustomMealForm(true);
  };

  const saveCustomMeal = () => {
    if (!customMealName.trim()) {
      alert("Meal name cannot be empty.");
      return;
    }

    const newMeal = { name: customMealName, description: customMealDescription, id: Date.now().toString() };
    setSelectedMeals((prev) => [...prev, newMeal]);
    setCustomMealName("");
    setCustomMealDescription("");
    setShowCustomMealForm(false);
    setIsModalVisible(false);
  };

  const filteredMeals = commonMeals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hours = [...Array(12).keys()].map(num => ({ label: (num + 1).toString().padStart(2, '0'), value: (num + 1).toString().padStart(2, '0') }));
  const minutes = [...Array(60).keys()].map(num => ({ label: num.toString().padStart(2, '0'), value: num.toString().padStart(2, '0') }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Let’s start designing your diet plan</Text>

        {selectedOption === 'inApp' && currentDay && !showSummary && (
          <View style={styles.planContainer}>
            <Text style={styles.planTitle}>Design Your Plan for {currentDay}</Text>
            <TouchableOpacity
              style={styles.addMealButton}
              onPress={handleAddMeal}
            >
              <Text style={styles.buttonText}>Add Meal</Text>
            </TouchableOpacity>
            <FlatList
              data={selectedMeals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.mealItem}>
                  <Text style={styles.mealText}>{item.name} at {item.time} ({item.weight}g)</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveDietDay}
            >
              <Text style={styles.buttonText}>Save and Next Day</Text>
            </TouchableOpacity>
          </View>
        )}

        {showSummary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Your Diet Plan</Text>
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                onPress={() => navigateSummary('left')}
                disabled={currentSummaryDayIndex === 0}
              >
                <Text style={styles.navigationText}>{"<"}</Text>
              </TouchableOpacity>
              <Text style={styles.dayName}>
                {Object.keys(dietPlan)[currentSummaryDayIndex]}
              </Text>
              <TouchableOpacity
                onPress={() => navigateSummary('right')}
                disabled={currentSummaryDayIndex === Object.keys(dietPlan).length - 1}
              >
                <Text style={styles.navigationText}>{">"}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={dietPlan[Object.keys(dietPlan)[currentSummaryDayIndex]].meals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Text style={styles.summaryMeal}>{item.name} at {item.time} ({item.weight}g)</Text>
              )}
            />
            <TouchableOpacity style={styles.savePlanButton} onPress={handleSavePlan}>
              <Text style={styles.buttonText}>Save Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        {!selectedOption && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionSelect('uploadExcel')}>
              <Text style={styles.optionText}>Upload Excel Sheet (Placeholder)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionSelect('inApp')}>
              <Text style={styles.optionText}>Use In-App Feature to Design Diet Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionSelect('noPlan')}>
              <Text style={styles.optionText}>Proceed with No Plan</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {!selectedMeal ? (
                <>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TextInput
                    placeholder="Search Meals"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                  />
                  <FlatList
                    data={[...filteredMeals, { name: "Add Custom Meal", isCustom: true }]}
                    keyExtractor={(item) => item.name + Math.random().toString(36)}
                    renderItem={({ item }) => (
                      item.isCustom ? (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={handleAddCustomMeal}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.modalItem}
                          onPress={() => handleSelectMeal(item)}
                        >
                          <Text style={styles.modalItemText}>{item.name}</Text>
                          <Text style={styles.modalItemDescription}>{item.modalItemDescription}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  />
                </>
              ) : (
                showCustomMealForm ? (
                  <>
                    <TouchableOpacity onPress={() => setShowCustomMealForm(false)} style={styles.backButton}>
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Custom Meal</Text>
                    <TextInput
                      placeholder="Meal Name"
                      value={customMealName}
                      onChangeText={setCustomMealName}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Meal Description"
                      value={customMealDescription}
                      onChangeText={setCustomMealDescription}
                      style={styles.input}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={saveCustomMeal}>
                      <Text style={styles.buttonText}>Save Custom Meal</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={() => setSelectedMeal(null)} style={styles.backButton}>
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Meal Details</Text>
                    <View style={styles.timePickerContainer}>
                      <RNPickerSelect
                        onValueChange={(value) => setMealTime({ ...mealTime, hour: value })}
                        items={hours}
                        style={pickerSelectStyles}
                        value={mealTime.hour}
                        useNativeAndroidPickerStyle={false}
                        placeholder={{ label: "Hour", value: null }}
                      />
                      <Text style={styles.colonText}>:</Text>
                      <RNPickerSelect
                        onValueChange={(value) => setMealTime({ ...mealTime, minute: value })}
                        items={minutes}
                        style={pickerSelectStyles}
                        value={mealTime.minute}
                        useNativeAndroidPickerStyle={false}
                        placeholder={{ label: "Minute", value: null }}
                      />
                      <View style={styles.amPmToggleContainer}>
                        <TouchableOpacity onPress={() => setIsAM(true)} style={[styles.amPmButton, isAM && styles.amPmSelected]}>
                          <Text style={styles.amPmText}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsAM(false)} style={[styles.amPmButton, !isAM && styles.amPmSelected]}>
                          <Text style={styles.amPmText}>PM</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.inputLabel}>Weight (grams)</Text>
                    <TextInput
                      placeholder="Enter weight in grams"
                      value={mealWeight}
                      onChangeText={setMealWeight}
                      style={styles.input}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveMealDetails}>
                      <Text style={styles.buttonText}>Save Meal</Text>
                    </TouchableOpacity>
                  </>
                )
              )}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DietPlanScreen;

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#343a40',
    borderRadius: 10,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#343a40',
    borderRadius: 10,
    color: 'black',
    paddingRight: 30,
  },
});

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
  planTitle: {
    color: 'white',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#343a40',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: 'white',
    marginBottom: 20,
  },
  addMealButton: {
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
  mealItem: {
    paddingVertical: 10,
  },
  mealText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
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
    color: 'black',
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
  summaryMeal: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navigationText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#0782F9',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
    alignSelf: 'flex-start',
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
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  colonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginHorizontal: 5,
  },
  amPmToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 10, // Adjust spacing as needed
  },
  amPmButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#343a40',
    marginHorizontal: 5, // Adjust spacing as needed
  },
  amPmSelected: {
    backgroundColor: '#0782F9',
  },
  amPmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
