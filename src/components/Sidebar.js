import React from "react";
import { Link } from "react-router-dom";
import user from "./user.png";
import vlncy from "./img.png";

function Sidebar() {
  return (
    <nav id="sidebar" className="sidebar js-sidebar">
      <div className="sidebar-content js-simplebar">
        <a className="sidebar-brand" href="index.html">
          <img src={vlncy} height="50px"></img>
          <span className="align-middle">Team Pragatti</span>
        </a>

        <ul className="sidebar-nav">
          <li className="sidebar-header">Pages</li>
          <li className="sidebar-item">
            <>
              <Link className="sidebar-link" to="/admin">
                <i className="align-middle" data-feather="alert-triangle"></i>
                {"  "}
                <span className="align-middle">Admin</span>
              </Link>
            </>
          </li>
          <li className="sidebar-item active">
            <>
              <Link className="sidebar-link" to="/dashboard">
                <i className="align-middle" data-feather="video"></i>{" "}
                <span className="align-middle">Camera Feeds</span>
              </Link>
            </>
          </li>

          <li className="sidebar-item">
            <>
              <Link className="sidebar-link" to="/sos">
                <i className="align-middle" data-feather="alert-triangle"></i>
                {"  "}
                <span className="align-middle">SOS</span>
              </Link>
            </>
          </li>

          <li className="sidebar-item">
            <Link className="sidebar-link" to="/emergency">
              <i className="align-middle" data-feather="inbox"></i>{" "}
              <span className="align-middle">Complaints</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link className="sidebar-link" to="/emergency">
              <i className="align-middle" data-feather="settings"></i>{" "}
              <span className="align-middle">Settings</span>
            </Link>
          </li>
          <li className="sidebar-item">
            <Link className="sidebar-link" to="/emergency">
              <i className="align-middle" data-feather="help-circle"></i>{" "}
              <span className="align-middle">Help Center</span>
            </Link>
          </li>

          {/* <li className="sidebar-header">
                    Tools & Components
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="ui-buttons.html">
                        <i className="align-middle" data-feather="square"></i> <span className="align-middle">Buttons</span>
                    </a>
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="ui-forms.html">
                        <i className="align-middle" data-feather="check-square"></i> <span className="align-middle">Forms</span>
                    </a>
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="ui-cards.html">
                        <i className="align-middle" data-feather="grid"></i> <span className="align-middle">Cards</span>
                    </a>
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="ui-typography.html">
                        <i className="align-middle" data-feather="align-left"></i> <span className="align-middle">Typography</span>
                    </a>
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="icons-feather.html">
                        <i className="align-middle" data-feather="coffee"></i> <span className="align-middle">Icons</span>
                    </a>
                </li>

                <li className="sidebar-header">
                    Plugins & Addons
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="charts-chartjs.html">
                        <i className="align-middle" data-feather="bar-chart-2"></i> <span className="align-middle">Charts</span>
                    </a>
                </li>

                <li className="sidebar-item">
                    <a className="sidebar-link" href="maps-google.html">
                        <i className="align-middle" data-feather="map"></i> <span className="align-middle">Maps</span>
                    </a>
                </li> */}
        </ul>
      </div>
    </nav>
  );
}

export default Sidebar;
