import React from "react";
import { Link } from "react-router-dom";
import user from "./user.png";
import vlncy from "./vlncy.jpg";

function Sidebar() {
  return (
    <nav id="sidebar" className="sidebar js-sidebar">
      <div className="sidebar-content js-simplebar">
        <a className="sidebar-brand" href="index.html">
          <img src={vlncy} height="30px"></img>
          <span className="align-middle">Team Pragatti</span>
        </a>

        <ul className="sidebar-nav">
          <li className="sidebar-header">Pages</li>

          <li className="sidebar-item active">
            <>
              <Link className="sidebar-link" to="/">
                <i className="align-middle" data-feather="sliders"></i>{" "}
                <span className="align-middle">Camera Feeds</span>
              </Link>
            </>
          </li>

          <li className="sidebar-item">
            <>
              <Link className="sidebar-link" to="/profile">
                <i className="align-middle" data-feather="user"></i>{" "}
                <span className="align-middle">Alerts</span>
              </Link>
            </>
          </li>

          <li className="sidebar-item">
            <a className="sidebar-link" href="#">
              <i className="align-middle" data-feather="book"></i>{" "}
              <span className="align-middle">Home</span>
            </a>
          </li>

          <li className="sidebar-item">
            <a className="sidebar-link" href="#">
              <i className="align-middle" data-feather="users"></i>{" "}
              <span className="align-middle">User</span>
            </a>
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
