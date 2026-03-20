import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import './dynamic-lesson.css';

const lessonData = {
  "10": {
    "01": {
      title: "Information and Communication Technology",
      background: "https://www.ibusinesscap.com.my/wp-content/uploads/2023/10/1688750752478.jpeg"
    },
    "02": {
      title: "Fundamentals of a computer system",
      background: "https://yaarishayari.com/wp-content/uploads/2025/03/CF-Image.png"
    },
    "03": {
      title: "Data Representation Methods in the Computer system",
      background: "https://d14qv6cm1t62pm.cloudfront.net/ccbp-website/Blogs/home/data-representation-in-computer-organization-and-its-types-home.png"
    },
    "04": {
      title: "Logic Gates with Boolean Functions",
      background: "https://images.squarespace-cdn.com/content/v1/554ebbf2e4b069b360b75a50/5f5d1709-8801-47b2-9a40-f23e9a219b73/05+-+Logic+gates+copy.001.png?format=2500w%22"
    },
    "05": {
      title: "Operating Systems",
      background: "https://i.imgur.com/qdOfF26_d.webp?maxwidth=760&fidelity=grand"
    },
    "06": {
      title: "Word Processing",
      background: "https://i.imgur.com/UjaXDIq_d.webp?maxwidth=760&fidelity=grand"
    },
    "07": {
      title: "Electronic Spreadsheet",
      background: "https://i.imgur.com/g4quAhk_d.webp?maxwidth=760&fidelity=grand"
    },
    "08": {
      title: "Electronic Presentations",
      background: "https://cdn2.slidemodel.com/wp-content/uploads/0_how-to-make-powerpoint-presentation-cover.png"
    },
    "09": {
      title: "Database",
      background: "https://www.dbta.com/Images/Default.aspx?ImageID=19031"
    },

  },
  "11": {
    "01": {
      title: "Programming",
      background: "https://i.imgur.com/t2DzT9M_d.webp?maxwidth=1520&fidelity=grand"
    },
    "02": {
      title: "System Development Life Cycle",
      background: "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*vafo6t1qd2yv_g9O.png"
    },
    "03": {
      title: "The Internet and the Electronic Mail",
      background: "https://kvrwebtech.com/blog/wp-content/uploads/2023/10/Email-Open-Rate.jpg"
    },
    "04": {
      title: "Advanced Networking",
      background: "https://images.squarespace-cdn.com/content/v1/554ebbf2e4b069b360b75a50/5f5d1709-8801-47b2-9a40-f23e9a219b73/05+-+Logic+gates+copy.001.png?format=2500w%22"
    },
    "05": {
      title: "Operating System",
      background: "https://i.imgur.com/qdOfF26_d.webp?maxwidth=760&fidelity=grand"
    },
    "06": {
      title: "Information and Communication Technology and Society",
      background: "https://ec.europa.eu/eurostat/cache/infographs/ict/images/digital-hp-cover.jpg"
    }

  }
};

