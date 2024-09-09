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
  const [videoRefs, setVideoRefs] = useState([]);

  const fullscreenCanvasRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (snapshot) {
      const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
      setIpAddresses(ips);

      // Dynamically create refs for the number of IP addresses
      const newVideoRefs = ips.map(() => React.createRef());
      setVideoRefs(newVideoRefs);
    }
  }, [snapshot]);

  // Trigger emergency popup for alert conditions
  useEffect(() => {
    if (snapshot) {
      Object.values(snapshot).forEach((entry) => {
        if (entry.alert === true) {
          setEmergencyMessage(
            `Emergency at ${entry.location}: ${entry.reason}`
          );
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 5000);
          x;
        }
      });
    }
  }, [snapshot]);

  // WebSocket logic for each camera
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
      const cleanupFns = ipAddresses.map((ip, index) =>
        createWebSocket(`ws://${ip}`, videoRefs[index])
      );

      // Cleanup WebSocket connections on unmount
      return () => cleanupFns.forEach((cleanup) => cleanup());
    }
  }, [ipAddresses, videoRefs]);

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
        <strong>Camera Feeds</strong>
      </h1>

      <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
        <div className="col d-flex">
          <div className="w-100">
            <div className="row">
              {ipAddresses.map((ip, index) => (
                <div className="col-lg-4 col-md-6 mb-3" key={index}>
                  <div className="card">
                    <div className="card-body p-0">
                      <h5 className="card-title">Camera {index + 1}</h5>
                      <canvas
                        ref={videoRefs[index]}
                        className="canvas-responsive"
                        onClick={() => handleCanvasClick(videoRefs[index])}
                      ></canvas>
                    </div>
                  </div>
                </div>
              ))}
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
// import { getDatabase, ref } from "firebase/database";
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
//   const [showPopup, setShowPopup] = useState(false);
//   const [emergencyMessage, setEmergencyMessage] = useState("");

//   const videoRef1 = useRef(null);
//   const videoRef2 = useRef(null);
//   const videoRef3 = useRef(null);

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
//       setIpAddresses(ips);
//     }
//   }, [snapshot]);

//   // Fetch IP addresses from Firebase and set up WebSocket connections
//   useEffect(() => {
//     if (snapshot) {
//       // Trigger popup for emergency conditions
//       Object.values(snapshot).forEach((entry) => {
//         if (entry.alert === true) {
//           console.log("in high");
//           setEmergencyMessage(
//             `Emergency at ${entry.location}: ${entry.reason}`
//           );
//           setShowPopup(true);
//           setTimeout(() => setShowPopup(false), 5000); // Hide popup after 5 seconds
//         }
//       });
//     }
//   }, [snapshot]);

//   // WebSocket logic (unchanged)
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
//         <strong>Camera Feeds</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Camera 1</h5>
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
//                     <h5 className="card-title">Camera 2</h5>
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
//                     <h5 className="card-title">Camera 3</h5>
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

//       {/* Emergency Popup */}
//       {showPopup && (
//         <div className="popup-bottom-right">
//           <div className="popup-message">
//             <strong>Emergency Alert</strong>
//             <p>{emergencyMessage}</p>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Dashboard;

// // import React, { useEffect, useRef, useState } from "react";
// // import { initializeApp } from "firebase/app";
// // import { getDatabase, ref, onValue } from "firebase/database";
// // import { useObjectVal } from "react-firebase-hooks/database";

// // // Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyDOJ_tExiOwyB-N7vbi6dV0vo3q1hYGIsM",
// //   authDomain: "sih-demo-3333b.firebaseapp.com",
// //   databaseURL:
// //     "https://sih-demo-3333b-default-rtdb.asia-southeast1.firebasedatabase.app",

// //   projectId: "sih-demo-3333b",

// //   storageBucket: "sih-demo-3333b.appspot.com",

// //   messagingSenderId: "310085360046",

