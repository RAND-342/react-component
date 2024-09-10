// src/firebase-config.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration object
const newFirebaseConfig = {
  apiKey: "AIzaSyDBQMJsNkmiAsGLdbAWQOjJ71t7AunbOH4",
  authDomain: "http://newnew-1a703.firebaseapp.com",
  projectId: "newnew-1a703",
  storageBucket: "http://newnew-1a703.appspot.com",
  messagingSenderId: "722889361340",
  appId: "1:722889361340:web:09e0a8b5eeefc802b68db9",
};

// Initialize Firebase
const app = initializeApp(newFirebaseConfig);

// Get a Firestore instance
const db = getFirestore(app);

export { db };
