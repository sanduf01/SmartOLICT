import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import './intro.css';
import logo from "../assets/logo.png";
import IntroVideo from "../assets/Intro.mp4";

const Intro = () => {
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    console.log('IntroVideo URL ->', IntroVideo);
  }, []);

  return (
    <>
    <style>
      {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
/* Reset and Base Styles */
body, html {
            margin: 0; padding: 0; height: 100%;
            font-family: 'Orbitron', sans-serif;
            color: #eee;
            overflow: hidden;
          }
      `}
    </style>
    
    <div className="intro-container"> 
      
      {/* --- Left Side: Logo and Welcome Section --- */}
      <div className="left-panel">
        
        
        {/* 'Watch' button area */}
       <div className="watch-button-container">
  <video width="100%" controls preload="metadata" loop autoPlay muted playsInline>
    <source src={IntroVideo} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

        {/* Welcome text */}
        <div className="welcome-text">
          <p>WELCOME</p>
          <p>TO</p>
          <p className="smart-text">SMART O/L ICT</p>
        </div>
      </div>
      
      {/* --- Right Side: Auth Section --- */}
      <div className="right-panel">
        {/* Profile icon/image */}
        <div className="profile-icon">
          <img src={logo} alt="Smart O/ICT Logo" className="profile-icon" />
          {/* Placeholder for the user profile image */}
          {/* You would replace this with an actual <img> tag */}
        </div>

        {/* Action buttons */}
        <div className="auth-buttons">
          <button className="auth-button login-button" onClick={() => navigate('/login')}>Login</button>
          <button className="auth-button register-button" onClick={() => navigate('/register')}>Register</button>
        </div>

        
      </div>
    </div>
    </>
  );
};

export default Intro;