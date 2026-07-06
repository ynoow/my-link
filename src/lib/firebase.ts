// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCfkJILmwqksliYFioHnQvJOhVvmImtVxE",
  authDomain: "my-link-94ff9.firebaseapp.com",
  projectId: "my-link-94ff9",
  storageBucket: "my-link-94ff9.firebasestorage.app",
  messagingSenderId: "251060637554",
  appId: "1:251060637554:web:6c338e8a93305577b217eb",
  measurementId: "G-1S87YB3WVP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
