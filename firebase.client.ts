import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEzuKZKyMCzwAOGe4Pj0gi9wJI1OVuAsg",
  authDomain: "lit-application-portal-e53df.firebaseapp.com",
  projectId: "lit-application-portal-e53df",
  storageBucket: "lit-application-portal-e53df.firebasestorage.app",
  messagingSenderId: "983858968291",
  appId: "1:983858968291:web:d1f2498080a917e081f7d6",
  measurementId: "G-YWEXXYCP4Y",
};

// Debug: Log the actual config values (remove in production)
console.log("Firebase Config Debug:", {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  measurementId: firebaseConfig.measurementId,
});

// Check if any required fields are missing
const requiredFields = ["apiKey", "authDomain", "projectId", "appId"];
const missingFields = requiredFields.filter(
  (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
);

if (missingFields.length > 0) {
  console.error("Missing Firebase config fields:", missingFields);
  throw new Error(
    `Missing Firebase configuration: ${missingFields.join(", ")}`
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (client-only) - only if measurementId is provided
let analytics;
if (firebaseConfig.measurementId) {
  analytics = getAnalytics(app);
}

// Initialize Auth
export const auth = getAuth(app);
export { analytics };
