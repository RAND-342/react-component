import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Realtime Database
// Firebase Configuration 1 (Realtime DB)
const firebaseConfig1 = {
  apiKey: "AIzaSyXXXXXX-DUMMY-KEY-1234567890",
  authDomain: "your-app-1.firebaseapp.com",
  databaseURL: "https://your-app-1-default-rtdb.region.firebasedatabase.app",
  projectId: "your-app-1",
  storageBucket: "your-app-1.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: "G-ABCDEFG123",
};

// Firebase Configuration 2 (Firestore)
const firebaseConfig2 = {
  apiKey: "AIzaSyYYYYYY-DUMMY-KEY-0987654321",
  authDomain: "your-app-2.firebaseapp.com",
  databaseURL: "https://your-app-2-default-rtdb.region.firebasedatabase.app",
  projectId: "your-app-2",
  storageBucket: "your-app-2.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:123456abcdef123456abcd",
  measurementId: "G-HIJKLMN456",
};


// Initialize Firebase apps
const app1 = initializeApp(firebaseConfig1, "app1");
const app2 = initializeApp(firebaseConfig2, "app2");

// Initialize Realtime Database for the first app
const database1 = getDatabase(app1);

// Initialize Firestore for the second app
const db2 = getFirestore(app2);

export { database1, db2 };
