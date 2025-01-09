import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration (replace with your project details)
const firebaseConfig = {
  apiKey: "AIzaSyDEzuKZKyMCzwAOGe4Pj0gi9wJI1OVuAsg",
  authDomain: "lit-application-portal-e53df.firebaseapp.com",
  projectId: "lit-application-portal-e53df",
  storageBucket: "lit-application-portal-e53df.firebasestorage.app",
  messagingSenderId: "983858968291",
  appId: "1:983858968291:web:d1f2498080a917e081f7d6",
  measurementId: "G-YWEXXYCP4Y",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Export the Firebase Auth instance
export const auth = getAuth(app);