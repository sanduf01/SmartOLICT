import React, { useState, useEffect, useRef } from "react";
import "./dashboard.css";
import logo from "../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Dashboard() {
  const [activeItem, setActiveItem] = useState("HOME PAGE");
  const [accuracy, setAccuracy] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [progress, setProgress] = useState(0);
  const [grade10Completed, setGrade10Completed] = useState(0);
  const [grade10Total, setGrade10Total] = useState(0);
  const [grade11Completed, setGrade11Completed] = useState(0);
  const [grade11Total, setGrade11Total] = useState(0);
  const [username, setUsername] = useState("User");
  const [provider, setProvider] = useState("local");
  const [profileImage, setProfileImage] = useState(null);
  const [userRole, setUserRole] = useState("student");
  const [userGoal, setUserGoal] = useState('');
  const [quickActionModal, setQuickActionModal] = useState({ open: false, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [quickActionInput, setQuickActionInput] = useState('');
  const [quickActionMessage, setQuickActionMessage] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const menuItems = [
    "HOME PAGE",
    "LEADERBOARD",
    "VIEW PROGRESS",
    "PROFILE",
    "SETTINGS",
    ...(userRole === 'admin' ? ["MANAGE USERS"] : []),
    ...(userRole === 'admin' || userRole === 'teacher' ? ["MANAGE NOTIFICATIONS", "MANAGE CONTENT"] : [])
  ];
  const location = useLocation();


  // Fetch dashboard data
  const fetchDashboardData = () => {
    const token = sessionStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch grade-specific lessons and user progress
    Promise.all([
      fetch("http://localhost:5000/api/lessons/grade/10", { headers }),
      fetch("http://localhost:5000/api/lessons/grade/11", { headers }),
      fetch("http://localhost:5000/api/progress", { headers })
    ])
      .then(async ([g10Res, g11Res, progressRes]) => {
        if (!g10Res.ok) throw new Error('Failed to fetch grade 10 lessons');
        if (!g11Res.ok) throw new Error('Failed to fetch grade 11 lessons');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');

        const lessons10 = await g10Res.json();
        const lessons11 = await g11Res.json();
        const progressRecords = await progressRes.json();

        const total10 = Array.isArray(lessons10) ? lessons10.length : 0;
        const total11 = Array.isArray(lessons11) ? lessons11.length : 0;

        // helper to check if a progress record matches a lesson
        const matchesLesson = (p, lesson) => {
          if (!p || !lesson) return false;
          // Handle both populated (object) and non-populated (ObjectId string) lesson
          const pid = p.lesson?._id || p.lesson || p.lesson_id || p.lessonId;
          const lid = lesson._id || lesson.lesson_id || lesson.id;
          try {
            return pid && lid && (String(pid) === String(lid));
          } catch (e) { return false; }
        };

        const completed10 = total10 > 0
          ? lessons10.filter(lesson => progressRecords.some(p => matchesLesson(p, lesson) && p.completed)).length
          : 0;

        const completed11 = total11 > 0
          ? lessons11.filter(lesson => progressRecords.some(p => matchesLesson(p, lesson) && p.completed)).length
          : 0;

        const totalLessons = total10 + total11;
        const completedLessons = completed10 + completed11;

        setGrade10Total(total10);
        setGrade10Completed(completed10);
        setGrade11Total(total11);
        setGrade11Completed(completed11);

        setCompleted(completedLessons);
        setTotalLessons(totalLessons);
        setProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);

        // estimate accuracy from progress scores if available
        try {
          const scores = (Array.isArray(progressRecords) ? progressRecords.map(p => p.score).filter(s => typeof s === 'number') : []);
          if (scores.length > 0) setAccuracy(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
        } catch (e) { }

        // Extract recent activities from progress records
        // Sort by last_updated in descending order (newest first)
        const sortedProgress = Array.isArray(progressRecords) 
          ? [...progressRecords].sort((a, b) => {
              const dateA = new Date(a.last_updated || a.updatedAt || a.createdAt || 0);
              const dateB = new Date(b.last_updated || b.updatedAt || b.createdAt || 0);
              return dateB - dateA; // Descending order (newest first)
            })
          : [];
        
        const activities = sortedProgress
          .filter(p => p.completed || p.score !== undefined)
          .slice(0, 3) // Take top 3 recent activities
          .map(p => ({
            text: p.completed ? `Completed lesson: ${p.lesson?.lesson_title || 'Unknown Lesson'}` : `Scored ${p.score}% in quiz`,
            time: formatLocalTime(p.last_updated || p.updatedAt || p.createdAt)
          }));
        setRecentActivities(activities);
      })
      .catch((err) => console.error("Failed to fetch dashboard data:", err));
  };

  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
    // Get username from sessionStorage
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUsername(decoded.username);
        setProvider(decoded.provider);
        setUserRole(decoded.effectiveRole);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    // Check for openGoals query parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openGoals') === 'true') {
      setQuickActionModal({ open: true, action: 'goals' });
      // Clean up URL
      window.history.replaceState(null, null, window.location.pathname);
    }
  }, []);


  const handleRefresh = () => {
    // Option 1: Re-fetch data
    console.log("Refreshing dashboard data...");

    // simulate refresh animation / reload
    window.location.reload();
  };

  const fetchProfile = () => {
    const token = sessionStorage.getItem('token');
    fetch("http://localhost:5000/api/users/profile", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.profileImage) {
          let imageUrl = data.profileImage;
          if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
            // Assume base64
            imageUrl = `data:image/png;base64,${imageUrl}`;
          }
          setProfileImage(imageUrl);
        }
      })
      .catch((err) =>
        console.error("Failed to fetch profile:", err)
      );
  };
  const handleExport = () => {
    const data = [
      { label: "Accuracy", value: `${accuracy}%` },
      { label: "Completed", value: completed },
      { label: "Progress", value: `${progress}%` }
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      data.map(e => `${e.label},${e.value}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick action handlers
  const handleOpenQuickAction = (action) => {
    setQuickActionModal({ open: true, action });
  };

  const handleCloseQuickAction = () => {
    setQuickActionModal({ open: false, action: null });
    setActionLoading(false);
  };

  const handleSync = () => {
    setActionLoading(true);
    setQuickActionMessage('');
    // Simulate sync operation
    setTimeout(() => {
      setActionLoading(false);
      setQuickActionMessage('Sync complete');
      setTimeout(() => {
        handleCloseQuickAction();
        setQuickActionMessage('');
      }, 900);
    }, 1400);
  };

  const saveGoal = () => {
    if (!quickActionInput || quickActionInput.trim().length === 0) {
      setQuickActionMessage('Please enter a short goal');
      return;
    }
    // Save goal to localStorage
    localStorage.setItem('userGoal', quickActionInput.trim());
    setQuickActionMessage(`Goal saved: ${quickActionInput}`);
    // Add to recent activities
    addRecentActivity(`Set goal: ${quickActionInput.trim()}`);
    setTimeout(() => {
      setQuickActionInput('');
      handleCloseQuickAction();
      setQuickActionMessage('');
    }, 900);
  };

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleCloseQuickAction(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
      <div className="dashboard-container">
        {/* Left Navigation Sidebar */}
        <div className="nav-sidebar">
          <div className="sidebar-header">
            <img src={logo} alt="Smart O/ICT Logo" className="sidebar-logo" />
            <h2 className="sidebar-title">Dashboard</h2>
          </div>

          <div className="nav-section">
            <ul className="nav-menu">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className={`nav-item ${activeItem === item ? 'active' : ''}`}
                  onClick={() => {
                    setActiveItem(item);
                    // Set refresh flag when navigating to leaderboard
                    if (item === "LEADERBOARD") {
                      sessionStorage.setItem('refreshLeaderboard', 'true');
                    }
                  }}
                >
                  <span className="nav-icon">◆</span>
                  <Link to={
                    item === "HOME PAGE" ? "/homepage" :
                      item === "LEADERBOARD" ? "/leaderboard" :
                        item === "VIEW PROGRESS" ? "/progress" :
                          item === "PROFILE" ? "/profile" :
                            item === "SETTINGS" ? "/setting" :
                              item === "MANAGE USERS" ? "/manage-users" :
                                item === "MANAGE NOTIFICATIONS" ? "/manage-notifications" :
                                  item === "MANAGE CONTENT" ? "/manage-content" : "/"}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="user-section">
            <div className={`user-avatar ${profileImage ? 'has-image' : ''}`} style={profileImage ? { backgroundImage: `url(${profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}></div>
            <p className="username">Welcome {username}!</p>
            <p className="login-provider">Logged in via {provider === 'google' ? 'Google' : 'Local Account'}</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <div className="content-header">
            <h1>Dashboard Overview</h1>
            <div className="header-actions">
              <button className="action-btn" onClick={handleRefresh}>Refresh</button>
              <button className="action-btn" onClick={handleExport}>Export</button>
            </div>
          </div>

          <div className="content-grid">
            {/* Progress Card */}
            <div className="content-card-progress-card">
              <h3 className="content-card-title">Completion Progress</h3>
              <div className="progress-display">
                <div className="progress-number"><div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 16 }}>Grade 10: <strong>{grade10Completed}/{grade10Total}</strong> <span style={{fontSize: 20, color:"#4891ff" }}>({grade10Total > 0 ? Math.round((grade10Completed / grade10Total) * 100) : 0}%)</span></div>
                  <div style={{ fontSize: 16 }}>Grade 11: <strong>{grade11Completed}/{grade11Total}</strong> <span style={{ fontSize: 20, color:"#4891ff" }}>({grade11Total > 0 ? Math.round((grade11Completed / grade11Total) * 100) : 0}%)</span></div>
                </div>
                </div>
                <div className="progress-visual">
                  <div className="progress-circle">
                    <div className="circle-bg"></div>
                    <div className="circle-fill"></div>
                    <div className="circle-text">{progress}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="content-card-stats-card">
              <h3 className="content-card-title">Performance Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{accuracy}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{completed}</span>
                  <span className="stat-label">Completed</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{totalLessons - completed}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="content-card-activity-card">
              <h3 className="content-card-title">Recent Activity</h3>
              <ul className="activity-list">
                {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                  <li key={index} className="activity-item">
                    <span className="activity-dot"></span>
                    <span className="activity-text">{activity.text}</span>
                    <span className="activity-time">{activity.time}</span>
                  </li>
                )) : (
                  <li className="activity-item">
                    <span className="activity-text">No recent activities</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="content-card-actions-card">
              <h3 className="content-card-title">Quick Actions</h3>
              <div className="actions-grid">
                <button className="quick-action" onClick={() => handleOpenQuickAction('reports')}>
                  <span className="action-icon">📊</span>
                  <span>View Reports</span>
                </button>
                <button className="quick-action" onClick={() => handleOpenQuickAction('goals')}>
                  <span className="action-icon">🎯</span>
                  <span>Set Goals</span>
                </button>
                <button className="quick-action" onClick={() => handleOpenQuickAction('resources')}>
                  <span className="action-icon">📚</span>
                  <span>Resources</span>
                </button>
                <button className="quick-action" onClick={() => handleOpenQuickAction('sync')}>
                  <span className="action-icon">🔄</span>
                  <span>Sync Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Quick Action Modal */}
        {quickActionModal.open && (
          <div className="modal-overlay" onClick={handleCloseQuickAction}>
            <div className="modal" role="dialog" aria-modal="true" ref={modalRef} onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseQuickAction}>✕</button>
              <h2>{getActionTitle(quickActionModal.action)}</h2>
              <div className="modal-body">
                {quickActionModal.action === 'reports' && (
                  <>
                    <p>Generate or download your latest performance reports.</p>
                    <ul>
                      <li>Export CSV, PDF</li>
                      <li>Filter by date or course</li>
                    </ul>
                  </>
                )}

                {quickActionModal.action === 'goals' && (
                  <>
                    <p>Set a short-term learning goal.</p>
                    <input
                      value={quickActionInput}
                      onChange={(e) => setQuickActionInput(e.target.value)}
                      placeholder='e.g., Finish module 3'
                      style={{ width: '100%', padding: 8, marginTop: 8 }}
                    />
                    {quickActionMessage && <div style={{ marginTop: 8, color: '#0b0' }}>{quickActionMessage}</div>}
                  </>
                )}

                {quickActionModal.action === 'resources' && (
                  <>
                    <p>Open curated learning materials and references.</p>
                    <p>Navigate to the homepage resources section.</p>
                  </>
                )}

                {quickActionModal.action === 'sync' && (
                  <>
                    <p>Sync your offline progress with the server now.</p>
                    {quickActionMessage && <div style={{ marginTop: 8, color: '#0b0' }}>{quickActionMessage}</div>}
                  </>
                )}

                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  {quickActionModal.action === 'reports' && (
                    <button className="action-btn" onClick={() => { navigate('/progress'); handleCloseQuickAction(); }}>Open Reports</button>
                  )}
                {quickActionModal.action === 'goals' && (
                    <button className="action-btn" onClick={saveGoal}>Save Goal</button>
                  )}
                  {quickActionModal.action === 'goals' && (
                    <button className="action-btn" onClick={() => { navigate('/profile'); handleCloseQuickAction(); }}>Go to Profile</button>
                  )}
                  {quickActionModal.action === 'resources' && (
                    <button className="action-btn" onClick={() => { navigate('/homepage'); handleCloseQuickAction(); }}>Browse Resources</button>
                  )}
                  {quickActionModal.action === 'sync' && (
                    <button className="action-btn" onClick={handleSync} disabled={actionLoading}>{actionLoading ? 'Syncing...' : 'Start Sync'}</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Helper functions outside component render
function getActionTitle(action) {
  switch (action) {
    case 'reports': return 'Quick Reports';
    case 'goals': return 'Set Learning Goals';
    case 'resources': return 'Resources & Links';
    case 'sync': return 'Sync Data';
    default: return '';
  }
}

// Add recent activity
const addRecentActivity = (text) => {
  const newActivity = { text, time: formatLocalTime(new Date()) };
  setRecentActivities(prev => [newActivity, ...prev.slice(0, 2)]); // Keep only 3 activities
};

// Format local time (e.g., "2024-01-15 10:30")
const formatLocalTime = (dateString) => {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// Render body content for each quick action (handled inline in the modal)

export default Dashboard;