// //   appId: "1:310085360046:web:151c8c12761382deab903f",
// //   measurementId: "G-ZDVPZGT58G",
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const database = getDatabase(app);

// // const Dashboard = () => {
// //   const [snapshot, loading, error] = useObjectVal(ref(database, "entries/"));
// //   const [ipAddresses, setIpAddresses] = useState([]);

// //   const videoRef1 = useRef(null);
// //   const videoRef2 = useRef(null);
// //   const videoRef3 = useRef(null);

// //   const fullscreenCanvasRef = useRef(null);
// //   const [fullscreenImage, setFullscreenImage] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);

// //   // Fetch IP addresses from Firebase and set up WebSocket connections
// //   useEffect(() => {
// //     if (snapshot) {
// //       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
// //       setIpAddresses(ips);
// //     }
// //   }, [snapshot]);

// //   // WebSocket logic
// //   useEffect(() => {
// //     const createWebSocket = (url, canvasRef) => {
// //       let ws;
// //       let retryTimeout;

// //       const connectWebSocket = () => {
// //         ws = new WebSocket(url);

// //         ws.onopen = () => {
// //           console.log(`Connected to ${url}`);
// //         };

// //         ws.onmessage = (event) => {
// //           const img = new Image();
// //           img.src = event.data;

// //           img.onload = () => {
// //             if (canvasRef && canvasRef.current) {
// //               const canvas = canvasRef.current;
// //               const context = canvas.getContext("2d");

// //               if (context) {
// //                 canvas.width = canvas.offsetWidth;
// //                 canvas.height = canvas.offsetHeight;
// //                 context.clearRect(0, 0, canvas.width, canvas.height);
// //                 context.drawImage(img, 0, 0, canvas.width, canvas.height);
// //               }
// //             }
// //           };
// //         };

// //         ws.onclose = () => {
// //           console.log(`Connection closed for ${url}. Reconnecting...`);
// //           retryTimeout = setTimeout(connectWebSocket, 3000);
// //         };

// //         ws.onerror = (error) => {
// //           console.error(`Error in WebSocket connection to ${url}:`, error);
// //           ws.close();
// //         };
// //       };

// //       connectWebSocket();

// //       return () => {
// //         if (ws) ws.close();
// //         if (retryTimeout) clearTimeout(retryTimeout);
// //       };
// //     };

// //     if (ipAddresses.length > 0) {
// //       const cleanupWs1 = createWebSocket(`ws://${ipAddresses[0]}`, videoRef1);
// //       console.log(`ws://${ipAddresses[0]}`);
// //       const cleanupWs2 = createWebSocket(`ws://${ipAddresses[1]}`, videoRef2);
// //       const cleanupWs3 = createWebSocket(`ws://${ipAddresses[2]}`, videoRef3);

// //       return () => {
// //         cleanupWs1();
// //         cleanupWs2();
// //         cleanupWs3();
// //       };
// //     }
// //   }, [ipAddresses]);

// //   const handleCanvasClick = (canvasRef) => {
// //     setFullscreenImage(canvasRef);
// //     setIsModalOpen(true);
// //   };

// //   const closeFullscreen = () => {
// //     setFullscreenImage(null);
// //     setIsModalOpen(false);
// //   };

// //   if (loading) return <div>Loading...</div>;
// //   if (error) return <div>Error: {error.message}</div>;

// //   return (
// //     <>
// //       <h1 className="h3 mb-3">
// //         <strong>Analytics Dashboard</strong>
// //       </h1>