function DynamicLesson() {
  const { grade, lessonNumber } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [relatedQuizzes, setRelatedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(true);
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [progressClicked, setProgressClicked] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const youtubePlayerRef = useRef(null);

  // Gamified completion function
  const showGamifiedCompletion = () => {
    setShowCompletionPopup(true);
  };

  // Function to convert YouTube URL to embed URL
  const convertToEmbedUrl = (url) => {
    if (!url) return url;

    // Handle different YouTube URL formats
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }

    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    // Return original URL if not YouTube
    return url;
  };

  useEffect(() => {
    fetchLessonData();
  }, [grade, lessonNumber]);

  // Load YouTube API and initialize player for YouTube videos
  useEffect(() => {
    if (lesson && lesson.content_type === 'youtube') {
      // Load YouTube IFrame Player API
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      // Initialize player when API is ready
      window.onYouTubeIframeAPIReady = () => {
        const player = new window.YT.Player(youtubePlayerRef.current, {
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setVideoCompleted(true);
              }
            }
          }
        });
        setYoutubePlayer(player);
      };

      // If API is already loaded, initialize immediately
      if (window.YT && window.YT.Player) {
        window.onYouTubeIframeAPIReady();
      }
    }
  }, [lesson]);

  useEffect(() => {
    const handleFocus = () => {
      fetchLessonData();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [grade, lessonNumber]);

  const fetchLessonData = async () => {
    try {
      // Fetch lessons for this grade
      const lessonsResponse = await api.get(`/api/lessons/grade/${grade}`);
      const lessons = lessonsResponse.data;
      setAllLessons(lessons);

      // Find the lesson by lesson number (assuming lessons are ordered)
      const lessonIndex = parseInt(lessonNumber) - 1;
      if (lessons[lessonIndex]) {
        setLesson(lessons[lessonIndex]);

        // Fetch related quizzes
        const quizzesResponse = await api.get('/api/quizzes');
        const related = quizzesResponse.data.filter(quiz =>
          quiz.lesson_id === lessons[lessonIndex]._id
        );
        setRelatedQuizzes(related);
      } else {
        setError('Lesson not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizStart = (quizId) => {
    navigate(`/quiz2/${grade}/${lessonNumber}`);
  };

  const handleIncreaseLessonProgress = async () => {
    if (!progressClicked && lesson) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await api.post(`/api/progress/lesson/${lesson._id}`, {
          score: 100,
          completed: true
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200 || response.status === 201) {
          setProgressClicked(true);
          showGamifiedCompletion();
        }
      } catch (err) {
        console.error('Failed to update progress:', err);
        alert('Failed to update progress. Please try again.');
      }
    }
  };

  // Auto-mark lesson as complete when video ends
  const handleVideoComplete = async () => {
    setVideoCompleted(true);
    if (lesson) {
      try {
        const token = sessionStorage.getItem('token');
        await api.post(`/api/progress/lesson/${lesson._id}`, {
          score: 100,
          completed: true
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProgressClicked(true);
      } catch (err) {
        console.error('Failed to auto-update progress:', err);
      }
    }
  };

  const currentLesson = lessonData[grade]?.[lessonNumber] || {};
  
  // Get the lesson image - prefer database image_url, fall back to hardcoded background
  const lessonImage = lesson?.image_url || currentLesson.background || 'https://yaarishayari.com/wp-content/uploads/2025/03/CF-Image.png';

  if (loading) {
    return <div className="container">Loading lesson...</div>;
  }

  if (error || !lesson) {
    return <div className="container">Error: {error || 'Lesson not found'}</div>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');

        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: 'Orbitron', monospace;
          background: linear-gradient(to bottom, #504C9F, #0B0A1A);
          color: #eee;
          overflow: hidden;
        }

        body::before {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, #423c82 0%, #180a29 100%);
          opacity: 0.3;
          z-index: 0;
        }

        .container {
          position: relative;
          height: 100vh;
          width: 100vw;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-container {
          position: fixed;
          top: 20px;
          left: 20px;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle at center, #2c1b62, #170934);
          border-radius: 50%;
          box-shadow: 0 0 10px #59389c;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .logo-container:hover {
          box-shadow: 0 0 20px #9b59b6, 0 0 40px #2980b9;
          transform: scale(1.1);
        }

        .logo-container img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
        }

        .help-icon {
          position: fixed;
          top: 100px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid #ccc;
          color: #ccc;
          font-size: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .help-icon:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .help-popup {
          position: fixed;
          top: 150px;
          right: 20px;
          width: 300px;
          background: rgba(0, 0, 0, 0.8);
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 30px;
          color: #eee;
          font-family: Britannic Bold;
          text-align: justify;
          font-size: 17px;
          z-index: 12;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
          display: none;
        }

        .help-popup.show {
          display: block;
        }

        p {
          text-align: center;
          font-family: Orbitron;
        }

        h2 {
          text-align: center;
          font-family: nicomoji;
          font-size: 35px;
        }

        .lesson-title {
          font-size: 38px;
          margin-top: 70px;
          margin-bottom: 30px;
          position: relative;
        }

        .lesson-title::before {
          content: '';
          position: absolute;
          inset: -40px -200px;
          background-image: url("${lessonImage}");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 16px;
          z-index: -2;
          filter: blur(5px);
        }

        .lesson-title::after {
          content: '';
          position: absolute;
          inset: -10px -25px;
          background: black;
          border-radius: 10px;
          z-index: -1;
        }

        .video-container {
          margin-top: 40px;
          margin-bottom: 20px;
          width: 800px;
          min-height: 450px;
          max-height: 950px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 0px;
          box-shadow: 0 0 40px rgba(66, 60, 130, 0.7);
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 0px;
        }

        .video-container > div {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .video-container > div iframe {
          max-width: 100%;
          max-height: 100%;
          border: none;
        }

        .video-container > div script {
          display: none;
        }

        .video-container.h5p-container {
          overflow: visible;
          background: transparent;
        }

        .video-container.h5p-container > div {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
        }

        .text-content {
          position: absolute;
          left: -300px;
          top: 50%;
          transform: translateY(-50%);
          width: 300px;
          max-height: 80vh;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 20px rgba(66, 60, 130, 0.7);
          transition: left 0.3s ease;
          z-index: 15;
        }

        .text-content.open {
          left: 20px;
        }

        .quizzes-section {
          margin-top: 20px;
          margin-bottom: 20px;
          width: 600px;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 0 20px rgba(66, 60, 130, 0.7);
        }

        .bottom-nav {
          margin-top: auto;
          margin-bottom: 30px;
          display: flex;
          gap: 40px;
        }

        .nav-icon {
          font-size: 10px;
          color: #ffffffff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-icon:hover {
          color: #fff;
          filter: drop-shadow(0 0 8px #fff);
        }

        .nav-icon.center {
          position: relative;
          color: #fff;
        }

        .nav-icon.center::before {
          content: '';
          position: absolute;
          inset: -5px;
          background: red;
          border-radius: 50%;
          z-index: -1;
        }

        .icon-menu svg {
          width: 30px;
          height: 30px;
          fill: currentColor;
          margin-bottom: -1px;
        }

        .icon-home svg {
          width: 30px;
          height: 30px;
          fill: currentColor;
          margin-bottom: -1px;
        }

        .icon-target svg {
          width: 35px;
          height: 30px;
          fill: currentColor;
          margin-bottom: -1px;
        }

        .icon-user svg {
          width: 30px;
          height: 30px;
          fill: currentColor;
          margin-bottom: -1px;
        }

        .icon-settings svg {
          width: 30px;
          height: 30px;
          fill: currentColor;
          margin-bottom: -1px;
        }

        .icon-target svg circle {
          stroke: #ccc;
          stroke-width: 2;
          fill: none;
        }

        .icon-target svg circle:nth-child(2) {
          fill: #000000ff;
        }

        .start-quiz-button {
          background: #9b59b6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-family: 'Orbitron', monospace;
          transition: background 0.3s ease;
        }

        .start-quiz-button:hover {
          background: #8e44ad;
        }

        .vertical-title {
          position: absolute;
          top: 50%;
          right: 60px;
          transform: translateY(-50%) rotate(-90deg);
          font-size: 24px;
          font-family: nicomoji;
          color: #eee;
          z-index: 16;
          white-space: nowrap;
        }


      `}</style>

      <div className="container">
        {/* Logo */}
        <div className="logo-container">
          <img
            src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand"
            alt="Smart O/L ICT Logo"
          />
        </div>

        {/* Help */}
        <div className="help-icon" onClick={() => setShowHelp(!showHelp)}>
          ?
        </div>

        {/* Help Popup */}
        <div className={`help-popup ${showHelp ? 'show' : ''}`}>
          <h2>Hints & Help</h2>
          <hr />
          <br />
          <div>
            <h3>Welcome to Grade {grade} Lesson {lessonNumber}!</h3>
          </div>
          <div>
            <h3>Here are some tips:</h3>
          </div>
          <br />
          <ul>
            <li>Watch the video to understand the topic.</li>
            <li>Use the ⇨ at the bottom to explore.</li>
            <li>Click + at the right bottom of the video to mark done for complete watching the video.</li>
            <li>Click the 🔴 to take a quiz.</li>
            <li>If you need more help, contact your teacher.</li>
          </ul>
          <br />
          <hr />
          <br />
          <p>Click the ? again to close this box.</p>
        </div>

        {/* Back Button */}
        <button
          className="back-button"
          style={{
            position: 'fixed',
            top: '170px',
            left: '180px',
            background: '#9b59b6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            zIndex: 10
          }}
          onClick={() => navigate(`/grade${grade}lessons`)}
        >
          ← Back to Lessons
        </button>

        {/* Title */}
        <h1 className="lesson-title">{currentLesson.title || lesson.lesson_title}</h1>

        {/* Video */}
        <div className={`video-container ${lesson.content_type === 'youtube' ? 'youtube-container' : ''}`}>
          {lesson.content_type === 'video' ? (
            <video
              src={`http://localhost:5000${lesson.content_url}`}
              title={`${currentLesson.title || lesson.lesson_title} Video`}
              controls
              style={{ width: '100%', height: '100%' }}
              onEnded={() => setVideoCompleted(true)}
            />
          ) : (
            <iframe
              ref={youtubePlayerRef}
              src={convertToEmbedUrl(lesson.content_url)}
              title={`${currentLesson.title || lesson.lesson_title} Video`}
              allow="autoplay; fullscreen; geolocation; microphone; camera; midi; encrypted-media"
              allowFullScreen
            />
          )}
          {/* Progress Button */}
          <button
            onClick={handleIncreaseLessonProgress}
            disabled={progressClicked || videoCompleted}
            title="Click to complete lesson"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: (progressClicked || videoCompleted) ? 'green' : '#4b6cff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '3px 6px',
              cursor: (progressClicked || videoCompleted) ? 'not-allowed' : 'pointer',
              fontSize: '1.5rem',
              zIndex: 25
            }}
          >
            +
          </button>
        </div>

        {/* Gamified Completion Popup */}
        {showCompletionPopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }} onClick={() => setShowCompletionPopup(false)}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '40px 60px',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(102, 126, 234, 0.8)',
              animation: 'popIn 0.5s ease'
            }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
              <h2 style={{ 
                color: '#fff', 
                fontSize: '28px', 
                margin: '0 0 10px 0',
                fontFamily: 'Orbitron, monospace'
              }}>Lesson Completed!</h2>
              <p style={{ 
                color: '#fff', 
                fontSize: '16px',
                margin: '0 0 20px 0'
              }}>Great job! You've completed this lesson.</p>
              <button 
                onClick={() => setShowCompletionPopup(false)}
                style={{
                  background: '#fff',
                  color: '#667eea',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 'bold'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        <style>{`
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Toggle Button */}
        <button
          className="toggle-content-button"
          onClick={() => setIsContentOpen(!isContentOpen)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '15px',
            transform: 'translateY(-50%)',
            background: '#9b59b6',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Orbitron, monospace',
            zIndex: 20,
            transition: 'background 0.3s ease'
          }}
        >
          <h3>{isContentOpen ? '⇦' : '⇨'}</h3>
        </button>

        {/* Lesson Content */}
        <div className={`text-content ${isContentOpen ? 'open' : ''}`}>
          <div className="content-text" dangerouslySetInnerHTML={{ __html: lesson.lesson_content }} />Lesson Content
        </div>



        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <Link to="/dashboard" className="nav-icon icon-menu">
            <svg viewBox="0 0 24 24">
              <rect y="4" width="24" height="2" />
              <rect y="11" width="24" height="2" />
              <rect y="18" width="24" height="2" />
            </svg>
          </Link>

          <Link to="/homepage" className="nav-icon icon-home">
            <svg viewBox="0 0 24 24">
              <path d="M12 3l10 9h-3v9h-6v-6H11v6H5v-9H2z" />
            </svg>
          </Link>

          <div className="nav-icon icon-target center" onClick={() => relatedQuizzes.length > 0 && handleQuizStart(relatedQuizzes[0]._id)}>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="5" fill="#180A29" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          <Link to="/profile" className="nav-icon icon-user">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 8-4 8-4s8 0 8 4v1H4z" />
            </svg>
          </Link>

          <Link to="/setting" className="nav-icon icon-settings">
            <svg viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </Link>
        </nav>
      </div>
    </>
  );
}

export default DynamicLesson;