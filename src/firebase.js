// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCR8B9GzbSgLID7pua4RG35N5BZHBQaCM0",
  authDomain: "huellitas-47cc5.firebaseapp.com",
  projectId: "huellitas-47cc5",
  storageBucket: "huellitas-47cc5.firebasestorage.app",
  messagingSenderId: "611648489875",
  appId: "1:611648489875:web:36ee01ff453b792feb0066",
  measurementId: "G-G42H5S44PW"
};

let app = null;
let dbInstance = null;
let authInstance = null;
let googleProviderInstance = null;
let configured = false;

try {
  app = initializeApp(firebaseConfig);
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);
  googleProviderInstance = new GoogleAuthProvider();
  googleProviderInstance.setCustomParameters({ prompt: "select_account" });
  configured = true;
} catch (error) {
  console.error("Error iniciando Firebase:", error);
}

export const isFirebaseConfigured = configured;
export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = googleProviderInstance;