// //       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
// //         <div className="col d-flex">
// //           <div className="w-100">
// //             <div className="row">
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Users Onboard</h5>
// //                     <canvas
// //                       ref={videoRef1}
// //                       className="canvas-responsive"
// //                       onClick={() => handleCanvasClick(videoRef1)}
// //                     ></canvas>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Total Verified Profiles</h5>
// //                     <canvas
// //                       ref={videoRef2}
// //                       className="canvas-responsive"
// //                       onClick={() => handleCanvasClick(videoRef2)}
// //                     ></canvas>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Subscribers</h5>
// //                     <canvas
// //                       ref={videoRef3}
// //                       className="canvas-responsive"
// //                       onClick={() => handleCanvasClick(videoRef3)}
// //                     ></canvas>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {isModalOpen && (
// //         <div className="fullscreen-modal" onClick={closeFullscreen}>
// //           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //             <canvas ref={fullscreenCanvasRef} className="modal-canvas"></canvas>
// //             <button className="close-button" onClick={closeFullscreen}>
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // };

// // export default Dashboard;

// // import React, { useEffect, useRef, useState } from "react";
// // import { initializeApp } from "firebase/app";
// // import { getDatabase, ref } from "firebase/database";
// // import { useObjectVal } from "react-firebase-hooks/database";

// // // Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyDOJ_tExiOwyB-N7vbi6dV0vo3q1hYGIsM",
// //   authDomain: "sih-demo-3333b.firebaseapp.com",
// //   databaseURL:
// //     "https://sih-demo-3333b-default-rtdb.asia-southeast1.firebasedatabase.app",
// //   projectId: "sih-demo-3333b",
// //   storageBucket: "sih-demo-3333b.appspot.com",
// //   messagingSenderId: "310085360046",
// //   appId: "1:310085360046:web:151c8c12761382deab903f",
// //   measurementId: "G-ZDVPZGT58G",
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const database = getDatabase(app);

// // const Dashboard = () => {
// //   const [snapshot, loading, error] = useObjectVal(ref(database, "entries/"));
// //   const [ipAddresses, setIpAddresses] = useState([]);
// //   const [showPopup, setShowPopup] = useState(false);
// //   const [emergencyMessage, setEmergencyMessage] = useState("");

// //   const videoRef1 = useRef(null);
// //   const videoRef2 = useRef(null);
// //   const videoRef3 = useRef(null);

// //   const fullscreenCanvasRef = useRef(null);
// //   const [fullscreenImage, setFullscreenImage] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);

// //   // Function to draw on canvas
// //   const drawOnCanvas = (canvasRef, data) => {
// //     const ctx = canvasRef.current.getContext("2d");
// //     const img = new Image();
// //     img.src = `data:image/jpeg;base64,${data}`; // assuming data is base64 encoded
// //     img.onload = () => {
// //       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
// //       ctx.drawImage(img, 0, 0);
// //     };
// //   };

// //   // Fetch IP addresses from Firebase and set up WebSocket connections
// //   useEffect(() => {
// //     if (snapshot) {
// //       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
// //       setIpAddresses(ips);

// //       // Check for emergency_level "High"
// //       Object.values(snapshot).forEach((entry) => {
// //         if (entry.emergency_level === "High") {
// //           setEmergencyMessage(
// //             `Emergency at ${entry.location}: ${entry.reason}`
// //           );
// //           setShowPopup(true);
// //           setTimeout(() => setShowPopup(false), 5000); // Hide after 5 seconds
// //         }
// //       });
// //     }
// //   }, [snapshot]);

// //   // WebSocket logic for video streaming
// //   useEffect(() => {
// //     if (ipAddresses.length > 0) {
// //       ipAddresses.forEach((ip, index) => {
// //         const ws = new WebSocket(`ws://${ip}/video-feed`);

// //         ws.onmessage = (event) => {
// //           if (index === 0) {
// //             drawOnCanvas(videoRef1, event.data);
// //           } else if (index === 1) {
// //             drawOnCanvas(videoRef2, event.data);
// //           } else if (index === 2) {
// //             drawOnCanvas(videoRef3, event.data);
// //           }
// //         };

// //         ws.onerror = (error) => {
// //           console.error("WebSocket error: ", error);
// //         };

// //         ws.onclose = () => {
// //           console.log(`WebSocket closed for ${ip}`);
// //         };
// //       });
// //     }
// //   }, [ipAddresses]);

