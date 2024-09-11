import React from "react";

function Admin(toggleMenu) {
  return (
    <>
      <h1 className="h3 mb-3">
        <strong>Admin Panel</strong>
      </h1>

      <div className="row">
        {/* Left section with small cards */}
        <div className="col-xl-2 col-xxl-2 d-flex">
          <div className="w-100">
            <div className="row">
              <div className="col-sm-6 col-md-4 mb-2">
                {" "}
                {/* Reduced mb */}
                <div
                  className="card"
                  style={{ height: "150px", width: "150px" }}
                >
                  <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center">
                    <div className="stat text-primary mb-2">
                      <i className="align-middle" data-feather="truck"></i>
                    </div>
                    <h5 className="card-title mb-1 text-center">Users Live</h5>
                    <h1 className="mt-1 mb-0 text-center">9,832</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-2 col-xxl-2 d-flex">
              <div className="col-sm-6 col-md-4 mb-2">
                {" "}
                {/* Reduced mb */}
                <div
                  className="card"
                  style={{ height: "150px", width: "150px" }}
                >
                  <div className="card-body p-2 d-flex flex-column justify-content-center align-items-center">
                    <div className="stat text-primary mb-2">
                      <i
                        className="align-middle"
                        data-feather="dollar-sign"
                      ></i>
                    </div>
                    <h5 className="card-title mb-1 text-center">Subscribers</h5>
                    <h1 className="mt-1 mb-0 text-center">2,421</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-2">
          {" "}
          {/* Reduced mt */}
          <div className="col-12 col-md-6 col-xxl-3 d-flex order-2 order-xxl-3">
            <div className="card flex-fill w-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Browser Usage</h5>
              </div>
              <div className="card-body d-flex">
                <div className="align-self-center w-100">
                  <div className="py-3">
                    <div className="chart chart-xs">
                      <canvas id="chartjs-dashboard-pie"></canvas>
                    </div>
                  </div>
                  <table className="table mb-0">
                    <tbody>
                      <tr>
                        <td>Verified Males</td>
                        <td className="text-end">4306</td>
                      </tr>
                      <tr>
                        <td>Verified Females</td>
                        <td className="text-end">3801</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-12 col-xxl-6 d-flex order-3 order-xxl-2">
            <div className="card flex-fill w-100">
              <div className="card-header">
                <h5 className="card-title mb-0">Real-Time</h5>
              </div>
              <div className="card-body px-4">
                <div id="world_map" style={{ height: 350 }}></div>
              </div>
            </div>
          </div>
          {/* <div className="col-12 col-lg-4 col-xxl-3 d-flex">
                    <div className="card flex-fill w-100">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Monthly Registrations</h5>
                        </div>
                        <div className="card-body d-flex w-100">
                            <div className="align-self-center chart chart-lg">
                                <canvas id="chartjs-dashboard-bar"></canvas>
                            </div>
                        </div>
                    </div>
                </div> */}
        </div>
        {/* Right section - Adjusted spacing */}
        <div className="col-xl-18 col-xxl-18">
          <div className="row">
            {/* User Reviews */}
            <div className="col-xl-10 col-xxl-10">
              <div className="card flex-fill">
                <div className="card-header">
                  <h5 className="card-title mb-0">User Reviews</h5>
                </div>
                <div className="card-body py-3">
                  <div className="chart chart-sm">
                    <canvas id="chartjs-dashboard-line"></canvas>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Reviews */}
            {/* <div className="col-xl-6 col-xxl-6">
                            <div className="card flex-fill">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Date Reviews</h5>
                                </div>
                                <div className="card-body py-3">
                                    <div className="chart chart-sm">
                                        <canvas id="chartjs-dashboard-line"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div> */}
          </div>
        </div>
      </div>

      {/* Other sections */}
    </>
  );
}

export default Admin;
