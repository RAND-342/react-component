// DataCard.js
import React from "react";

const DataCard = ({ item, onClick }) => {
  const { image, lat, long, audio, timestamp } = item;
  const formattedTimestamp = new Date(
    timestamp.seconds * 1000
  ).toLocaleString();

  return (
    <div style={cardStyle} onClick={() => onClick(item)}>
      <img src={image} alt="Uploaded" style={imageStyle} />
      <p>
        <strong>Latitude:</strong> {lat}
      </p>
      <p>
        <strong>Longitude:</strong> {long}
      </p>
      <div className="audio">
        <p className="para">
          <strong>Audio</strong>
        </p>
        <a href={audio} download="audio.3gp" style={downloadLinkStyle}>
          <img
            width="30px"
            height="30px"
            src="https://img.icons8.com/material-rounded/48/download.png"
            alt="download"
          />
        </a>
      </div>
      <p>
        <strong>Timestamp:</strong> {formattedTimestamp}
      </p>
    </div>
  );
};

// CSS styles
const cardStyle = {
  border: "1px solid #ccc",
  padding: "16px",
  borderRadius: "8px",
  maxWidth: "350px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  borderRadius: "8px",
};

const downloadLinkStyle = {
  display: "block",
  marginTop: "10px",
  color: "#007bff",
  textDecoration: "none",
};

export default DataCard;