// //   const handleCanvasClick = (canvasRef) => {
// //     setFullscreenImage(canvasRef);
// //     setIsModalOpen(true);
// //   };

// //   const closeFullscreen = () => {
// //     setFullscreenImage(null);
// //     setIsModalOpen(false);
// //   };

// //   if (loading) return <div>Loading...</div>;
// //   if (error) return <div>Error: {error.message}</div>;

// //   return (
// //     <>
// //       <h1 className="h3 mb-3">
// //         <strong>Analytics Dashboard</strong>
// //       </h1>

// //       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
// //         <div className="col d-flex">
// //           <div className="w-100">
// //             <div className="row">
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Users Onboard</h5>
// //                     <canvas
// //                       ref={videoRef1}
// //                       className="canvas-responsive"
// //                       onClick={() => handleCanvasClick(videoRef1)}
// //                     ></canvas>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Total Verified Profiles</h5>
// //                     <canvas
// //                       ref={videoRef2}
// //                       className="canvas-responsive"
// //                       onClick={() => handleCanvasClick(videoRef2)}
// //                     ></canvas>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Subscribers</h5>
// //                     <canvas
// //                       ref={videoRef3}
// //                       className="canvas-responsive"
// //                       onClick={() => handleCanvasClick(videoRef3)}
// //                     ></canvas>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {isModalOpen && (
// //         <div className="fullscreen-modal" onClick={closeFullscreen}>
// //           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //             <canvas ref={fullscreenCanvasRef} className="modal-canvas"></canvas>
// //             <button className="close-button" onClick={closeFullscreen}>
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       )}

// //       {/* Emergency Popup */}
// //       {showPopup && (
// //         <div className="popup-bottom-right">
// //           <div className="popup-message">
// //             <strong>Emergency Alert</strong>
// //             <p>{emergencyMessage}</p>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // };

// // export default Dashboard;

// // import React, { useEffect, useRef, useState } from "react";

// // function Dashboard() {
// //   // State to handle fullscreen modal visibility
// //   const [fullscreenImage, setFullscreenImage] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);

// //   // Refs for each video canvas
// //   const videoRef1 = useRef(null);
// //   const videoRef2 = useRef(null);
// //   const videoRef3 = useRef(null);

// //   // Ref for the fullscreen canvas
// //   const fullscreenCanvasRef = useRef(null);

// //   // WebSocket logic
// //   useEffect(() => {
// //     const createWebSocket = (url, canvasRef) => {
// //       let ws;
// //       let retryTimeout;

// //       const connectWebSocket = () => {
// //         ws = new WebSocket(url);

// //         ws.onopen = () => {
// //           console.log(`Connected to ${url}`);
// //         };

// //         ws.onmessage = (event) => {
// //           const img = new Image();
// //           img.src = event.data;

// //           img.onload = () => {
// //             const drawImageOnCanvas = (canvasRef) => {
// //               if (canvasRef && canvasRef.current) {
// //                 const canvas = canvasRef.current;
// //                 const context = canvas.getContext("2d");

// //                 if (context) {
// //                   canvas.width = canvas.offsetWidth;
// //                   canvas.height = canvas.offsetHeight;
// //                   context.clearRect(0, 0, canvas.width, canvas.height);
// //                   context.drawImage(img, 0, 0, canvas.width, canvas.height);
// //                 }
// //               }
// //             };

// //             // Draw on individual canvas
// //             drawImageOnCanvas(canvasRef);

// //             // Draw on the fullscreen canvas if open
// //             if (
// //               isModalOpen &&
// //               fullscreenCanvasRef.current &&
// //               canvasRef === fullscreenImage
// //             ) {
// //               const fullscreenCanvas = fullscreenCanvasRef.current;
// //               const fullscreenContext = fullscreenCanvas.getContext("2d");
// //               fullscreenCanvas.width = fullscreenCanvas.offsetWidth;
// //               fullscreenCanvas.height = fullscreenCanvas.offsetHeight;
// //               fullscreenContext.clearRect(
// //                 0,
// //                 0,
// //                 fullscreenCanvas.width,
// //                 fullscreenCanvas.height
// //               );
// //               fullscreenContext.drawImage(
// //                 img,
// //                 0,
// //                 0,
// //                 fullscreenCanvas.width,
// //                 fullscreenCanvas.height
// //               );
// //             }
// //           };
// //         };

