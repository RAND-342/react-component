// // src/ProfilePage.js
// import React, { useState } from "react";

// function ProfilePage() {
//   return <></>;
// }

// export default ProfilePage;
// src/components/FetchData.js
// src/components/FetchData.js

import React, { useEffect, useState } from "react";
import { db } from "./newFirebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

// Card component for individual data items
const DataCard = ({ item }) => {
  const { image, lat, long, audio, timestamp } = item;
  const formattedTimestamp = new Date(
    timestamp.seconds * 1000
  ).toLocaleString();

  return (
    <div style={cardStyle}>
      <img src={image} alt="Uploaded" style={imageStyle} />
      <p>
        <strong>Latitude:</strong> {lat}
      </p>
      <p>
        <strong>Longitude:</strong> {long}
      </p>
      <audio controls>
        <source src={audio} type="audio/3gp" />
        Your browser does not support the audio element.
      </audio>
      <p>
        <strong>Timestamp:</strong> {formattedTimestamp}
      </p>
    </div>
  );
};

const ProfileNew = () => {
  const [data, setData] = useState([]);

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

  return (
    <div>
      <h1>Firestore Data</h1>
      <div style={containerStyle}>
        {data.map((item) => (
          <DataCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

// CSS styles
const containerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
};

const cardStyle = {
  border: "1px solid #ccc",
  padding: "16px",
  borderRadius: "8px",
  maxWidth: "400px",
  backgroundColor: "#f9f9f9",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const imageStyle = {
  width: "100%",
  height: "auto",
  borderRadius: "8px",
};

export default ProfileNew;

// import React, { useEffect, useState } from "react";
// import { db } from "./newFirebaseConfig.js";
// import { collection, getDocs } from "firebase/firestore";

// const ProfileNew = () => {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "sos"));
//         const fetchedData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setData(fetchedData);
//       } catch (error) {
//         console.error("Error fetching data: ", error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div>
//       <h1>Firestore Data</h1>
//       <ul>
//         {data.map((item) => (
//           <li key={item.id}>{JSON.stringify(item)}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default ProfileNew;

// ProfilePage.js
// import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db2 } from "./firebaseConfig.js"; // Import the Firestore instance

// const ProfilePage = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db2, "sos"));
//         const docsData = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setData(docsData);
//       } catch (err) {
//         console.error("Error fetching documents:", err);
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div>
//       {data.length > 0 ? (
//         data.map((doc) => (
//           <div key={doc.id} style={cardStyle}>
//             <img src={doc.image} alt="Uploaded" style={imageStyle} />
//             <p>Latitude: {doc.lat}</p>
//             <p>Longitude: {doc.long}</p>
//             <audio controls>
//               <source src={doc.audio} type="audio/3gp" />
//               Your browser does not support the audio element.
//             </audio>
//             <p>Timestamp: {new Date(doc.timestamp).toLocaleString()}</p>
//           </div>
//         ))
//       ) : (
//         <p>No data available</p>
//       )}
//     </div>
//   );
// };

// // CSS styles
// const cardStyle = {
//   border: "1px solid #ccc",
//   padding: "16px",
//   borderRadius: "8px",
//   marginBottom: "16px",
//   maxWidth: "400px",
//   backgroundColor: "#f9f9f9",
// };

// const imageStyle = {
//   width: "100%",
//   height: "auto",
//   borderRadius: "8px",
// };

// export default ProfilePage;

// import React, { useEffect, useState } from "react";
// import { doc, getDoc } from "firebase/firestore";
// import { db2 } from "./firebaseConfig.js"; // Import the Firestore instance

// const ProfilePage = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const docRef = doc(db2, "sos", "5fCXDYd6sxIDCvvLlmbQ"); // Replace 'someDocumentId' with the actual document ID
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           setData(docSnap.data());
//         } else {
//           console.log("No such document!");
//         }
//       } catch (err) {
//         setError(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   if (data) {
//     const { image, audio, lat, long, timestamp } = data;

//     return (
//       <div style={cardStyle}>
//         <img src={image} alt="Uploaded" style={imageStyle} />
//         <p>Latitude: {lat}</p>
//         <p>Longitude: {long}</p>
//         <audio controls>
//           <source src={audio} type="audio/3gp" />
//           Your browser does not support the audio element.
//         </audio>
//         <p>Timestamp: {new Date(timestamp).toLocaleString()}</p>
//       </div>
//     );
//   }

//   return null;
// };

// // CSS styles
// const cardStyle = {
//   border: "1px solid #ccc",
//   padding: "16px",
//   borderRadius: "8px",
//   marginBottom: "16px",
//   maxWidth: "400px",
//   backgroundColor: "#f9f9f9",
// };

// const imageStyle = {
//   width: "100%",
//   height: "auto",
//   borderRadius: "8px",
// };

// export default ProfilePage;
