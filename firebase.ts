
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

// The Firebase configuration has been restored to a static object to resolve
// persistent issues with environment variable injection on the execution platform.
// These values are based on project details provided in previous interactions,
// ensuring the application can reliably initialize and connect to the correct
// Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyDwfXCfeHBBJS09I5koRXQQF4i-kc5uBm0",
  authDomain: "vouch-663d6.firebaseapp.com",
  projectId: "vouch-663d6",
  storageBucket: "vouch-663d6.appspot.com",
  // messagingSenderId and appId are optional for Auth and Firestore.
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase services
export const auth = getAuth(app);

// Initialize Firestore with advanced settings for connectivity and offline persistence.
export const db = initializeFirestore(app, {
  // This helps bypass network issues (like proxies/firewalls) that block WebSockets
  // by forcing a more compatible HTTP-based connection (long-polling).
  experimentalAutoDetectLongPolling: true,
  // If auto-detection is not enough, you can force it uncommenting the line below.
  // experimentalForceLongPolling: true,
  useFetchStreams: false, // Required for long-polling to work.

  // Enables offline data persistence, allowing the app to work seamlessly
  // during temporary network outages.
  localCache: persistentLocalCache(),
});