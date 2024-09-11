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
import Admin from "./components/Admin";
import Layout from "./pages/DashboardLayout";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
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
                <Route path="/" element={<Login />} /> {/* Default route */}
                <Route path="/login" element={<Login />} /> {/* Login route */}
                <Route path="/signup" element={<Signup />} />{" "}
                {/* Signup route */}
                {/* Protected Routes with Layout */}
                <Route element={<Layout />} />
                <Route exact path="/admin" element={<Admin />} />
                <Route exact path="/dashboard" element={<Dashboard />} />
                <Route
                  exact
                  path="/sos"
                  element={<ProfilePage profileData={profileData[0]} />}
                />
                {profileData.map((profile) => (
                  <Route
                    key={profile.id}
                    path={`/sos/${profile.id}`}
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
