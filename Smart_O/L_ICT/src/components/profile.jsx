import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    profileImage: null
  });
  const [userGoal, setUserGoal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [originalProfileImage, setOriginalProfileImage] = useState(null);
  const [imageMessage, setImageMessage] = useState('');
  const [message, setMessage] = useState('');
  const [hoverInterval, setHoverInterval] = useState(null);
  const fileInputRef = useRef(null);
  const leftPanelRef = useRef(null);
  const navigate = useNavigate();

  // Load user profile data on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData({
          username: response.data.username || '',
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          profileImage: response.data.profileImage || null
        });
        setOriginalProfileImage(response.data.profileImage || null);
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Load user goal from localStorage
  useEffect(() => {
    const goal = localStorage.getItem('userGoal');
    if (goal) {
      setUserGoal(goal);
    }
  }, []);

  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const colors = ['#FFD700', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00'];

    function createConfettiPiece() {
      const div = document.createElement('div');
      div.classList.add('confetti-piece');
      div.style.background = colors[Math.floor(Math.random() * colors.length)];
      div.style.left = Math.random() * 100 + '%';
      div.style.top = (Math.random() * 40) + 'vh';
      div.style.width = (Math.random() * 6 + 4) + 'px';
      div.style.height = (Math.random() * 10 + 4) + 'px';
      div.style.animationDuration = (Math.random() * 3 + 3) + 's';
      div.style.animationDelay = (Math.random() * 10) + 's';
      leftPanel.appendChild(div);

      // Remove after animation to save memory
      setTimeout(() => div.remove(), 10000);
    }

    // Continually generate confetti pieces to make them fly continuously
    const interval = setInterval(createConfettiPiece, 200);

    return () => clearInterval(interval);
  }, []);

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData(prev => ({
          ...prev,
          profileImage: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.put('http://localhost:5000/api/users/profile', {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImage: userData.profileImage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);

      // Update localStorage to reflect changes in other components
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...currentUser,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      }));
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditGoalClick = () => {
    setIsEditingGoal(true);
  };

  const handleInputBlur = (field, event) => {
    const value = event.target.value.trim();
    if (field === 'username' && !value) {
      handleInputChange(field, userData.username || 'UserName');
    } else {
      handleInputChange(field, value);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (field, event) => {
    if (event.key === 'Enter') {
      handleInputBlur(field, event);
    }
  };

  const handleHamburgerClick = () => {
    alert('Menu clicked!');
  };

  const handleGoalHover = () => {
    if (hoverInterval) return; // Prevent multiple intervals
    const interval = setInterval(() => {
      const leftPanel = leftPanelRef.current;
      for (let i = 0; i < 7; i++) {
        const firefly = document.createElement('div');
        firefly.classList.add('firefly');
        firefly.style.left = Math.random() * 100 + '%';
        firefly.style.top = Math.random() * 100 + '%';
        leftPanel.appendChild(firefly);
        setTimeout(() => firefly.remove(),2000);
      }
    }, 800); // Create fireflies every 500ms
    setHoverInterval(interval);
  };

  const handleGoalLeave = () => {
    if (hoverInterval) {
      clearInterval(hoverInterval);
      setHoverInterval(null);
    }
  };

  // Save only the profile image
  const saveProfileImage = async () => {
    if (!userData.profileImage) {
      setImageMessage('Please select an image first');
      setTimeout(() => setImageMessage(''), 3000);
      return;
    }

    setSavingImage(true);
    setImageMessage('');

    try {
      const token = sessionStorage.getItem('token');
      await axios.put('http://localhost:5000/api/users/profile', {
        profileImage: userData.profileImage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setImageMessage('Image saved successfully!');
      setTimeout(() => setImageMessage(''), 3000);

      // Update original profile image so button hides
      setOriginalProfileImage(userData.profileImage);

      // Update localStorage to reflect changes in other components
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({
        ...currentUser,
        profileImage: userData.profileImage
      }));
    } catch (error) {
      console.error('Error saving profile image:', error);
      setImageMessage('Failed to save image');
    } finally {
      setSavingImage(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#eee',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');

          * {
            box-sizing: border-box;
            
          }
          body, html {
            margin: 0; padding: 0; height: 100%;
            font-family: 'Orbitron', sans-serif;
            background: radial-gradient(circle at center, #2E1C86, #110B2B);
            color: #eee;
            overflow: hidden;
          }
          .container {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow: hidden;
          }

          /* Left side */
          .left-panel {
            flex: 1.2;
            background: radial-gradient(circle at center, #2E1C86, #110B2B);
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            overflow: hidden;
          }
          /* Stellar sparkles */
          .stars {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px) 0 0,
                        radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px) 25px 25px;
            background-size: 50px 50px;
            pointer-events: none;
            z-index: 1;
          }
          /* Logo container top-left */
          .logo-container {
            position: absolute;
            top: 20px;
            left: 20px;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle at center, #2c1b62, #170934);
            border-radius: 360px;
            box-shadow: 0 0 10px #59389c;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: box-shadow 0.3s ease, transform 0.3s ease; /* Smooth transition for hover */
            cursor: pointer; /* Indicates it's interactive */
          }
          /* Logo image, scale it smaller */
          .logo-container img {
            max-width: 100px;
            max-height: 100px;
            border-radius: 50px;
            transition: transform 0.3s ease; /* Smooth scaling on hover */
          }
          /* Hover effect: Sparkle with glow and animation */
          .logo-container:hover {
            box-shadow: 0 0 20px #9b59b6, 0 0 40px #2980b9; /* Brighter, multi-layered glow for sparkle */
            transform: scale(1.1); /* Slight zoom for emphasis */
            animation: sparkle 1s ease-in-out infinite; /* Twinkling animation */
          }
          @keyframes sparkle {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }

          /* Confetti pieces */
          .confetti-piece {
            position: absolute;
            width: 5px;
            height: 5px;
            background: gold;
            border-radius: 2px;
            opacity: 0.75;
            animation: confettiFall linear infinite;
          }
          @keyframes confettiFall {
            0% {
              transform: translateY(-20px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(110vh) rotate(360deg);
              opacity: 0;
            }
          }

          /* User icon circle with glow */
          .user-icon-wrapper {
            position: relative;
            margin: auto;
            margin-top: 170px;
            width: 200px;
            height: 200px;
            background: #ccc;
            border-radius: 50%;
            box-shadow:
              0 0 18px 8px #d4af37,
              inset 0 0 12px 6px #ffd84d;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer; /* Click to change image */
          }
          /* black ring + gold ring around */
          .user-icon-wrapper::before {
            content: "";
            position: absolute;
            width: 216px;
            height: 216px;
            border-radius: 50%;
            border: 6px solid black;
            top: -8px;
            left: -8px;
            box-shadow: 0 0 15px 5px #d4af37;
            pointer-events: none;
          }
          .user-icon-wrapper::after {
            content: "";
            position: absolute;
            width: 230px;
            height: 230px;
            border-radius: 50%;
            border: 5px solid #b78914;
            top: -15px;
            left: -15px;
            box-shadow: 0 0 25px 10px #f2d14d;
            pointer-events: none;
          }

          /* User icon SVG (person) - default */
          .user-icon-svg {
            width: 100px;
            height: 100px;
            fill: #333;
          }

          /* User image - when uploaded */
          .user-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }

          /* Golden crown icon top right of circle */
          .crown {
            position: absolute;
            top: -25px;
            right: 25px;
            width: 40px;
            height: 40px;
            filter: drop-shadow(0 0 4px #ffd700);
            animation: crownGlow 2.5s infinite alternate;
            z-index: 5;
          }
          @keyframes crownGlow {
            0% { filter: drop-shadow(0 0 4px #ffd700); }
            100% { filter: drop-shadow(0 0 12px #ffd700); }
          }

          /* Hidden file input */
          #profileImageInput {
            display: none;
          }

          /* Right side */
          .right-panel {
            flex: 1;
            background: linear-gradient(180deg, #382d76, #312357);
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 60px 40px;
            position: relative;
            color: #c9c5ff;
          }

          /* Hamburger menu top right */
          .menu-icon {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 35px;
  height: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  z-index: 999;
}

.menu-icon div {
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, #9b59b6, #00e5ff);
  border-radius: 5px;
  box-shadow: 0 0 8px rgba(155, 89, 182, 0.8);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.menu-icon:hover div:nth-child(1) {
  transform: translateX(5px);
}

.menu-icon:hover div:nth-child(2) {
  opacity: 0.6;
}

.menu-icon:hover div:nth-child(3) {
  transform: translateX(-5px);
}

          /* Username header with arrow */
          .username-header {
            font-size: 44px;
            font-weight: 700;
            color: #b9aaff;
            font-family: 'Orbitron', sans-serif;
            display: flex;
            align-items: center;
            margin-bottom: 35px;
            position: relative;
          }
          .username-header::before {
            content: "";
            display: inline-block;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 20px 25px 20px 0;
            border-color: transparent #5b528d transparent transparent;
            margin-right: 20px;
          }

          /* Editable icon */
          .edit-icon {
            width: 25px;
            height: 25px;
            margin-left: 18px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.3s ease;
            fill: #b9aaff;
          }
          .edit-icon:hover {
            opacity: 1;
          }

          /* Input fields */
          form {
            display: flex;
            flex-direction: column;
            gap: 24px;
            width: 100%;
            max-width: 320px;
          }
          input[type="text"],
          input[type="email"],
          input[type="password"] {
            background: #5a4b99;
            border: none;
            border-radius: 19px;
            padding: 10px 20px;
            font-family: 'Orbitron', sans-serif;
            font-size: 18px;
            font-weight: 600;
            color: #d7d2ff;
            letter-spacing: 1.1px;
            outline: none;
            transition: background 0.3s ease;
          }
          input[type="text"]:focus,
          input[type="email"]:focus,
          input[type="password"]:focus {
            background: #755db9;
          }
          input[readonly] {
            color: #bdbafcaa;
            font-style: italic;
            cursor: default;
            background: #4a3b6a;
          }

          /* Terms link */
          .terms {
            margin-top: 60px;
            text-decoration: underline;
            font-size: 14px;
            color: #918bd2;
            cursor: pointer;
            max-width: 320px;
          }
          .terms:hover {
            color: #b3aaff;
          }

          /* User Goal Display */
          .user-goal-container {
            margin-top: 10px;
            margin-bottom: 100px;
            padding: 15px;
            background: rgba(155, 89, 182, 0.2);
            border-radius: 15px;
            border: 2px solid #9b59b6;
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: #d7d2ff;
            width: 400px;
            word-wrap: break-word;
            position: relative;
            overflow: hidden;
            animation: goalFadeIn 1s ease-out, goalGlow 3s ease-in-out infinite alternate;
            box-shadow: 0 0 20px rgba(155, 89, 182, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .user-goal-container:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(155, 89, 182, 0.5);
          }

          .user-goal-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: goalShimmer 3s infinite;
          }

          .goal-title {
            font-size: 14px;
            color: #b9aaff;
            margin-bottom: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            animation: goalTitlePulse 2s ease-in-out infinite;
          }

          .goal-text {
            animation: goalTextSlideUp 0.8s ease-out 0.5s both;
          }

          @keyframes goalFadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes goalGlow {
            0% {
              box-shadow: 0 0 20px rgba(155, 89, 182, 0.3);
              border-color: #9b59b6;
            }
            100% {
              box-shadow: 0 0 30px rgba(155, 89, 182, 0.6);
              border-color: #c77dff;
            }
          }

          @keyframes goalShimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }

          @keyframes goalTitlePulse {
            0%, 100% {
              color: #b9aaff;
              text-shadow: 0 0 5px rgba(185, 170, 255, 0.5);
            }
            50% {
              color: #d4bfff;
              text-shadow: 0 0 15px rgba(212, 191, 255, 0.8);
            }
          }

          @keyframes goalTextSlideUp {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Firefly sparkle effect */
          .firefly {
            position: absolute;
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #FFD700, #FFA500);
            border-radius: 50%;
            box-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700;
            animation: fireflySparkle 2s ease-out forwards;
            pointer-events: none;
            z-index: 10;
          }
          @keyframes fireflySparkle {
            0% {
              opacity: 1;
              transform: scale(0.5);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.2);
            }
            100% {
              opacity: 0;
              transform: scale(0.5);
            }
          }

          /* Responsive for smaller widths */
          @media (max-width: 780px) {
            .container {
              flex-direction: column;
            }
            .left-panel, .right-panel {
              flex: none;
              width: 100%;
              height: 50vh;
              padding: 20px;
            }
            .right-panel {
              height: auto;
            }
            .user-goal-container {
              max-width: 100%;
              margin: 10px 0;
            }
          }
        `}
      </style>

      <div className="container">
        <div className="left-panel" ref={leftPanelRef}>
          {/* Logo top-left */}
          <div className="logo-container" aria-label="Smart O/L ICT Logo">
            <img src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand" alt="Smart O/L ICT Logo" />
          </div>
          <div className="stars"></div>

          <div className="user-icon-wrapper" aria-label="User profile picture placeholder" onClick={handleImageClick}>
            {userData.profileImage ? (
              <img src={userData.profileImage} className="user-image" alt="User Profile Picture" />
            ) : (
              <svg className="user-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 8-4 8-4s8 0 8 4v1H4v-1z" />
              </svg>
            )}
            <svg className="crown" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="#FFD700" stroke="#B8860B" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
              <path d="M2 17h20l-4-10-4 8-4-14-4 14-4-8z" />
            </svg>
            
            {/* Save Image Button Icon - only show when image changed */}
            {userData.profileImage !== originalProfileImage && (
              <button 
                className="save-image-btn-icon"
                onClick={(e) => { e.stopPropagation(); saveProfileImage(); }}
                disabled={savingImage}
                title="Save Image"
              >
                {savingImage ? (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2">
                      <animate attributeName="stroke-dasharray" from="0 63" to="63 0" dur="1s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                )}
              </button>
            )}
          </div>
          
          {/* Image message toast */}
          {imageMessage && (
            <div className="image-message-toast">
              {imageMessage}
            </div>
          )}

          {/* User Goal Display */}
          {userGoal && (
            <div className="user-goal-container" onMouseEnter={handleGoalHover} onMouseLeave={handleGoalLeave}>
              <div className="goal-title">🎯 Current Goal</div>
              <div className="goal-text">{userGoal}</div>
              <svg className="edit-icon goal-edit-icon" tabIndex="0" role="button" aria-label="Edit Goal" fill="#b9aaff" viewBox="0 0 24 24" onClick={() => navigate('/dashboard?openGoals=true')} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/dashboard?openGoals=true'); }}>
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
              </svg>
            </div>
          )}
        </div>

        <div className="right-panel" role="main">
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

          <div className="username-header">
            {isEditing ? (
              <input
                type="text"
                id="username-edit"
                name="username"
                value={userData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={(e) => handleInputBlur('username', e)}
                onKeyDown={(e) => handleInputKeyDown('username', e)}
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '44px',
                  fontWeight: '700',
                  color: '#b9aaff',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '200px',
                }}
                autoComplete="off"
                autoFocus
              />
            ) : (
              <div id="usernameDisplay">{userData.username || 'UserName'}</div>
            )}
            <svg className="edit-icon" tabIndex="0" role="button" aria-label="Edit Username" fill="#b9aaff" viewBox="0 0 24 24" onClick={handleEditClick} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEditClick(); }}>
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
            </svg>
          </div>

          <form id="userForm" autoComplete="off">
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              placeholder="First Name" 
              aria-label="First Name" 
              value={userData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required 
            />
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              placeholder="Last Name" 
              aria-label="Last Name" 
              value={userData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required 
            />
            <input 
              type="email" 
              id="email" 
              name="email" 
              placeholder="Email" 
              aria-label="Email" 
              value={userData.email}
              readOnly
              required 
            />
            <button 
              type="button" 
              onClick={saveProfile}
              disabled={saving}
              style={{
                padding: '12px 24px',
                background: saving ? '#666' : 'linear-gradient(45deg, #9b59b6, #3498db)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '20px'
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            {message && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '5px',
                background: message.includes('success') ? '#4CAF50' : '#f44336',
                color: 'white',
                textAlign: 'center'
              }}>
                {message}
              </div>
            )}
          </form>
          <a href="/setting" className="terms" tabIndex="0">Settings</a>
        </div>
      </div>

      {/* Hidden file input for profile image */ }
  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
    </div>
  );
};

export default Profile;