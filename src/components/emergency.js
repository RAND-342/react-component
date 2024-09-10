import React, { useEffect, useState } from "react";
import { db } from "./newFirebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

const EmergencyCard = ({ data }) => {
  return (
    <div style={cardStyle}>
      <h2>Emergency Details</h2>
      <p>
        <strong>Description:</strong> {data.description}
      </p>
      <p>
        <strong>Location Name:</strong> {data.locationName}
      </p>
      <p>
        <strong>Situation:</strong> {data.situation}
      </p>
      <p>
        <strong>Latitude:</strong> {data.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {data.longitude}
      </p>
      <p>
        <strong>User:</strong> Anonymous
      </p>
    </div>
  );
};

// CSS styles for the card
const cardStyle = {
  border: "1px solid #ccc",
  padding: "16px",
  borderRadius: "8px",
  marginBottom: "16px",
  maxWidth: "400px",
  backgroundColor: "#f9f9f9",
};

const Emergency = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "emergencies"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Emergency Data</h1>
      {data.length > 0 ? (
        data.map((item) => <EmergencyCard key={item.id} data={item} />)
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default Emergency;