// //         ws.onclose = () => {
// //           console.log(`Connection closed for ${url}. Reconnecting...`);
// //           retryTimeout = setTimeout(connectWebSocket, 3000);
// //         };

// //         ws.onerror = (error) => {
// //           console.error(`Error in WebSocket connection to ${url}:`, error);
// //           ws.close();
// //         };
// //       };

// //       connectWebSocket();

// //       return () => {
// //         if (ws) ws.close();
// //         if (retryTimeout) clearTimeout(retryTimeout);
// //       };
// //     };

// //     const cleanupWs1 = createWebSocket("ws://192.168.98.79:6789", videoRef1);
// //     const cleanupWs2 = createWebSocket("ws://192.168.98.91:6777", videoRef2);
// //     const cleanupWs3 = createWebSocket("ws://192.168.98.91:6778", videoRef3);

// //     return () => {
// //       cleanupWs1();
// //       cleanupWs2();
// //       cleanupWs3();
// //     };
// //   }, [isModalOpen, fullscreenImage]);

// //   const handleCanvasClick = (canvasRef) => {
// //     setFullscreenImage(canvasRef);
// //     setIsModalOpen(true);
// //   };

// //   const closeFullscreen = () => {
// //     setFullscreenImage(null);
// //     setIsModalOpen(false);
// //   };

// //   return (
// //     <>
// //       <h1 className="h3 mb-3">
// //         <strong>Analytics Dashboard</strong>
// //       </h1>

// //       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
// //         <div className="col d-flex">
// //           <div className="w-100">
// //             <div className="row">
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Users Onboard</h5>
// //                     <div className="image-container">
// //                       <canvas
// //                         ref={videoRef1}
// //                         className="canvas-responsive"
// //                         onClick={() => handleCanvasClick(videoRef1)}
// //                       ></canvas>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Total Verified Profiles</h5>
// //                     <div className="image-container">
// //                       <canvas
// //                         ref={videoRef2}
// //                         className="canvas-responsive"
// //                         onClick={() => handleCanvasClick(videoRef2)}
// //                       ></canvas>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Subscribers</h5>
// //                     <div className="image-container">
// //                       <canvas
// //                         ref={videoRef3}
// //                         className="canvas-responsive"
// //                         onClick={() => handleCanvasClick(videoRef3)}
// //                       ></canvas>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Fullscreen Modal */}
// //       {isModalOpen && (
// //         <div className="fullscreen-modal" onClick={closeFullscreen}>
// //           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //             <canvas ref={fullscreenCanvasRef} className="modal-canvas"></canvas>
// //             <button className="close-button" onClick={closeFullscreen}>
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// // export default Dashboard;
// // import React, { useEffect, useRef, useState } from "react";

// // function Dashboard() {
// //   // State to handle fullscreen modal visibility and the selected canvas
// //   const [fullscreenCanvas, setFullscreenCanvas] = useState(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);

// //   // Refs for each video canvas
// //   const videoRef1 = useRef(null);
// //   const videoRef2 = useRef(null);
// //   const videoRef3 = useRef(null);

// //   // WebSocket logic
// //   useEffect(() => {
// //     const createWebSocket = (url, canvasRef) => {
// //       let ws;
// //       let retryTimeout;

// //       const connectWebSocket = () => {
// //         ws = new WebSocket(url);

// //         ws.onopen = () => {
// //           console.log(`Connected to ${url}`);
// //         };

// //         ws.onmessage = (event) => {
// //           const img = new Image();
// //           img.src = event.data;

