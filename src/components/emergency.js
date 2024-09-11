import React, { useEffect, useState } from "react";
import { db } from "./newFirebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import userImage from "./user-icon.png";

// Emergency Card Component
const EmergencyCard = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <img src={userImage} alt={userImage} style={iconStyle} />{" "}
        {/* Replace with actual user icon */}
        <h2 style={titleStyle}>{data.username || "Anonymous"}</h2>
      </div>

      <div style={detailsStyle}>
        <div style={columnStyle}>
          <div style={detailItemStyle}>
            <span style={iconTextStyle}>&#x1F4CD;</span>{" "}
            {/* Location pin symbol */}
            <span style={labelStyle}>
              <strong>Location:</strong> {data.locationName}
            </span>
          </div>
          <div style={detailItemStyle}>
            <span style={iconTextStyle}>&#x1F4D8;</span> {/* Book symbol */}
            <span style={labelStyle}>
              <strong>Description:</strong>{" "}
              {data.description || "No description"}
            </span>
          </div>
        </div>
        <div style={columnStyle}>
          <div style={detailItemStyle}>
            <span style={iconTextStyle}>&#x1F4C5;</span> {/* Calendar symbol */}
            <span style={labelStyle}>
              <strong>Date:</strong> {data.date || "No date"}
            </span>
          </div>
          <div style={detailItemStyle}>
            <span style={iconTextStyle}>&#x1F4C8;</span>{" "}
            {/* Chart with upwards trend symbol */}
            <span style={labelStyle}>
              <strong>Situation:</strong> {data.situation || "No situation"}
            </span>
          </div>
        </div>
      </div>

      <div style={showMoreContainerStyle}>
        <span onClick={handleToggleDetails} style={showMoreLinkStyle}>
          {showDetails ? "Hide Details" : "Show More Details"}
        </span>
      </div>

      {showDetails && (
        <div style={additionalDetailsStyle}>
          <p>
            <strong>Latitude:</strong> {data.latitude}
          </p>
          <p>
            <strong>Longitude:</strong> {data.longitude}
          </p>
        </div>
      )}
    </div>
  );
};

// CSS styles for the card
const cardStyle = {
  border: "1px solid #ddd",
  padding: "12px",
  borderRadius: "8px",
  marginBottom: "12px",
  maxWidth: "100%",
  backgroundColor: "#f4f4f4",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "8px",
};

const titleStyle = {
  marginLeft: "6px",
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
};

const title2Style = {
  marginLeft: "6px",
  fontSize: "28px",
  fontWeight: "bold",
  color: "#333",
};

const iconStyle = {
  width: "20px",
  height: "20px",
};

const detailsStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const columnStyle = {
  width: "48%",
};

const detailItemStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "4px",
};

const iconTextStyle = {
  fontSize: "18px",
  marginRight: "6px",
  color: "#555",
};

const labelStyle = {
  fontSize: "14px",
  color: "#444",
};

const showMoreContainerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "8px",
};

const showMoreLinkStyle = {
  fontSize: "14px",
  color: "#007bff",
  textDecoration: "underline",
  cursor: "pointer",
};

const additionalDetailsStyle = {
  marginTop: "8px",
  backgroundColor: "#e9ecef",
  padding: "8px",
  borderRadius: "4px",
};

const Emergency = () => {
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "emergencies"));
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData);
        initMap(fetchedData); // Initialize the map after fetching data
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  // Initialize Google Map
  const initMap = (locations) => {
    const mapOptions = {
      zoom: 10,
      center: {
        lat: locations[0]?.latitude || 0,
        lng: locations[0]?.longitude || 0,
      },
    };

    const newMap = new window.google.maps.Map(
      document.getElementById("map"),
      mapOptions
    );
    setMap(newMap);

    // Plot markers for each location
    locations.forEach((location) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: newMap,
        title: location.locationName,
      });

      // Info Window for each marker
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3>${location.locationName}</h3>
            <p><strong>Situation:</strong> ${location.situation}</p>
            <p><strong>Description:</strong> ${location.description}</p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(newMap, marker);
      });
    });
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={titleContainerStyle}>
        <h1 style={title2Style}>Emergency Data</h1>
      </div>
      <div style={scrollableContainerStyle}>
        {data.length > 0 ? (
          data.map((item) => <EmergencyCard key={item.id} data={item} />)
        ) : (
          <p>No data available</p>
        )}
      </div>
      <div style={mapContainerStyle}>
        <div id="map" style={mapStyle}></div> {/* Map container */}
      </div>
    </div>
  );
};

// Title container style
const titleContainerStyle = {
  display: "flex",
  // justifyContent: "center",
  marginBottom: "16px",
};

const scrollableContainerStyle = {
  width: "100%",
  height: "300px",
  overflowY: "scroll",
  padding: "16px",
  backgroundColor: "#f4f4f4", // Light grey background
};

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  marginTop: "16px",
};

const mapStyle = {
  width: "100%",
  height: "100%",
};

export default Emergency;
