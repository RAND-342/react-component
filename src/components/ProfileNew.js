import React, { useEffect, useState } from "react";
import { db } from "./newFirebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import DataCard from "./DataCard"; // Assuming you have the DataCard component in a separate file
import MapPopup from "./MapPopup"; // Import the MapPopup component

const ProfileNew = () => {
  const [data, setData] = useState([]);
  const [mapCenter, setMapCenter] = useState(null); // Null until a card is clicked
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sos"));
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

  const handleCardClick = (item) => {
    setMapCenter({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.long),
    });
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
    setMapCenter(null);
  };

  return (
    <div>
      <h1>
        SOS{" "}
        <script
          src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
          type="module"
        ></script>
        <dotlottie-player
          src="https://lottie.host/e6d78ced-2e8b-4a65-b9aa-45092351a769/B7Ebsca9S9.json"
          background="transparent"
          speed="1"
          loop
          autoplay
          style={{ width: "300px", height: "300px" }}
        ></dotlottie-player>
      </h1>
      <div style={containerStyle}>
        {data.map((item) => (
          <DataCard key={item.id} item={item} onClick={handleCardClick} />
        ))}
      </div>

      {showMap && <MapPopup center={mapCenter} onClose={handleCloseMap} />}
    </div>
  );
};

// CSS styles
const containerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
};

export default ProfileNew;
