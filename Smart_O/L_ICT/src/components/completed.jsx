import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

const Completed = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  const totalScore = location.state?.totalScore ?? 0;
  const answered = location.state?.answered ?? 0;
  const duration = location.state?.duration ?? 0;
  const grade = location.state?.grade ?? 10;
  const lessonNumber = location.state?.lessonNumber ?? 1;

  useEffect(() => {
    // Calculate accuracy
    if (answered > 0) {
      setAccuracy(Math.round((totalScore / answered) * 100));
    }

    // Confetti animation
    const confettiCanvas = canvasRef.current;
    const ctx = confettiCanvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;

    confettiCanvas.width = W;
    confettiCanvas.height = H;

    // Confetti particle class
    class ConfettiParticle {
      constructor() {
        this.x = Math.random() * W;
        this.y = Math.random() * H - H;
        this.r = Math.random() * 6 + 4;
        this.d = Math.random() * 20 + 10;
        this.color = randomColor();
        this.tilt = Math.floor(Math.random() * 10) - 10;
        this.tiltAngleIncremental = (Math.random() * 0.07) + 0.05;
        this.tiltAngle = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.lineWidth = this.r / 2;
        ctx.strokeStyle = this.color;
        ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
        ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
        ctx.stroke();
      }

      update() {
        this.tiltAngle += this.tiltAngleIncremental;
        this.y += (Math.cos(this.d) + 3 + this.r / 2) / 2;
        this.x += Math.sin(this.d);
        this.tilt = Math.sin(this.tiltAngle) * 15;

        if (this.y > H) {
          this.x = Math.random() * W;
          this.y = -20;
          this.tilt = Math.floor(Math.random() * 10) - 10;
        }
      }
    }

    function randomColor() {
      const colors = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#8338ec', '#ff9f1c'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // Create confetti
    let confettiParticles = [];
    const maxConfetti = 150;

    for (let i = 0; i < maxConfetti; i++) {
      confettiParticles.push(new ConfettiParticle());
    }

    // Animate confetti
    function drawConfetti() {
      ctx.clearRect(0, 0, W, H);
      for (const confetti of confettiParticles) {
        confetti.draw();
        confetti.update();
      }
      requestAnimationFrame(drawConfetti);
    }
    
    const animationId = requestAnimationFrame(drawConfetti);

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      confettiCanvas.width = W;
      confettiCanvas.height = H;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleDone = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate(`/quiz2/${grade}/${lessonNumber}`);
  };

  const getPerformanceMessage = () => {
    if (accuracy === 100) return "Perfect! 🎯";
    if (accuracy >= 80) return "Excellent! 🌟";
    if (accuracy >= 60) return "Good Job! 👍";
    if (accuracy >= 40) return "Not Bad! 😊";
    return "Keep Practicing! 💪";
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

          html, body {
            height: 100%;
            margin: 0;
            background: linear-gradient(180deg, #0f0026 0%, #0a0120 60%, #05000f 100%);
            overflow: hidden;
            font-family: 'Poppins', 'Segoe UI', sans-serif;
            color: white;
          }
          
          .q2-completed-root {
            position: relative;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 28px;
          }

          .q2-completed-card {
          margin-top:20px;
            width: 640px;
            max-width: calc(100% - 40px);
            background: rgba(255, 255, 255, 0.06);
            padding: 36px;
            border-radius: 20px;
            text-align: center;
            color: white;
            box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(12px);
            position: relative;
            border: 1px solid rgba(131, 83, 255, 0.3);
          }
          
          .q2-completed-card:hover {
            transform: translateY(-4px);
            transition: transform 0.2s ease;
          }

          .q2-completed-ribbon {
            position: absolute;
            top: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            height: 60px;
            background: linear-gradient(45deg, #8353ff, #6ea2ff);
            clip-path: polygon(
              0 20%, 10% 0%, 40% 0%, 50% 20%, 60% 0%, 90% 0%, 100% 20%, 100% 80%, 90% 100%, 
              60% 100%, 50% 80%, 40% 100%, 10% 100%, 0 80%
            );
            box-shadow: 0 5px 15px rgba(131, 83, 255, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 2px;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            font-family: 'Poppins', sans-serif;
            z-index: 1;
          }

          .q2-completed-title {
            font-size: 28px;
            font-weight: 700;
            margin: 40px 0 10px;
            color: #fff;
            text-shadow: 0 0 10px rgba(131, 83, 255, 0.3);
          }

          .q2-completed-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 30px;
          }

          .q2-completed-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin: 20px 0;
          }

          .q2-completed-stat-box {
            background: rgba(255, 255, 255, 0.06);
            border-radius: 15px;
            padding: 20px;
            width: 120px;
            border: 1px solid rgba(131, 83, 255, 0.2);
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
          }
          
          .q2-completed-stat-box:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: scale(1.05);
            border-color: rgba(131, 83, 255, 0.4);
          }

          .q2-completed-stat-value {
            font-size: 36px;
            font-weight: 800;
            color: #8353ff;
            margin-bottom: 5px;
            text-shadow: 0 0 10px rgba(131, 83, 255, 0.3);
          }

          .q2-completed-stat-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .q2-completed-accuracy {
            margin: 25px auto;
            width: 80%;
          }

          .q2-completed-accuracy-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
          }

          .q2-completed-accuracy-bar {
            width: 100%;
            height: 12px;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .q2-completed-accuracy-fill {
            height: 100%;
            background: linear-gradient(180deg, #2db2ff, #9333ea);
            width: ${accuracy}%;
            border-radius: 10px;
            transition: width 1.2s ease;
          }

          .q2-completed-performance {
            font-size: 20px;
            font-weight: 600;
            color: #ffd166;
            margin: 25px 0;
            padding: 12px;
            background: rgba(255, 209, 102, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(255, 209, 102, 0.2);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 0 10px rgba(255, 209, 102, 0.2);
            }
            50% { 
              transform: scale(1.02);
              box-shadow: 0 0 20px rgba(255, 209, 102, 0.4);
            }
          }

          .q2-completed-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 30px;
          }

          .q2-btn {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #fff;
            padding: 12px 24px;
            border-radius: 14px;
            cursor: pointer;
            font-weight: 600;
            font-family: 'Poppins', sans-serif;
            font-size: 15px;
            transition: all 0.3s ease;
          }
          
          .q2-btn:hover {
            transform: translateY(-3px);
            background: rgba(255, 255, 255, 0.09);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          }
          
          .q2-btn.q2-primary {
            background: linear-gradient(180deg, #2db2ff, #9333ea);
            color: #000;
            border: none;
            font-weight: 700;
          }
          
          .q2-btn.q2-primary:hover {
            background: linear-gradient(180deg, #2db2ff, #9333ea);
            box-shadow: 0 8px 30px rgba(131, 83, 255, 0.3);
          }

          .q2-btn.q2-secondary {
            background: transparent;
            border: 1px dashed rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.9);
          }
          
          .q2-btn.q2-secondary:hover {
            background: rgba(255, 255, 255, 0.05);
            border-style: solid;
          }

          .q2-completed-details {
            margin-top: 25px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: ${showDetails ? '20px' : '0'};
            overflow: hidden;
            transition: all 0.5s ease;
            border: 1px solid rgba(255, 255, 255, 0.05);
            max-height: ${showDetails ? '300px' : '0'};
          }

          .q2-completed-details-toggle {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.7);
            padding: 10px 20px;
            margin-top: 10px;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s ease;
            font-size: 14px;
            font-family: 'Poppins', sans-serif;
          }
          
          .q2-completed-details-toggle:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .q2-completed-details-item {
            display: flex;
            justify-content: space-between;
            margin: 12px 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 15px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .q2-completed-details-item:last-child {
            border-bottom: none;
          }

          .q2-completed-details-label {
            color: rgba(255, 255, 255, 0.6);
          }

          .q2-completed-details-value {
            color: #8353ff;
            font-weight: 600;
          }

          canvas#q2-confetti-canvas {
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            width: 100%;
            height: 100%;
            z-index: 9999;
          }

          @media (max-width: 760px) {
            .q2-completed-stats {
              flex-direction: column;
              align-items: center;
              gap: 15px;
            }
            
            .q2-completed-stat-box {
              width: 200px;
            }
            
            .q2-completed-buttons {
              flex-direction: column;
            }
            
            .q2-btn {
              width: 100%;
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

          }
        `}
      </style>

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
      
      <canvas id="q2-confetti-canvas" ref={canvasRef}></canvas>
      
      <div className="q2-completed-root">
        <div className="q2-completed-card">
          <div className="q2-completed-ribbon">QUIZ COMPLETED</div>
          
          <h1 className="q2-completed-title">Congratulations! 🎉</h1>
          <p className="q2-completed-subtitle">You have completed the quiz challenge</p>
          
          <div className="q2-completed-performance">
            {getPerformanceMessage()}
          </div>
          
          <div className="q2-completed-stats">
            <div className="q2-completed-stat-box">
              <div className="q2-completed-stat-value">{totalScore}</div>
              <div className="q2-completed-stat-label">SCORE</div>
            </div>
            
            <div className="q2-completed-stat-box">
              <div className="q2-completed-stat-value">{answered}</div>
              <div className="q2-completed-stat-label">ANSWERED</div>
            </div>
            
            <div className="q2-completed-stat-box">
              <div className="q2-completed-stat-value">{accuracy}%</div>
              <div className="q2-completed-stat-label">ACCURACY</div>
            </div>

            <div className="q2-completed-stat-box">
              <div className="q2-completed-stat-value">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</div>
              <div className="q2-completed-stat-label">TIME</div>
            </div>
          </div>
          
          <div className="q2-completed-accuracy">
            <div className="q2-completed-accuracy-label">
              <span>Your Accuracy</span>
              <span>{accuracy}%</span>
            </div>
            <div className="q2-completed-accuracy-bar">
              <div className="q2-completed-accuracy-fill"></div>
            </div>
          </div>
          
          <button 
            className="q2-completed-details-toggle"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          <div className="q2-completed-details">
            <div className="q2-completed-details-item">
              <span className="q2-completed-details-label">Total Questions Attempted:</span>
              <span className="q2-completed-details-value">{answered}</span>
            </div>
            <div className="q2-completed-details-item">
              <span className="q2-completed-details-label">Correct Answers:</span>
              <span className="q2-completed-details-value">{totalScore}</span>
            </div>
            <div className="q2-completed-details-item">
              <span className="q2-completed-details-label">Incorrect Answers:</span>
              <span className="q2-completed-details-value">{answered - totalScore}</span>
            </div>
            <div className="q2-completed-details-item">
              <span className="q2-completed-details-label">Accuracy Rate:</span>
              <span className="q2-completed-details-value">{accuracy}%</span>
            </div>
            <div className="q2-completed-details-item">
              <span className="q2-completed-details-label">Performance Level:</span>
              <span className="q2-completed-details-value">{getPerformanceMessage().replace('!', '')}</span>
            </div>
            <div className="q2-completed-details-item">
              <span className="q2-completed-details-label">Time Taken:</span>
              <span className="q2-completed-details-value">{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
          
          <div className="q2-completed-buttons">
            <button className="q2-btn q2-secondary" onClick={handleRetry}>
              RETRY QUIZ
            </button>
            <button className="q2-btn q2-primary" onClick={() => navigate('/homepage')} >
              BACK TO HOME
            </button>
            <button className="q2-btn q2-primary" onClick={() => navigate('/feedback')} >
              FEEDBACK
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Completed;
