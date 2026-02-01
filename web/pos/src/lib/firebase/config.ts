// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGJDkQ1mZv3cbKiR16nXDACE0fpreEioI",
  authDomain: "nilelink-38954.firebaseapp.com",
  projectId: "nilelink-38954",
  storageBucket: "nilelink-38954.firebasestorage.app",
  messagingSenderId: "864963563712",
  appId: "1:864963563712:web:3bb8aa384cddcfe667dd25",
  measurementId: "G-9HS4GQ3WZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };