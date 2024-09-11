import React, { useEffect, useState } from "react";

const HeatmapIndia = () => {
  const [map, setMap] = useState(null);

  // Random data points for each state with a value between 0 and 100
  const statesData = [
    {
      state: "Maharashtra",
      lat: 19.7515,
      lng: 75.7139,
      value: Math.random() * 100,
    },
    {
      state: "Uttar Pradesh",
      lat: 26.8467,
      lng: 80.9462,
      value: Math.random() * 100,
    },
    { state: "Bihar", lat: 25.0961, lng: 85.3131, value: Math.random() * 100 },
    {
      state: "West Bengal",
      lat: 22.9868,
      lng: 87.855,
      value: Math.random() * 100,
    },
    {
      state: "Tamil Nadu",
      lat: 11.1271,
      lng: 78.6569,
      value: Math.random() * 100,
    },
    {
      state: "Karnataka",
      lat: 15.3173,
      lng: 75.7139,
      value: Math.random() * 100,
    },
    {
      state: "Rajasthan",
      lat: 27.0238,
      lng: 74.2179,
      value: Math.random() * 100,
    },
    {
      state: "Gujarat",
      lat: 22.2587,
      lng: 71.1924,
      value: Math.random() * 100,
    },
    // Add more states as needed
  ];

  useEffect(() => {
    // Initialize Google Map centered on India
    const mapOptions = {
      zoom: 5,
      center: { lat: 22.5937, lng: 78.9629 }, // Center of India
    };

    const newMap = new window.google.maps.Map(
      document.getElementById("map"),
      mapOptions
    );
    setMap(newMap);

    // Prepare data points for the heatmap
    const heatmapData = statesData.map((state) => ({
      location: new window.google.maps.LatLng(state.lat, state.lng),
      weight: state.value, // Assign the random value as the weight
    }));

    // Create the heatmap layer
    const heatmap = new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      radius: 40, // You can adjust the radius for the intensity
    });

    // Add heatmap layer to the map
    heatmap.setMap(newMap);
  }, []);

  return (
    <div>
      <h1>India States Heatmap</h1>
      <div style={mapContainerStyle}>
        <div id="map" style={mapStyle}></div> {/* Map container */}
      </div>
    </div>
  );
};

// Map container styles
const mapContainerStyle = {
  marginBottom: "16px",
};

const mapStyle = {
  width: "100%",
  height: "500px", // You can adjust the height as needed
};

export default HeatmapIndia;