// //           img.onload = () => {
// //             if (canvasRef && canvasRef.current) {
// //               const canvas = canvasRef.current;
// //               const context = canvas.getContext("2d");

// //               if (context) {
// //                 canvas.width = canvas.offsetWidth;
// //                 canvas.height = canvas.offsetHeight;

// //                 context.clearRect(0, 0, canvas.width, canvas.height);
// //                 context.drawImage(img, 0, 0, canvas.width, canvas.height);
// //               } else {
// //                 console.error("Failed to get canvas context for URL:", url);
// //               }
// //             } else {
// //               console.error(
// //                 "Canvas reference is null or not available for URL:",
// //                 url
// //               );
// //             }
// //           };
// //         };

// //         ws.onclose = () => {
// //           console.log(`Connection closed for ${url}. Reconnecting...`);
// //           retryTimeout = setTimeout(connectWebSocket, 3000);
// //         };

// //         ws.onerror = (error) => {
// //           console.error(`Error in WebSocket connection to ${url}:, error`);
// //           ws.close();
// //         };
// //       };

// //       connectWebSocket();

// //       return () => {
// //         if (ws) ws.close();
// //         if (retryTimeout) clearTimeout(retryTimeout);
// //       };
// //     };

// //     const cleanupWs1 = createWebSocket("ws://192.168.98.79:6789", videoRef1);
// //     const cleanupWs2 = createWebSocket("ws://192.168.98.91:6777", videoRef2);
// //     const cleanupWs3 = createWebSocket("ws://192.168.98.91:6778", videoRef3);

// //     return () => {
// //       cleanupWs1();
// //       cleanupWs2();
// //       cleanupWs3();
// //     };
// //   }, []);

// //   const handleCanvasClick = (canvasRef) => {
// //     setFullscreenCanvas(canvasRef);
// //     setIsModalOpen(true);
// //   };

// //   const closeFullscreen = () => {
// //     setFullscreenCanvas(null);
// //     setIsModalOpen(false);
// //   };

// //   return (
// //     <>
// //       <h1 className="h3 mb-3">
// //         <strong>Analytics Dashboard</strong>
// //       </h1>

// //       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
// //         <div className="col d-flex">
// //           <div className="w-100">
// //             <div className="row">
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Users Onboard</h5>
// //                     <div className="image-container">
// //                       <canvas
// //                         ref={videoRef1}
// //                         className="canvas-responsive"
// //                         onClick={() => handleCanvasClick(videoRef1)}
// //                       ></canvas>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Total Verified Profiles</h5>
// //                     <div className="image-container">
// //                       <canvas
// //                         ref={videoRef2}
// //                         className="canvas-responsive"
// //                         onClick={() => handleCanvasClick(videoRef2)}
// //                       ></canvas>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Subscribers</h5>
// //                     <div className="image-container">
// //                       <canvas
// //                         ref={videoRef3}
// //                         className="canvas-responsive"
// //                         onClick={() => handleCanvasClick(videoRef3)}
// //                       ></canvas>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="col-lg-4 col-md-6 mb-3">
// //                 <div className="card">
// //                   <div className="card-body p-0">
// //                     <h5 className="card-title">Orders</h5>
// //                     <div className="image-container">
// //                       <img
// //                         src={
// //                           "https://h5p.org/sites/default/files/h5p/content/1209180/images/file-6113d5f8845dc.jpeg"
// //                         }
// //                         height={"300"}
// //                         width={"100%"}
// //                         alt="Orders"
// //                         className="dashboard-image"
// //                       />
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Fullscreen Modal */}
// //       {fullscreenCanvas && (
// //         <div className="fullscreen-modal" onClick={closeFullscreen}>
// //           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
// //             <canvas ref={fullscreenCanvas} className="modal-canvas"></canvas>
// //             <button className="close-button" onClick={closeFullscreen}>
// //               Close
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </>
// //   );
// // }

// // export default Dashboard;
