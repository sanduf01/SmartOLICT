import React, { useState, useEffect } from "react";
import "./leaderboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";

function Leaderboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // Get logged-in user info from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    console.log('localStorage user:', user);
    console.log('localStorage role:', role);
    if (user) {
      const parsedUser = JSON.parse(user);
      console.log('Parsed user:', parsedUser);
      setCurrentUser(parsedUser);
    }
  }, []);

  // Fetch leaderboard data
  const fetchLeaderboard = () => {
    api.get('/api/leaderboard')
      .then(res => {
        const data = res.data;
        console.log('Leaderboard data from server:', data);
        const processedData = data.map((item, index) => ({
          rank: index + 1,
          user_id: item.user_id,
          name: item.username,
          score: item.totalScore,
          profileImage: item.profileImage
        }));
        console.log('Processed leaderboard:', processedData);
        setLeaderboard(processedData);
      })
      .catch(err => console.error('Failed to fetch leaderboard:', err));
  };

  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem('refreshLeaderboard');
    if (shouldRefresh === 'true') {
      sessionStorage.removeItem('refreshLeaderboard');
      fetchLeaderboard();
    }
    fetchLeaderboard();
  }, [refreshKey]);

  // Update currentUserRank when leaderboard or currentUser changes
  useEffect(() => {
    console.log('Finding user rank - leaderboard:', leaderboard, 'currentUser:', currentUser);
    if (leaderboard.length > 0 && currentUser) {
      let userEntry = null;
      if (currentUser.user_id) {
        userEntry = leaderboard.find(item => item.user_id === currentUser.user_id);
        console.log('Matched by user_id:', userEntry);
      }
      
      if (!userEntry && currentUser.username) {
        userEntry = leaderboard.find(item => item.name === currentUser.username);
        console.log('Matched by username:', userEntry);
      }

      if (!userEntry && currentUser.email) {
        userEntry = leaderboard.find(item => item.name === currentUser.email.split('@')[0]);
        console.log('Matched by email:', userEntry);
      }
      
      if (userEntry) {
        console.log('Setting currentUserRank:', userEntry);
        setCurrentUserRank(userEntry);
      }
    }
  }, [leaderboard, currentUser]);

  return (
    <div className="leaderboard-container">
      <div className="logo-container" aria-label="Smart O/L ICT Logo">
        <img src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand" alt="Smart O/L ICT Logo" />
      </div>

      <div className="left-board">
        <h2 className="title">Leaderboard</h2>

        <div className="you-box">
          {currentUserRank ? (
            <div className="you-content">
              <span className="you-rank">#{currentUserRank.rank}</span>
              <span className="you-name">{currentUserRank.name}</span>
              <span className="you-score">{currentUserRank.score}</span>
            </div>
          ) : (
            <div className="you-placeholder">
              <span className="you-icon">👤</span>
              <span className="you-text">You</span>
            </div>
          )}
        </div>

        <div className="list" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {leaderboard.map((item) => (
            <div key={item.rank} className="list-item">
              <span className="rank">{item.rank}</span>
              <span className="user-icon">
                {item.profileImage ? (
                  <img
                    src={item.profileImage.startsWith('data:') ? item.profileImage : `data:image/jpeg;base64,${item.profileImage}`}
                    alt={`${item.name}'s profile`}
                    style={{ width: '30px', height: '30px', borderRadius: '50%' }}
                  />
                ) : (
                  '👤'
                )}
              </span>
              <span className="name">{item.name}</span>
              <span className="score">{item.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="right-board">
        <div 
          className="menu-icon" 
          aria-label="Menu" 
          role="button" 
          tabIndex={0}
          style={{position: 'fixed', top: '20px', right: '20px', zIndex: 10}}
          onClick={() => navigate('/dashboard')}
        >
          <div></div>
          <div></div>
          <div></div>
        </div>

        <h2 className="title">Leaderboard</h2>

        <div className="top3-container">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((item, index) => {
            const positions = ['second', 'first', 'third'];
            if (!item) return null;
            return (
              <div key={item.rank} className={`mini-card ${positions[index]}`}>
                <div className="top-icon">
                  {item.profileImage ? (
                    <img
                      src={item.profileImage.startsWith('data:') ? item.profileImage : `data:image/jpeg;base64,${item.profileImage}`}
                      alt={`${item.name}'s profile`}
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  ) : (
                    '👤'
                  )}
                </div>
              
                <div className="top-name">{item.name}</div>
                
              </div>
            );
          })}
        </div>

        <div className="podium">
          <div className="podium-block second">2</div>
          <div className="podium-block first">1</div>
          <div className="podium-block third">3</div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
