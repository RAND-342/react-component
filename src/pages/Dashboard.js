import React, { useEffect, useRef, useState } from "react";
import { ref, onValue, set } from "firebase/database"; // Import 'set' to update Firebase
import { database1 } from "../components/firebaseConfig.js"; // Import the Realtime Database instance

const Dashboard = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [ipAddresses, setIpAddresses] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [showOrangeAlert, setShowOrangeAlert] = useState(false); // New state for orange alerts
  const [orangeAlertMessage, setOrangeAlertMessage] = useState(""); // New state for orange alert messages
  const [videoRefs, setVideoRefs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({}); // Track connection status
  const [cameraCounts, setCameraCounts] = useState({}); // State to store man and woman counts for each camera

  const fullscreenCanvasRef = useRef(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullscreenIP, setFullscreenIP] = useState(""); // New state to store IP address

  useEffect(() => {
    const snapshotRef = ref(database1, "entries/");
    const unsubscribe = onValue(snapshotRef, (snapshot) => {
      const data = snapshot.val();
      setSnapshot(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (snapshot) {
      const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
      const counts = {};

      Object.values(snapshot).forEach((entry) => {
        const ip = entry["IP-port"];
        counts[ip] = {
          men_count: entry.men_count || 0,
          women_count: entry.women_count || 0,
        };

        if (!ipAddresses.includes(ip)) {
          setIpAddresses((prev) => [...prev, ip]);
          setVideoRefs((prev) => [...prev, React.createRef()]);
        }
      });

      setCameraCounts(counts);
    }
  }, [snapshot]);

  useEffect(() => {
    if (snapshot) {
      Object.values(snapshot).forEach((entry) => {
        if (entry.alert === true) {
          setEmergencyMessage(
            `Emergency at ${entry.location}: ${entry.reason}`
          );
          setShowPopup(true);

          // Update the alert field to false after 5 seconds
          const entryRef = ref(database1, `entries/${entry.id}`); // Reference to the specific entry
          setTimeout(() => {
            setShowPopup(false);
            // Set the alert field to false
          }, 5000);
        }

        // Check for orange alert condition
        const { men_count, women_count, location } = entry;
        if (men_count - women_count >= 5 && women_count >= 1) {
          setOrangeAlertMessage(
            `Alert: High men count detected at ${location}.`
          );
          setShowOrangeAlert(true);
          setTimeout(() => setShowOrangeAlert(false), 5000);
        }
      });
    }
  }, [snapshot]);

  useEffect(() => {
    const createWebSocket = (url, canvasRef, ip) => {
      let ws;
      let retryTimeout;

      const connectWebSocket = () => {
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log(`Connected to ${url}`);
          setConnectionStatus((prevStatus) => ({
            ...prevStatus,
            [ip]: true,
          })); // Set connection status to true
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

          // Set connection status to false and reset men_count and women_count to 0
          setConnectionStatus((prevStatus) => ({
            ...prevStatus,
            [ip]: false,
          }));

          setCameraCounts((prevCounts) => ({
            ...prevCounts,
            [ip]: { men_count: 0, women_count: 0 }, // Reset counts to 0
          }));

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
        createWebSocket(`ws://${ip}`, videoRefs[index], ip)
      );

      return () => cleanupFns.forEach((cleanup) => cleanup());
    }
  }, [ipAddresses, videoRefs]);

  const handleCanvasClick = (canvasRef, ip) => {
    setFullscreenImage(canvasRef);
    setFullscreenIP(ip); // Set the IP address when opening fullscreen modal
    setIsModalOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    setFullscreenIP(""); // Reset the IP when closing fullscreen modal
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (fullscreenImage && isModalOpen) {
      const updateFullscreenCanvas = () => {
        const fullscreenCanvas = fullscreenCanvasRef.current;
        const fullscreenContext = fullscreenCanvas?.getContext("2d"); // Ensure canvas exists before getting context
        const clickedCanvas = fullscreenImage.current;

        if (fullscreenContext && clickedCanvas) {
          fullscreenCanvas.width = clickedCanvas.width;
          fullscreenCanvas.height = clickedCanvas.height;

          // Continuously copy the content from the clicked canvas to the fullscreen canvas
          fullscreenContext.drawImage(
            clickedCanvas,
            0,
            0,
            fullscreenCanvas.width,
            fullscreenCanvas.height
          );

          // Request the next frame if the modal is still open
          if (isModalOpen) {
            requestAnimationFrame(updateFullscreenCanvas);
          }
        }
      };

      updateFullscreenCanvas(); // Start updating the canvas
    }
  }, [fullscreenImage, isModalOpen]);

  if (!snapshot) return <div>Loading...</div>;

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
                      <h5 className="card-title">Camera {ip}</h5>
                      {/* Name camera with IP */}
                      <canvas
                        ref={videoRefs[index]}
                        className="canvas-responsive"
                        onClick={() => handleCanvasClick(videoRefs[index], ip)} // Pass the IP address on click
                      ></canvas>
                      {!connectionStatus[ip] && <p>Connecting...</p>}
                      {cameraCounts[ip] && (
                        <p className="counts">
                          Men: {cameraCounts[ip].men_count} | Women:{" "}
                          {cameraCounts[ip].women_count}
                        </p>
                      )}
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
          <div className="fullscreen-ip">IP Address: {fullscreenIP}</div>
          <button className="close-button" onClick={closeFullscreen}>
            Close
          </button>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <canvas
              ref={fullscreenCanvasRef}
              className="modal-canvas1"
            ></canvas>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-bottom-right">
          <div className="popup-message">
            <strong>Emergency Alert</strong>
            <p>{emergencyMessage}</p>
          </div>
        </div>
      )}

      {showOrangeAlert && (
        <div className="popup-bottom-right1 orange-alert">
          <div className="popup-message">
            <strong>High Men Count Alert</strong>
            <p>{orangeAlertMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

// import React, { useEffect, useRef, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { database1 } from "../components/firebaseConfig.js"; // Import the Realtime Database instance

// const Dashboard = () => {
//   const [snapshot, setSnapshot] = useState(null);
//   const [ipAddresses, setIpAddresses] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [emergencyMessage, setEmergencyMessage] = useState("");
//   const [videoRefs, setVideoRefs] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState({}); // Track connection status
//   const [cameraCounts, setCameraCounts] = useState({}); // New state to store man and woman counts for each camera

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [fullscreenIP, setFullscreenIP] = useState(""); // New state to store IP address

//   useEffect(() => {
//     const snapshotRef = ref(database1, "entries/");
//     const unsubscribe = onValue(snapshotRef, (snapshot) => {
//       const data = snapshot.val();
//       setSnapshot(data);
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
//       const counts = {};

//       Object.values(snapshot).forEach((entry) => {
//         const ip = entry["IP-port"];
//         counts[ip] = {
//           men_count: entry.men_count || 0,
//           women_count: entry.women_count || 0,
//         };

//         if (!ipAddresses.includes(ip)) {
//           setIpAddresses((prev) => [...prev, ip]);
//           setVideoRefs((prev) => [...prev, React.createRef()]);
//         }
//       });

//       setCameraCounts(counts);
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     if (snapshot) {
//       Object.values(snapshot).forEach((entry) => {
//         if (entry.alert === true) {
//           setEmergencyMessage(
//             `Emergency at ${entry.location}: ${entry.reason}`
//           );
//           setShowPopup(true);
//           setTimeout(() => setShowPopup(false), 5000);
//         }
//       });
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     const createWebSocket = (url, canvasRef, ip) => {
//       let ws;
//       let retryTimeout;

//       const connectWebSocket = () => {
//         ws = new WebSocket(url);

//         ws.onopen = () => {
//           console.log(`Connected to ${url}`);
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: true,
//           })); // Set connection status to true
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
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: false,
//           })); // Set connection status to false when disconnected
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
//       const cleanupFns = ipAddresses.map((ip, index) =>
//         createWebSocket(`ws://${ip}`, videoRefs[index], ip)
//       );

//       return () => cleanupFns.forEach((cleanup) => cleanup());
//     }
//   }, [ipAddresses, videoRefs]);

//   const handleCanvasClick = (canvasRef, ip) => {
//     setFullscreenImage(canvasRef);
//     setFullscreenIP(ip); // Set the IP address when opening fullscreen modal
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenImage(null);
//     setFullscreenIP(""); // Reset the IP when closing fullscreen modal
//     setIsModalOpen(false);
//   };

//   useEffect(() => {
//     if (fullscreenImage && isModalOpen) {
//       const updateFullscreenCanvas = () => {
//         const fullscreenCanvas = fullscreenCanvasRef.current;
//         const fullscreenContext = fullscreenCanvas?.getContext("2d"); // Ensure canvas exists before getting context
//         const clickedCanvas = fullscreenImage.current;

//         if (fullscreenContext && clickedCanvas) {
//           fullscreenCanvas.width = clickedCanvas.width;
//           fullscreenCanvas.height = clickedCanvas.height;

//           // Continuously copy the content from the clicked canvas to the fullscreen canvas
//           fullscreenContext.drawImage(
//             clickedCanvas,
//             0,
//             0,
//             fullscreenCanvas.width,
//             fullscreenCanvas.height
//           );

//           // Request the next frame if the modal is still open
//           if (isModalOpen) {
//             requestAnimationFrame(updateFullscreenCanvas);
//           }
//         }
//       };

//       updateFullscreenCanvas(); // Start updating the canvas
//     }
//   }, [fullscreenImage, isModalOpen]);

//   if (!snapshot) return <div>Loading...</div>;

//   return (
//     <>
//       <h1 className="h3 mb-3">
//         <strong>Camera Feeds</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               {ipAddresses.map((ip, index) => (
//                 <div className="col-lg-4 col-md-6 mb-3" key={index}>
//                   <div className="card">
//                     <div className="card-body p-0">
//                       <h5 className="card-title">Camera {ip}</h5>
//                       {/* Name camera with IP */}
//                       <canvas
//                         ref={videoRefs[index]}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRefs[index], ip)} // Pass the IP address on click
//                       ></canvas>
//                       {!connectionStatus[ip] && <p>Connecting...</p>}
//                       {cameraCounts[ip] && (
//                         <p className="counts">
//                           Men: {cameraCounts[ip].men_count} | Women:{" "}
//                           {cameraCounts[ip].women_count}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="fullscreen-ip">IP Address: {fullscreenIP}</div>
//           <button className="close-button" onClick={closeFullscreen}>
//             Close
//           </button>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas
//               ref={fullscreenCanvasRef}
//               className="modal-canvas1"
//             ></canvas>
//           </div>
//         </div>
//       )}

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

// import React, { useEffect, useRef, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { database1 } from "../components/firebaseConfig.js"; // Import the Realtime Database instance

// const Dashboard = () => {
//   const [snapshot, setSnapshot] = useState(null);
//   const [ipAddresses, setIpAddresses] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [emergencyMessage, setEmergencyMessage] = useState("");
//   const [videoRefs, setVideoRefs] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState({}); // Track connection status
//   const [cameraCounts, setCameraCounts] = useState({}); // New state to store man and woman counts for each camera

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [fullscreenIP, setFullscreenIP] = useState(""); // New state to store IP address

//   useEffect(() => {
//     const snapshotRef = ref(database1, "entries/");
//     const unsubscribe = onValue(snapshotRef, (snapshot) => {
//       const data = snapshot.val();
//       setSnapshot(data);
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);

//       // Update ipAddresses incrementally
//       ips.forEach((ip) => {
//         if (!ipAddresses.includes(ip)) {
//           setIpAddresses((prev) => [...prev, ip]);
//           setVideoRefs((prev) => [...prev, React.createRef()]);

//           // Get the man_count and woman_count for the current IP
//           const entry = Object.values(snapshot).find(
//             (entry) => entry["IP-port"] === ip
//           );
//           if (entry) {
//             setCameraCounts((prev) => ({
//               ...prev,
//               [ip]: {
//                 men_count: entry.men_count || 0,
//                 women_count: entry.women_count || 0,
//               },
//             }));
//           }
//         }
//       });
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     if (snapshot) {
//       Object.values(snapshot).forEach((entry) => {
//         if (entry.alert === true) {
//           setEmergencyMessage(
//             `Emergency at ${entry.location}: ${entry.reason}`
//           );
//           setShowPopup(true);
//           setTimeout(() => setShowPopup(false), 5000);
//         }
//       });
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     const createWebSocket = (url, canvasRef, ip) => {
//       let ws;
//       let retryTimeout;

//       const connectWebSocket = () => {
//         ws = new WebSocket(url);

//         ws.onopen = () => {
//           console.log(`Connected to ${url}`);
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: true,
//           })); // Set connection status to true
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
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: false,
//           })); // Set connection status to false when disconnected
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
//       const cleanupFns = ipAddresses.map((ip, index) =>
//         createWebSocket(`ws://${ip}`, videoRefs[index], ip)
//       );

//       return () => cleanupFns.forEach((cleanup) => cleanup());
//     }
//   }, [ipAddresses, videoRefs]);

//   const handleCanvasClick = (canvasRef, ip) => {
//     setFullscreenImage(canvasRef);
//     setFullscreenIP(ip); // Set the IP address when opening fullscreen modal
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenImage(null);
//     setFullscreenIP(""); // Reset the IP when closing fullscreen modal
//     setIsModalOpen(false);
//   };

//   useEffect(() => {
//     if (fullscreenImage && isModalOpen) {
//       const updateFullscreenCanvas = () => {
//         const fullscreenCanvas = fullscreenCanvasRef.current;
//         const fullscreenContext = fullscreenCanvas?.getContext("2d"); // Ensure canvas exists before getting context
//         const clickedCanvas = fullscreenImage.current;

//         if (fullscreenContext && clickedCanvas) {
//           fullscreenCanvas.width = clickedCanvas.width;
//           fullscreenCanvas.height = clickedCanvas.height;

//           // Continuously copy the content from the clicked canvas to the fullscreen canvas
//           fullscreenContext.drawImage(
//             clickedCanvas,
//             0,
//             0,
//             fullscreenCanvas.width,
//             fullscreenCanvas.height
//           );

//           // Request the next frame if the modal is still open
//           if (isModalOpen) {
//             requestAnimationFrame(updateFullscreenCanvas);
//           }
//         }
//       };

//       updateFullscreenCanvas(); // Start updating the canvas
//     }
//   }, [fullscreenImage, isModalOpen]);

//   if (!snapshot) return <div>Loading...</div>;

//   return (
//     <>
//       <h1 className="h3 mb-3">
//         <strong>Camera Feeds</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               {ipAddresses.map((ip, index) => (
//                 <div className="col-lg-4 col-md-6 mb-3" key={index}>
//                   <div className="card">
//                     <div className="card-body p-0">
//                       <h5 className="card-title">Camera {ip}</h5>{" "}
//                       {/* Name camera with IP */}
//                       <canvas
//                         ref={videoRefs[index]}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRefs[index], ip)} // Pass the IP address on click
//                       ></canvas>
//                       {!connectionStatus[ip] && <p>Connecting...</p>}
//                       {cameraCounts[ip] && (
//                         <p className="counts">
//                           Men: {cameraCounts[ip].men_count} | Women:{" "}
//                           {cameraCounts[ip].women_count}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="fullscreen-ip">IP Address: {fullscreenIP}</div>{" "}
//           <button className="close-button" onClick={closeFullscreen}>
//             Close
//           </button>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas
//               ref={fullscreenCanvasRef}
//               className="modal-canvas1"
//             ></canvas>
//           </div>
//         </div>
//       )}

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

// import React, { useEffect, useRef, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { database1 } from "../components/firebaseConfig.js"; // Import the Realtime Database instance

// const Dashboard = () => {
//   const [snapshot, setSnapshot] = useState(null);
//   const [ipAddresses, setIpAddresses] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [emergencyMessage, setEmergencyMessage] = useState("");
//   const [videoRefs, setVideoRefs] = useState([]);
//   const [connectionStatus, setConnectionStatus] = useState({}); // Track connection status

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [fullscreenIP, setFullscreenIP] = useState(""); // New state to store IP address

//   useEffect(() => {
//     const snapshotRef = ref(database1, "entries/");
//     const unsubscribe = onValue(snapshotRef, (snapshot) => {
//       const data = snapshot.val();
//       setSnapshot(data);
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);

//       // Update ipAddresses incrementally
//       ips.forEach((ip) => {
//         if (!ipAddresses.includes(ip)) {
//           setIpAddresses((prev) => [...prev, ip]);
//           setVideoRefs((prev) => [...prev, React.createRef()]);
//         }
//       });
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     if (snapshot) {
//       Object.values(snapshot).forEach((entry) => {
//         if (entry.alert === true) {
//           setEmergencyMessage(
//             `Emergency at ${entry.location}: ${entry.reason}`
//           );
//           setShowPopup(true);
//           setTimeout(() => setShowPopup(false), 5000);
//         }
//       });
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     const createWebSocket = (url, canvasRef, ip) => {
//       let ws;
//       let retryTimeout;

//       const connectWebSocket = () => {
//         ws = new WebSocket(url);

//         ws.onopen = () => {
//           console.log(`Connected to ${url}`);
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: true,
//           })); // Set connection status to true
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
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: false,
//           })); // Set connection status to false when disconnected
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
//       const cleanupFns = ipAddresses.map((ip, index) =>
//         createWebSocket(`ws://${ip}`, videoRefs[index], ip)
//       );

//       return () => cleanupFns.forEach((cleanup) => cleanup());
//     }
//   }, [ipAddresses, videoRefs]);

//   const handleCanvasClick = (canvasRef, ip) => {
//     setFullscreenImage(canvasRef);
//     setFullscreenIP(ip); // Set the IP address when opening fullscreen modal
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenImage(null);
//     setFullscreenIP(""); // Reset the IP when closing fullscreen modal
//     setIsModalOpen(false);
//   };

//   useEffect(() => {
//     if (fullscreenImage && isModalOpen) {
//       const updateFullscreenCanvas = () => {
//         const fullscreenCanvas = fullscreenCanvasRef.current;
//         const fullscreenContext = fullscreenCanvas?.getContext("2d"); // Ensure canvas exists before getting context
//         const clickedCanvas = fullscreenImage.current;

//         if (fullscreenContext && clickedCanvas) {
//           fullscreenCanvas.width = clickedCanvas.width;
//           fullscreenCanvas.height = clickedCanvas.height;

//           // Continuously copy the content from the clicked canvas to the fullscreen canvas
//           fullscreenContext.drawImage(
//             clickedCanvas,
//             0,
//             0,
//             fullscreenCanvas.width,
//             fullscreenCanvas.height
//           );

//           // Request the next frame if the modal is still open
//           if (isModalOpen) {
//             requestAnimationFrame(updateFullscreenCanvas);
//           }
//         }
//       };

//       updateFullscreenCanvas(); // Start updating the canvas
//     }
//   }, [fullscreenImage, isModalOpen]);

//   if (!snapshot) return <div>Loading...</div>;

//   return (
//     <>
//       <h1 className="h3 mb-3">
//         <strong>Camera Feeds</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               {ipAddresses.map((ip, index) => (
//                 <div className="col-lg-4 col-md-6 mb-3" key={index}>
//                   <div className="card">
//                     <div className="card-body p-0">
//                       <h5 className="card-title">Camera {ip}</h5>{" "}
//                       {/* Name camera with IP */}
//                       <canvas
//                         ref={videoRefs[index]}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRefs[index], ip)} // Pass the IP address on click
//                       ></canvas>
//                       {!connectionStatus[ip] && <p>Connecting...</p>}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="fullscreen-ip">IP Address: {fullscreenIP}</div>{" "}
//           <button className="close-button" onClick={closeFullscreen}>
//             Close
//           </button>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas
//               ref={fullscreenCanvasRef}
//               className="modal-canvas1"
//             ></canvas>
//           </div>
//         </div>
//       )}

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

// import React, { useEffect, useRef, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { database1 } from "../components/firebaseConfig.js"; // Import the Realtime Database instance

// const Dashboard = () => {
//   const [snapshot, setSnapshot] = useState(null);
//   const [ipAddresses, setIpAddresses] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [emergencyMessage, setEmergencyMessage] = useState("");
//   const [videoRefs, setVideoRefs] = useState({});
//   const [connectionStatus, setConnectionStatus] = useState({}); // Track connection status
//   const [reconnectAttempts, setReconnectAttempts] = useState({}); // Track reconnect attempts

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [fullscreenIP, setFullscreenIP] = useState(""); // New state to store IP address

//   const MAX_RECONNECT_ATTEMPTS = 5; // Number of reconnection attempts before removing the card
//   const RECONNECT_DELAY = 3000; // Delay between reconnection attempts (in milliseconds)
//   const REMOVE_DELAY = 10000; // Time to keep the card visible after connection loss

//   // Fetch snapshot data
//   useEffect(() => {
//     const snapshotRef = ref(database1, "entries/");
//     const unsubscribe = onValue(snapshotRef, (snapshot) => {
//       const data = snapshot.val();
//       setSnapshot(data);
//     });

//     return () => unsubscribe();
//   }, []);

//   // Update IP addresses and create refs for each IP
//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
//       setIpAddresses(ips);

//       const newVideoRefs = {};
//       ips.forEach((ip) => {
//         if (!videoRefs[ip]) {
//           newVideoRefs[ip] = React.createRef(); // Only create a new ref if it doesn't already exist
//         }
//       });
//       setVideoRefs((prevRefs) => ({ ...prevRefs, ...newVideoRefs }));
//     }
//   }, [snapshot]);

//   // Handle emergency alerts
//   useEffect(() => {
//     if (snapshot) {
//       Object.values(snapshot).forEach((entry) => {
//         if (entry.alert === true) {
//           setEmergencyMessage(
//             `Emergency at ${entry.location}: ${entry.reason}`
//           );
//           setShowPopup(true);
//           setTimeout(() => setShowPopup(false), 5000);
//         }
//       });
//     }
//   }, [snapshot]);

//   // Create WebSocket connections for each IP address
//   useEffect(() => {
//     const createWebSocket = (url, canvasRef, ip) => {
//       let ws;
//       let retryTimeout;

//       const connectWebSocket = () => {
//         ws = new WebSocket(url);

//         ws.onopen = () => {
//           console.log(`Connected to ${url}`);
//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: true,
//           })); // Set connection status to true

//           setReconnectAttempts((prevAttempts) => ({
//             ...prevAttempts,
//             [ip]: 0, // Reset reconnect attempts on successful connection
//           }));
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

//           setConnectionStatus((prevStatus) => ({
//             ...prevStatus,
//             [ip]: false, // Mark connection as lost
//           }));

//           setReconnectAttempts((prevAttempts) => ({
//             ...prevAttempts,
//             [ip]: (prevAttempts[ip] || 0) + 1, // Increment reconnect attempts
//           }));

//           if (reconnectAttempts[ip] < MAX_RECONNECT_ATTEMPTS) {
//             retryTimeout = setTimeout(connectWebSocket, RECONNECT_DELAY);
//           } else {
//             // Remove card after max reconnect attempts and delay
//             setTimeout(() => {
//               setIpAddresses((prevIPs) =>
//                 prevIPs.filter((prevIP) => prevIP !== ip)
//               );
//             }, REMOVE_DELAY);
//           }
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

//     // Create WebSocket for each new IP
//     ipAddresses.forEach((ip) => {
//       if (videoRefs[ip]) {
//         createWebSocket(`ws://${ip}`, videoRefs[ip], ip);
//       }
//     });

//     // Cleanup WebSocket connections
//     return () => {
//       ipAddresses.forEach((ip) => {
//         if (videoRefs[ip] && videoRefs[ip].current) {
//           videoRefs[ip].current = null;
//         }
//       });
//     };
//   }, [ipAddresses, videoRefs, reconnectAttempts]);

//   const handleCanvasClick = (canvasRef, ip) => {
//     setFullscreenImage(canvasRef);
//     setFullscreenIP(ip); // Set the IP address when opening fullscreen modal
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenImage(null);
//     setFullscreenIP(""); // Reset the IP when closing fullscreen modal
//     setIsModalOpen(false);
//   };

//   useEffect(() => {
//     if (fullscreenImage && isModalOpen) {
//       const updateFullscreenCanvas = () => {
//         const fullscreenCanvas = fullscreenCanvasRef.current;
//         const fullscreenContext = fullscreenCanvas?.getContext("2d"); // Ensure canvas exists before getting context
//         const clickedCanvas = fullscreenImage.current;

//         if (fullscreenContext && clickedCanvas) {
//           fullscreenCanvas.width = clickedCanvas.width;
//           fullscreenCanvas.height = clickedCanvas.height;

//           // Continuously copy the content from the clicked canvas to the fullscreen canvas
//           fullscreenContext.drawImage(
//             clickedCanvas,
//             0,
//             0,
//             fullscreenCanvas.width,
//             fullscreenCanvas.height
//           );

//           // Request the next frame if the modal is still open
//           if (isModalOpen) {
//             requestAnimationFrame(updateFullscreenCanvas);
//           }
//         }
//       };

//       updateFullscreenCanvas(); // Start updating the canvas
//     }
//   }, [fullscreenImage, isModalOpen]);

//   if (!snapshot) return <div>Loading...</div>;

//   return (
//     <>
//       <h1 className="h3 mb-3">
//         <strong>Camera Feeds</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               {ipAddresses.map(
//                 (ip, index) =>
//                   connectionStatus[ip] && ( // Only show card if connected
//                     <div className="col-lg-4 col-md-6 mb-3" key={index}>
//                       <div className="card">
//                         <div className="card-body p-0">
//                           <h5 className="card-title">Camera {ip}</h5>{" "}
//                           {/* Name camera with IP */}
//                           <canvas
//                             ref={videoRefs[ip]}
//                             className="canvas-responsive"
//                             onClick={() => handleCanvasClick(videoRefs[ip], ip)} // Pass the IP address on click
//                           ></canvas>
//                         </div>
//                       </div>
//                     </div>
//                   )
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="fullscreen-ip">IP Address: {fullscreenIP}</div>{" "}
//           <button className="close-button" onClick={closeFullscreen}>
//             Close
//           </button>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas
//               ref={fullscreenCanvasRef}
//               className="modal-canvas1"
//             ></canvas>
//           </div>
//         </div>
//       )}

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

// import React, { useEffect, useRef, useState } from "react";
// import { ref, onValue } from "firebase/database";
// import { database1 } from "../components/firebaseConfig.js"; // Import the Realtime Database instance

// const Dashboard = () => {
//   const [snapshot, setSnapshot] = useState(null);
//   const [ipAddresses, setIpAddresses] = useState([]);
//   const [showPopup, setShowPopup] = useState(false);
//   const [emergencyMessage, setEmergencyMessage] = useState("");
//   const [videoRefs, setVideoRefs] = useState([]);

//   const fullscreenCanvasRef = useRef(null);
//   const [fullscreenImage, setFullscreenImage] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [fullscreenIP, setFullscreenIP] = useState(""); // New state to store IP address

//   useEffect(() => {
//     const snapshotRef = ref(database1, "entries/");
//     const unsubscribe = onValue(snapshotRef, (snapshot) => {
//       const data = snapshot.val();
//       setSnapshot(data);
//     });

//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (snapshot) {
//       const ips = Object.values(snapshot).map((entry) => entry["IP-port"]);
//       setIpAddresses(ips);

//       const newVideoRefs = ips.map(() => React.createRef());
//       setVideoRefs(newVideoRefs);
//     }
//   }, [snapshot]);

//   useEffect(() => {
//     if (snapshot) {
//       Object.values(snapshot).forEach((entry) => {
//         if (entry.alert === true) {
//           setEmergencyMessage(
//             `Emergency at ${entry.location}: ${entry.reason}`
//           );
//           setShowPopup(true);
//           setTimeout(() => setShowPopup(false), 5000);
//         }
//       });
//     }
//   }, [snapshot]);

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
//       const cleanupFns = ipAddresses.map((ip, index) =>
//         createWebSocket(`ws://${ip}`, videoRefs[index])
//       );

//       return () => cleanupFns.forEach((cleanup) => cleanup());
//     }
//   }, [ipAddresses, videoRefs]);

//   const handleCanvasClick = (canvasRef, ip) => {
//     setFullscreenImage(canvasRef);
//     setFullscreenIP(ip); // Set the IP address when opening fullscreen modal
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenImage(null);
//     setFullscreenIP(""); // Reset the IP when closing fullscreen modal
//     setIsModalOpen(false);
//   };

//   useEffect(() => {
//     if (fullscreenImage && isModalOpen) {
//       const updateFullscreenCanvas = () => {
//         const fullscreenCanvas = fullscreenCanvasRef.current;
//         const fullscreenContext = fullscreenCanvas?.getContext("2d"); // Ensure canvas exists before getting context
//         const clickedCanvas = fullscreenImage.current;

//         if (fullscreenContext && clickedCanvas) {
//           fullscreenCanvas.width = clickedCanvas.width;
//           fullscreenCanvas.height = clickedCanvas.height;

//           // Continuously copy the content from the clicked canvas to the fullscreen canvas
//           fullscreenContext.drawImage(
//             clickedCanvas,
//             0,
//             0,
//             fullscreenCanvas.width,
//             fullscreenCanvas.height
//           );

//           // Request the next frame if the modal is still open
//           if (isModalOpen) {
//             requestAnimationFrame(updateFullscreenCanvas);
//           }
//         }
//       };

//       updateFullscreenCanvas(); // Start updating the canvas
//     }
//   }, [fullscreenImage, isModalOpen]);

//   if (!snapshot) return <div>Loading...</div>;

//   return (
//     <>
//       <h1 className="h3 mb-3">
//         <strong>Camera Feeds</strong>
//       </h1>

//       <div className={`row ${isModalOpen ? "blur-background" : ""}`}>
//         <div className="col d-flex">
//           <div className="w-100">
//             <div className="row">
//               {ipAddresses.map((ip, index) => (
//                 <div className="col-lg-4 col-md-6 mb-3" key={index}>
//                   <div className="card">
//                     <div className="card-body p-0">
//                       <h5 className="card-title">Camera {index + 1}</h5>
//                       <canvas
//                         ref={videoRefs[index]}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRefs[index], ip)} // Pass the IP address on click
//                       ></canvas>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {isModalOpen && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="fullscreen-ip">IP Address: {fullscreenIP}</div>{" "}
//           <button className="close-button" onClick={closeFullscreen}>
//             Close
//           </button>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas ref={fullscreenCanvasRef} className="modal-canvas"></canvas>

//             {/* Display IP Address */}
//           </div>
//         </div>
//       )}

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
