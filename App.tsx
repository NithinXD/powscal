import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator} from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import GoalsScreen from './screens/GoalsScreen';
import SignUpScreen from './screens/SignUpScreen';
import WorkoutPlanScreen from './screens/WorkoutPlanScreen';
import DietPlanScreen from './screens/DietPlanScreen';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen
                options={{ headerShown: false}}
                name={'Login'}
                component={LoginScreen}
            />
            <Stack.Screen
                options={{ headerShown: false}}
                name={"SignUp"}
                component={SignUpScreen}
            />
            <Stack.Screen
                options={{ headerShown: false}}
                name={'WorkoutPlan'}
                component={WorkoutPlanScreen}
            />
            <Stack.Screen
                options={{ headerShown: false}}
                name={'DietPlan'}
                component={DietPlanScreen}
            />
            <Stack.Screen
                options={{ headerShown: false}}
                name={'Goals'}
                component={GoalsScreen}
            />
            
            <Stack.Screen name={'Home'} component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
