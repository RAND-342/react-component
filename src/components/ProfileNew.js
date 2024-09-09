// // src/ProfilePage.js
// import React, { useState } from "react";

// function ProfilePage() {
//   return <></>;
// }

// export default ProfilePage;

import React from "react";
import { getDatabase, ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBQMJsNkmiAsGLdbAWQOjJ71t7AunbOH4",
  appId: "1:722889361340:web:09e0a8b5eeefc802b68db9",
  messagingSenderId: "722889361340",
  projectId: "newnew-1a703",
  authDomain: "newnew-1a703.firebaseapp.com",
  databaseURL:
    "https://newnew-1a703-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "newnew-1a703.appspot.com",
  measurementId: "G-P7CGZT5H4Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function ProfilePage() {
  // Reference to the data in Firebase
  const dataRef = ref(database, "sos/");
  const [data, loading, error] = useObjectVal(dataRef);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (data) {
    const { image, audio, lat, long, timestamp } = data;

    return (
      <div style={cardStyle}>
        <img src={image} alt="Uploaded" style={imageStyle} />
        <p>Latitude: {lat}</p>
        <p>Longitude: {long}</p>
        <audio controls>
          <source src={audio} type="audio/3gp" />
          Your browser does not support the audio element.
        </audio>
        <p>Timestamp: {new Date(timestamp).toLocaleString()}</p>
      </div>
    );
  }

  return null;
}

// CSS styles
const cardStyle = {
  border: "1px solid #ccc",
  padding: "16px",
  borderRadius: "8px",
  marginBottom: "16px",
  maxWidth: "400px",
  backgroundColor: "#f9f9f9",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  borderRadius: "8px",
};

export default ProfilePage;
