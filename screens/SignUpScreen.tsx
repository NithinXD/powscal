// SignUpScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Image, Modal } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const validatePhoneNumber = (number: string) => /^[6-9]\d{9}$/.test(number); // Indian phone numbers
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignUp = async () => {
    setError('');
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCreds = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCreds.user;

      // Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        phoneNumber: phoneNumber,
        createdAt: serverTimestamp()
      });

      // Navigate to another screen
      navigation.replace("Goals", { userId: user.uid, email: user.email, phoneNumber });
    } catch (error) {
      setError("Failed to sign up: " + error.message);
      console.error("Error during sign up: ", error);
    }
  };

  const navigateToLogin = () => {
    setModalVisible(false);
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
      <View style={styles.innerContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.welcome}>WELCOME TO POWERSCALE</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={'Email'}
            style={styles.input}
            value={email}
            onChangeText={text => setEmail(text)}
          />
          <TextInput
            placeholder={'Phone Number'}
            style={styles.input}
            value={phoneNumber}
            onChangeText={text => setPhoneNumber(text)}
            keyboardType="phone-pad"
          />
          <TextInput
            placeholder={'Password'}
            style={styles.input}
            value={password}
            onChangeText={pwd => setPassword(pwd)}
            secureTextEntry
          />
          <TextInput
            placeholder={'Confirm Password'}
            style={styles.input}
            value={confirmPassword}
            onChangeText={pwd => setConfirmPassword(pwd)}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSignUp} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.signUpLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Account Created Successfully!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={navigateToLogin}
            >
              <Text style={styles.modalButtonText}>Login Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    width: '90%',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#adb5bd',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#343a40',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    width: '100%',
    color: 'white',
  },
  buttonContainer: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    color: '#adb5bd',
    fontSize: 16,
  },
  signUpLink: {
    color: '#0782F9',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 30,
    padding: 10,
  },
  footerText: {
    fontSize: 15.7,
    color: '#f8f9fa',
  },
  link: {
    color: '#0077b5',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#0782F9',
    borderRadius: 10,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
