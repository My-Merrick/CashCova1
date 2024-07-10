import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDoDFBGj3oC5DdDJKulRbpJ45yVtOc0-C0",
  authDomain: "unicoins-55169.firebaseapp.com",
  projectId: "unicoins-55169",
  storageBucket: "unicoins-55169.appspot.com",
  messagingSenderId: "665414836384",
  appId: "1:665414836384:web:9048220dec9fa0666ca9c5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

export {
  auth,
  db,
  functions,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onAuthStateChanged,
};
