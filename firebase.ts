// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat";
import { getFirestore, collection, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyARCqouC5NnJCo2oPwgUwT4HRv9imixK98",
  authDomain: "powerscale-278ea.firebaseapp.com",
  projectId: "powerscale-278ea",
  storageBucket: "powerscale-278ea.appspot.com",
  messagingSenderId: "876428006055",
  appId: "1:876428006055:ios:118051a6733464c6ae4182",
  measurementId: "G-53282CCM5F"
};

// Initialize Firebase
let app;
if (firebase.apps.length === 0) {
    app = firebase.initializeApp(firebaseConfig);
} else {
    app = firebase.app()
}

const auth = firebase.auth();
const db = firebase.firestore();

export { db, auth, serverTimestamp, collection, addDoc };