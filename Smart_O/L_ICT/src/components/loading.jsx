import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import "./loading.css";
import logo from "../assets/logo.png"; // same logo you used in Login

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /intro after 3 seconds (adjust as needed)
    const timer = setTimeout(() => {
      navigate('/intro');
    }, 5000);

    // Cleanup timer on unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-overlay">
        <img src={logo} alt="Smart O/ICT Logo" className="loading-logo" />

        <div className="progress-wrapper">
          <div className="progress-track">
            <div className="loading-progress-fill" />
          </div>
        </div>

        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;