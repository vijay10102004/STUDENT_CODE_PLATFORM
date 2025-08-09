// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNVHn9wrBKe6eKvLZTQU-9jtsda-j3Rn8",
  authDomain: "student-code-platform.firebaseapp.com",
  projectId: "student-code-platform",
  storageBucket: "student-code-platform.firebasestorage.app",
  messagingSenderId: "643769080519",
  appId: "1:643769080519:web:14a0c32d566ecf8c8f7ce2",
  measurementId: "G-5XGTZKX4WM"
};

// Initialize Firebase
//const analytics = getAnalytics(app);
//ff
const app = initializeApp(firebaseConfig);

// ✅ EXPORTS (must be named like this)
export const auth = getAuth(app);
export const db = getFirestore(app);

