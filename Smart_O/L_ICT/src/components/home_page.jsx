import React from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import for navigation
import { useEffect } from 'react';

const HomePage = () => {
  const navigate = useNavigate(); // Add this hook for navigation

  useEffect(() => {
    // No longer handling token here - moved to login.jsx
  }, []);

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');

          /* Reset box sizing */
          *, *::before, *::after {
            box-sizing: border-box;
          }

          body, html {
            margin: 0;
            height: 100vh;
            width: 100vw;
            font-family: 'Orbitron', monospace;
            background: radial-gradient(circle at center, #0a0a27, #1e0049 80%);
            color: white;
            overflow: hidden;
          }

          .container {
            position: relative;
            width: 100%;
            height: 100%;
          }

          /* Logo container fixed top-left */
          .logo-container {
            position: fixed;
            top: 30px;
            left: 30px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle at center, #2c1b62, #170934);
            border-radius: 360px;
            box-shadow: 0 0 10px #59389c;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: box-shadow 0.3s ease, transform 0.3s ease; /* Smooth transition for hover */
            cursor: pointer; /* Indicates it's interactive */
            z-index: 10;
          }
          /* Logo image, scale it smaller */
          .logo-container img {
            max-width: 200px;
            max-height: 200px;
            border-radius: 360px;
            transition: transform 0.3s ease; /* Smooth scaling on hover */
          }
          /* Hover effect: Sparkle with glow and animation */
          .logo-container:hover {
            box-shadow: 0 0 20px #9b59b6, 0 0 40px #2980b9; /* Brighter, multi-layered glow for sparkle */
            transform: scale(1.1); /* Slight zoom for emphasis */
            animation: sparkle 1s ease-in-out infinite; /* Twinkling animation */
          }

          @keyframes sparkle {
            0%, 100% {
              box-shadow: 0 0 20px #9b59b6, 0 0 40px #2980b9;
            }
            50% {
              box-shadow: 0 0 30px #b16bff, 0 0 60px #3399ff;
            }
          }

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


          /* Diamond shapes */
          .diamond {
            position: absolute;
            width: 1000px;
            height: 800px;
            overflow: hidden;
            transform: rotate(45deg);
            border-radius: 25px;
            box-shadow: 0 0 25px #7c3eff;
            cursor: pointer;
          }
          .diamond-text-grade10 {
            position: absolute;
            top: 5%; /* Adjust as needed */
            left: 30%;
            transform: rotate(-45deg) translate(-50%, -50%);
            color: white;
            font-size: 4rem;
            font-weight: 700;
            text-shadow: 0 0 10px #000000cc;
            user-select: none;
            pointer-events: none;
            z-index: 2;
          }

          .diamond-text-grade11 {
            position: absolute;
            top: 60%; /* Different vertical position */
            left: 60%;
            transform: rotate(-45deg) translate(-50%, -50%);
            color: white;
            font-size: 4rem;
            font-weight: 700;
            text-shadow: 0 0 10px #000000bb;
            user-select: none;
            pointer-events: none;
            z-index: 2;
        }
          
          .diamond img {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
            top: 0;
            left: 0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-radius: 10px;
          }
          .diamond:hover img {
            transform: scale(1.1);
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px #9b59b6;
          }

          
          
          /* Grade 10 diamond bottom-left */
          .diamond.grade10 {
            top: -10px;
            right: -250px;
            
          }

          /* Grade 11 diamond top-right */
          .diamond.grade11 {
            
            bottom: -40px;
            left: -250px;
          }

          /* Get Started Button fixed bottom-right */
          .get-started {
            position: fixed;
            bottom: 55px;
            right: 30px;
            background: linear-gradient(45deg, #b257dc, #9d0976, #0000cc, #4fa7d3);
            background-size: 400% 400%;
            color: white;
            padding: 14px 50px;
            border-radius: 50px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.8rem;
            cursor: pointer;
            box-shadow: 0 0 15px rgba(204, 0, 0, 0.5);
            display: flex;
            align-items: center;
            gap: 14px;
            border: none;
            user-select: none;
            transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
            animation: colorShift 3s ease-in-out infinite;
            z-index: 10;
          }
          .get-started:hover {
            background: linear-gradient(45deg, #923ac9, #0d670d, #4444ff, #5d6f0c);
            background-size: 400% 400%;
            color: white;
            box-shadow: 0 0 25px rgba(255, 68, 68, 0.8);
            transform: scale(1.05);
            animation: colorShift 1s ease-in-out infinite;
          }

          @keyframes colorShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          /* Arrow icon for the button */
          .get-started svg {
            stroke: white;
            stroke-width: 2.4;
            width: 30px;
            height: 24px;
            transition: stroke 0.3s ease;
          }
          .get-started:hover svg {
            stroke: white;
          }

          /* Responsive */
          @media (max-width: 720px) {
            .diamond {
              position: static;
              width: 500px;
              height: 500px;
              margin: 20px auto;
              transform: rotate(45deg);
            }
            .diamond-text {
              font-size: 2rem;
            }
            .container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 2rem;
              overflow: visible;
            }
            .get-started {
              position: static;
              margin: 20px auto 0;
              padding: 10px 30px;
              font-size: 1.4rem;
              box-shadow: none;
              color: #cc0000;
              background: #c21414;
            }
            .get-started:hover {
              background: #cc0000;
              color: white;
              box-shadow: 0 0 15px #ff4444;
            }
            .logo-container {
              position: static;
              margin: 0 auto 15px;
              box-shadow: none;
              background: transparent;
            }
            .menu-icon {
              display: none;
            }
            .diamond img {
              width: 140px;
              height: 140px;
              object-fit: cover;
              border-radius: 10px;
            }
          }
        `}
      </style>
      <div className="container">
        {/* Logo top-left */}
        <div className="logo-container" aria-label="Smart O/L ICT Logo">
          <img src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand" alt="Smart O/L ICT Logo" />
        </div>

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

        <div 
          className="diamond grade10" 
          tabIndex={0} 
          role="button" 
          aria-label="Go to Grade 10 Lessons" 
          onClick={() => navigate('/grade10lessons')} // Change to navigate to grade10lessons
        >
          <img src="https://wallpaperaccess.com/full/2889851.jpg" alt="Grade 10" draggable={false} />
          <div className="diamond-text-grade10">Grade 10</div>
        </div>
        <div 
          className="diamond grade11" 
          tabIndex={0} 
          role="button" 
          aria-label="Go to Grade 11 Lessons" 
          onClick={() => navigate('/grade11lessons')} // Change to navigate to grade11lessons
        >
          <img src="https://static.vecteezy.com/system/resources/previews/022/059/172/large_2x/programming-code-abstract-technology-background-of-software-developer-and-computer-script-generative-ai-photo.jpg" alt="Grade 11" draggable={false} />
          <div className="diamond-text-grade11">Grade 11</div>
        </div>

        {/* Get Started button bottom-right */}
        <button className="get-started" aria-label="Get Started" onClick={() => navigate('/profile')}>
          Get Started With Profile
          <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default HomePage;