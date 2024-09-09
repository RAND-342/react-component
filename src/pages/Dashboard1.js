import React, { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";

// Firebase configuration
const firebaseConfig = {
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Dashboard = () => {
  const [snapshot, loading, error] = useObjectVal(ref(database, "entries/"));
  const [ipAddresses, setIpAddresses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);

  const fullscreenCanvasRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    if (snapshot) {
      const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
      setIpAddresses(ips);
    }
  }, [snapshot]);

  // Fetch IP addresses from Firebase and set up WebSocket connections
  useEffect(() => {
    if (snapshot) {
      // Trigger popup for emergency conditions
      Object.values(snapshot).forEach((entry) => {
        if (entry.alert === true) {
          console.log("in high");
          setEmergencyMessage(
            `Emergency at ${entry.location}: ${entry.reason}`
          );
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 5000); // Hide popup after 5 seconds
        }
      });
    }
  }, [snapshot]);

  // WebSocket logic (unchanged)
  useEffect(() => {
    const createWebSocket = (url, canvasRef) => {
      let ws;
      let retryTimeout;

      const connectWebSocket = () => {
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log(`Connected to ${url}`);
        };

        ws.onmessage = (event) => {
          const img = new Image();
          img.src = event.data;

          img.onload = () => {
            if (canvasRef && canvasRef.current) {
              const canvas = canvasRef.current;
              const context = canvas.getContext("2d");

              if (context) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
              }
            }
          };
        };

        ws.onclose = () => {
          console.log(`Connection closed for ${url}. Reconnecting...`);
          retryTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error(`Error in WebSocket connection to ${url}:`, error);
          ws.close();
        };
      };

      connectWebSocket();

      return () => {
        if (ws) ws.close();
        if (retryTimeout) clearTimeout(retryTimeout);
      };
    };

    if (ipAddresses.length > 0) {
      const cleanupWs1 = createWebSocket(`ws://${ipAddresses[0]}`, videoRef1);
      const cleanupWs2 = createWebSocket(`ws://${ipAddresses[1]}`, videoRef2);
      const cleanupWs3 = createWebSocket(`ws://${ipAddresses[2]}`, videoRef3);

      return () => {
        cleanupWs1();
        cleanupWs2();
        cleanupWs3();
      };
    }
  }, [ipAddresses]);

  const handleCanvasClick = (canvasRef) => {
    setFullscreenImage(canvasRef);
    setIsModalOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <h1 className="h3 mb-3">
        <strong>Analytics Dashboard</strong>
      </h1>

      <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
        <div className="col d-flex">
          <div className="w-100">
            <div className="row">
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-0">
                    <h5 className="card-title">Users Onboard</h5>
                    <canvas
                      ref={videoRef1}
                      className="canvas-responsive"
                      onClick={() => handleCanvasClick(videoRef1)}
                    ></canvas>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-0">
                    <h5 className="card-title">Total Verified Profiles</h5>
                    <canvas
                      ref={videoRef2}
                      className="canvas-responsive"
                      onClick={() => handleCanvasClick(videoRef2)}
                    ></canvas>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-0">
                    <h5 className="card-title">Subscribers</h5>
                    <canvas
                      ref={videoRef3}
                      className="canvas-responsive"
                      onClick={() => handleCanvasClick(videoRef3)}
                    ></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <canvas ref={fullscreenCanvasRef} className="modal-canvas"></canvas>
            <button className="close-button" onClick={closeFullscreen}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Emergency Popup */}
      {showPopup && (
        <div className="popup-bottom-right">
          <div className="popup-message">
            <strong>Emergency Alert</strong>
            <p>{emergencyMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
// import React, { useEffect, useRef, useState } from "react";
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, onValue } from "firebase/database";
// import { useObjectVal } from "react-firebase-hooks/database";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDOJ_tExiOwyB-N7vbi6dV0vo3q1hYGIsM",
//   authDomain: "sih-demo-3333b.firebaseapp.com",
//   databaseURL:
//     "https://sih-demo-3333b-default-rtdb.asia-southeast1.firebasedatabase.app",

//   projectId: "sih-demo-3333b",

//   storageBucket: "sih-demo-3333b.appspot.com",

//   messagingSenderId: "310085360046",

//   appId: "1:310085360046:web:151c8c12761382deab903f",
//   measurementId: "G-ZDVPZGT58G",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const database = getDatabase(app);

// const Dashboard = () => {
//   const [snapshot, loading, error] = useObjectVal(ref(database, "entries/"));
//   const [ipAddresses, setIpAddresses] = useState([]);

//   const videoRef1 = useRef(null);
//   const videoRef2 = useRef(null);
//   const videoRef3 = useRef(null);

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Fetch IP addresses from Firebase and set up WebSocket connections
//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
//       setIpAddresses(ips);
//     }
//   }, [snapshot]);

//   // WebSocket logic
//   useEffect(() => {
//     const createWebSocket = (url, canvasRef) => {
//       let ws;
//       let retryTimeout;

//       const connectWebSocket = () => {
//         ws = new WebSocket(url);

//         ws.onopen = () => {
//           console.log(`Connected to ${url}`);
//         };

//         ws.onmessage = (event) => {
//           const img = new Image();
//           img.src = event.data;

//           img.onload = () => {
//             if (canvasRef && canvasRef.current) {
//               const canvas = canvasRef.current;
//               const context = canvas.getContext("2d");

//               if (context) {
//                 canvas.width = canvas.offsetWidth;
//                 canvas.height = canvas.offsetHeight;
//                 context.clearRect(0, 0, canvas.width, canvas.height);
//                 context.drawImage(img, 0, 0, canvas.width, canvas.height);
//               }
//             }
//           };
//         };

//         ws.onclose = () => {
//           console.log(`Connection closed for ${url}. Reconnecting...`);
//           retryTimeout = setTimeout(connectWebSocket, 3000);
//         };

//         ws.onerror = (error) => {
//           console.error(`Error in WebSocket connection to ${url}:`, error);
//           ws.close();
//         };
//       };

//       connectWebSocket();

//       return () => {
//         if (ws) ws.close();
//         if (retryTimeout) clearTimeout(retryTimeout);
//       };
//     };

//     if (ipAddresses.length > 0) {
//       const cleanupWs1 = createWebSocket(`ws://${ipAddresses[0]}`, videoRef1);
//       console.log(`ws://${ipAddresses[0]}`);
//       const cleanupWs2 = createWebSocket(`ws://${ipAddresses[1]}`, videoRef2);
//       const cleanupWs3 = createWebSocket(`ws://${ipAddresses[2]}`, videoRef3);

//       return () => {
//         cleanupWs1();
//         cleanupWs2();
//         cleanupWs3();
//       };
//     }
//   }, [ipAddresses]);

//   const handleCanvasClick = (canvasRef) => {
//     setFullscreenImage(canvasRef);
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenImage(null);
//     setIsModalOpen(false);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <>
//       <h1 className="h3 mb-3">
//         <strong>Analytics Dashboard</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Users Onboard</h5>
//                     <canvas
//                       ref={videoRef1}
//                       className="canvas-responsive"
//                       onClick={() => handleCanvasClick(videoRef1)}
//                     ></canvas>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Total Verified Profiles</h5>
//                     <canvas
//                       ref={videoRef2}
//                       className="canvas-responsive"
//                       onClick={() => handleCanvasClick(videoRef2)}
//                     ></canvas>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Subscribers</h5>
//                     <canvas
//                       ref={videoRef3}
//                       className="canvas-responsive"
//                       onClick={() => handleCanvasClick(videoRef3)}
//                     ></canvas>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas ref={fullscreenCanvasRef} className="modal-canvas"></canvas>
//             <button className="close-button" onClick={closeFullscreen}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Dashboard;
