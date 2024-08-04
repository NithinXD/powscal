import { FunctionComponent, useEffect, useState, useRef } from "react";
import { Image, Keyboard, Animated, KeyboardAvoidingView, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { auth } from "../firebase";
import { useNavigation } from "@react-navigation/core";

const LoginScreen: FunctionComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace("Home");
      }
    });

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        Animated.timing(translateY, {
          toValue: -50, // adjust this value as needed
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      unsubscribe();
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [navigation, translateY]);

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(userCrds => {
        const user = userCrds.user;
        console.log('LoggedIn with: ', user?.email);
      })
      .catch(error => alert(error.message));
  };

  const navigateToSignUp = () => {
    navigation.navigate("SignUp"); // Replace "SignUp" with your actual signup page route name
  };

  const Footer = () => {
    const handlePress = () => {
      Linking.openURL('https://in.linkedin.com/in/nithin-deepak-82231a301'); // Replace with your LinkedIn URL
    };

    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Made with 💪 by {''}
          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.link}> Nithin Deepak</Text>
          </TouchableOpacity>
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
      <Animated.View style={[styles.innerContainer]}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.welcome}>WELCOME TO POWERSCALE</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={'Email'}
            style={styles.input}
            value={email}
            onChangeText={text => setEmail(text)}
          />
          <TextInput
            placeholder={'Password'}
            style={styles.input}
            value={password}
            onChangeText={pwd => setPassword(pwd)}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToSignUp}>
              <Text style={styles.signUpLink}>Sign up here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      <Footer />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    width: '90%', // Set width of inner container
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
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
  inputContainer: {
    width: '100%', // Make input container wider
  },
  input: {
    backgroundColor: '#343a40',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    width: '100%', // Ensure text inputs take full width
    color: 'white', // Set the text color to white
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '80%', // Adjust as needed for button width
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#adb5bd',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0782F9',
    width: '100%', // Ensure button takes full width
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  }
});
