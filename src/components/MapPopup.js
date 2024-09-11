// MapPopup.js
import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Set your Google Maps API key here
const apiKey = "AIzaSyDITnacnurwzQ56YQ9NFvy-9zJlptCp1VU";

const MapPopup = ({ center, onClose }) => {
  if (!center) return null;

  return (
    <div style={popupStyle}>
      <button onClick={onClose} style={closeButtonStyle}>
        ×
      </button>
      <div style={{ height: "400px", width: "100%" }}>
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={{ height: "100%", width: "100%" }}
            center={center}
            zoom={12}
          >
            <Marker position={center} />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

// CSS styles
const popupStyle = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "white",
  zIndex: "1000",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  padding: "10px",
  overflow: "hidden",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "#ff4d4d", // Red background color for the button
  color: "white", // White color for the 'X'
  border: "none",
  fontSize: "24px", // Make the 'X' bigger
  fontWeight: "bold",
  padding: "10px",
  borderRadius: "50%", // Rounded button
  cursor: "pointer",
  zIndex: "1001", // Ensure it appears above the map
  width: "40px",
  height: "40px",
  lineHeight: "0", // To center the 'X' properly
};

export default MapPopup;
