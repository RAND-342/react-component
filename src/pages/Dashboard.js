import React, { useEffect, useRef, useState } from "react";

function Dashboard() {
  // State to handle fullscreen modal visibility
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs for each video canvas
  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);
  const videoRef3 = useRef(null);

  // Ref for the fullscreen canvas
  const fullscreenCanvasRef = useRef(null);

  // WebSocket logic
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
            const drawImageOnCanvas = (canvasRef) => {
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

            // Draw on individual canvas
            drawImageOnCanvas(canvasRef);

            // Draw on the fullscreen canvas if open
            if (
              isModalOpen &&
              fullscreenCanvasRef.current &&
              canvasRef === fullscreenImage
            ) {
              const fullscreenCanvas = fullscreenCanvasRef.current;
              const fullscreenContext = fullscreenCanvas.getContext("2d");
              fullscreenCanvas.width = fullscreenCanvas.offsetWidth;
              fullscreenCanvas.height = fullscreenCanvas.offsetHeight;
              fullscreenContext.clearRect(
                0,
                0,
                fullscreenCanvas.width,
                fullscreenCanvas.height
              );
              fullscreenContext.drawImage(
                img,
                0,
                0,
                fullscreenCanvas.width,
                fullscreenCanvas.height
              );
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

    const cleanupWs1 = createWebSocket("ws://192.168.98.79:6789", videoRef1);
    const cleanupWs2 = createWebSocket("ws://192.168.98.91:6777", videoRef2);
    const cleanupWs3 = createWebSocket("ws://192.168.98.91:6778", videoRef3);

    return () => {
      cleanupWs1();
      cleanupWs2();
      cleanupWs3();
    };
  }, [isModalOpen, fullscreenImage]);

  const handleCanvasClick = (canvasRef) => {
    setFullscreenImage(canvasRef);
    setIsModalOpen(true);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    setIsModalOpen(false);
  };

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
                    <div className="image-container">
                      <canvas
                        ref={videoRef1}
                        className="canvas-responsive"
                        onClick={() => handleCanvasClick(videoRef1)}
                      ></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-0">
                    <h5 className="card-title">Total Verified Profiles</h5>
                    <div className="image-container">
                      <canvas
                        ref={videoRef2}
                        className="canvas-responsive"
                        onClick={() => handleCanvasClick(videoRef2)}
                      ></canvas>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mb-3">
                <div className="card">
                  <div className="card-body p-0">
                    <h5 className="card-title">Subscribers</h5>
                    <div className="image-container">
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
      </div>

      {/* Fullscreen Modal */}
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
    </>
  );
}

export default Dashboard;
// import React, { useEffect, useRef, useState } from "react";

// function Dashboard() {
//   // State to handle fullscreen modal visibility and the selected canvas
//   const [fullscreenCanvas, setFullscreenCanvas] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Refs for each video canvas
//   const videoRef1 = useRef(null);
//   const videoRef2 = useRef(null);
//   const videoRef3 = useRef(null);

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
//               } else {
//                 console.error("Failed to get canvas context for URL:", url);
//               }
//             } else {
//               console.error(
//                 "Canvas reference is null or not available for URL:",
//                 url
//               );
//             }
//           };
//         };

//         ws.onclose = () => {
//           console.log(`Connection closed for ${url}. Reconnecting...`);
//           retryTimeout = setTimeout(connectWebSocket, 3000);
//         };

//         ws.onerror = (error) => {
//           console.error(`Error in WebSocket connection to ${url}:, error`);
//           ws.close();
//         };
//       };

//       connectWebSocket();

//       return () => {
//         if (ws) ws.close();
//         if (retryTimeout) clearTimeout(retryTimeout);
//       };
//     };

//     const cleanupWs1 = createWebSocket("ws://192.168.98.79:6789", videoRef1);
//     const cleanupWs2 = createWebSocket("ws://192.168.98.91:6777", videoRef2);
//     const cleanupWs3 = createWebSocket("ws://192.168.98.91:6778", videoRef3);

//     return () => {
//       cleanupWs1();
//       cleanupWs2();
//       cleanupWs3();
//     };
//   }, []);

//   const handleCanvasClick = (canvasRef) => {
//     setFullscreenCanvas(canvasRef);
//     setIsModalOpen(true);
//   };

//   const closeFullscreen = () => {
//     setFullscreenCanvas(null);
//     setIsModalOpen(false);
//   };

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
//                     <div className="image-container">
//                       <canvas
//                         ref={videoRef1}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRef1)}
//                       ></canvas>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Total Verified Profiles</h5>
//                     <div className="image-container">
//                       <canvas
//                         ref={videoRef2}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRef2)}
//                       ></canvas>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Subscribers</h5>
//                     <div className="image-container">
//                       <canvas
//                         ref={videoRef3}
//                         className="canvas-responsive"
//                         onClick={() => handleCanvasClick(videoRef3)}
//                       ></canvas>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="col-lg-4 col-md-6 mb-3">
//                 <div className="card">
//                   <div className="card-body p-0">
//                     <h5 className="card-title">Orders</h5>
//                     <div className="image-container">
//                       <img
//                         src={
//                           "https://h5p.org/sites/default/files/h5p/content/1209180/images/file-6113d5f8845dc.jpeg"
//                         }
//                         height={"300"}
//                         width={"100%"}
//                         alt="Orders"
//                         className="dashboard-image"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Fullscreen Modal */}
//       {fullscreenCanvas && (
//         <div className="fullscreen-modal" onClick={closeFullscreen}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <canvas ref={fullscreenCanvas} className="modal-canvas"></canvas>
//             <button className="close-button" onClick={closeFullscreen}>
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Dashboard;
