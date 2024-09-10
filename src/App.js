import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
//import AdminProfile from './components/Profile';
import ProfilePage from "./components/ProfileNew";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import profileData from "./components/profiledata";
import Emergency from "./components/emergency";

function App() {
  return (
    <Router>
      <div className="wrapper">
        <Sidebar />

        <div className="main">
          <Navbar />
          <main className="content">
            <div className="container-fluid p-0"></div>
            <>
              <Routes>
                <Route exact path="/" element={<Dashboard />} />
                <Route
                  exact
                  path="/profile"
                  element={<ProfilePage profileData={profileData[0]} />}
                />
                {profileData.map((profile) => (
                  <Route
                    key={profile.id}
                    path={`/profile/${profile.id}`}
                    element={<ProfilePage profileData={profile} />}
                  />
                ))}
                <Route exact path="/emergency" element={<Emergency />} />
              </Routes>
            </>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
