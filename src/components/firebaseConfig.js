import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Realtime Database
const firebaseConfig1 = {
  apiKey: "AIzaSyDOJ_tExiOwyB-N7vbi6dV0vo3q1hYGIsM",
  authDomain: "sih-demo-3333b.firebaseapp.com",
  databaseURL:
    "https://sih-demo-3333b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sih-demo-3333b",
  storageBucket: "sih-demo-3333b.appspot.com",
  messagingSenderId: "310085360046",
  appId: "1:310085360046:web:151c8c12761382deab903f",
  measurementId: "G-ZDVPZGT58G",
};

// Firebase configuration for Firestore
const firebaseConfig2 = {
  apiKey: "AIzaSyDBQMJsNkmiAsGLdbAWQOjJ71t7AunbOH4",
  authDomain: "newnew-1a703.firebaseapp.com",
  projectId: "newnew-1a703",
  appId: "1:722889361340:web:09e0a8b5eeefc802b68db9",
  databaseURL:
    "https://newnew-1a703-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "newnew-1a703.appspot.com",
  measurementId: "G-P7CGZT5H4Y",
};

// Initialize Firebase apps
const app1 = initializeApp(firebaseConfig1, "app1");
const app2 = initializeApp(firebaseConfig2, "app2");

// Initialize Realtime Database for the first app
const database1 = getDatabase(app1);

// Initialize Firestore for the second app
const db2 = getFirestore(app2);

export { database1, db2 };
