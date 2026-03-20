import React from "react";
import "./setting.css";
import { Link, useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  // Logout current user
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Logout all users
  const handleLogoutAll = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: 'Orbitron', sans-serif;
            color: #eee;
            overflow: hidden;
          }
        `}
      </style>

      <div className="settings-container">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <img
            className="settings-logo"
            src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand"
            alt="logo"
          />
          <h1 className="settings-title">Settings</h1>

          

          <div className="image-preview">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdtFxmCU5lsnkaRzAiHLRRgyz9yN0T1_FlEg&s"
              alt="Preview"
            />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">

          {/* Hamburger menu top-right */}
        <div 
          className="menu-icon" 
          aria-label="Menu" 
          role="button" 
          tabIndex={0}
          style={{position: 'fixed', top: '20px', right: '20px', zIndex: 10}}
          onClick={() => navigate('/dashboard')} // Add navigation to dashboard
        >
          <div></div>
          <div></div>
          <div></div>
        </div>

          <div className="menu-box">
            <Link to="/profile" className="menu-item">
              <span>👤</span> Profile <span className="arrow">›</span>
            </Link>

            <Link to="/notification" className="menu-item">
              <span>🔔</span> Notifications <span className="arrow">›</span>
            </Link>

            <Link to="/feedback" className="menu-item">
              <span>💬</span> Feedback <span className="arrow">›</span>
            </Link>

            <Link to="/privacy" className="menu-item">
              <span>❓</span> Privacy <span className="arrow">›</span>
            </Link>

            <Link to="/security" className="menu-item">
              <span>🔒</span> Security <span className="arrow">›</span>
            </Link>
          </div>

          <div className="login-box">
            <h2>Logout</h2>

            <Link to="/intro" className="login-link">
              logout
            </Link>

            
          </div>

        </div>
      </div>
    </>
  );
}

export default Settings;
