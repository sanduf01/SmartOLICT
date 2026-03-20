import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import "./grade10_lessons.css";
 
const Grade10Lessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userRole = localStorage.getItem('role');

    const lessonImages = {
  "Lesson 1 Title": "https://www.ibusinesscap.com.my/wp-content/uploads/2023/10/1688750752478.jpeg",
  "Lesson 2 Title": "https://yaarishayari.com/wp-content/uploads/2025/03/CF-Image.png",
  "Lesson 3 Title": "https://d14qv6cm1t62pm.cloudfront.net/ccbp-website/Blogs/home/data-representation-in-computer-organization-and-its-types-home.png",
  "Lesson 4 Title": "https://images.squarespace-cdn.com/content/v1/554ebbf2e4b069b360b75a50/5f5d1709-8801-47b2-9a40-f23e9a219b73/05+-+Logic+gates+copy.001.png?format=2500w%22",
  "Lesson 5 Title": "https://i.imgur.com/qdOfF26_d.webp?maxwidth=760&fidelity=grand",
  "Lesson 6 Title": "https://i.imgur.com/UjaXDIq_d.webp?maxwidth=760&fidelity=grand",
  "Lesson 7 Title": "https://i.imgur.com/g4quAhk_d.webp?maxwidth=760&fidelity=grand",
  "Lesson 8 Title": "https://cdn2.slidemodel.com/wp-content/uploads/0_how-to-make-powerpoint-presentation-cover.png",
  "Lesson 9 Title": "https://www.dbta.com/Images/Default.aspx?ImageID=19031",
};

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await api.get('/api/lessons/grade/10');
      setLessons(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading lessons...</div>;
  }

  if (error) {
    return <div className="container">Error: {error}</div>;
  }

  return (
    <div className="container">
      <div className="header-section">
        <div className="logo-container" aria-label="Smart O/L ICT Logo">
          <img src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand" alt="Smart O/L ICT Logo" />
        </div>
        {/* Grade buttons top-right */}
        <div style={{position: 'fixed', top: '20px', right: '80px', zIndex: 10, display: 'flex', gap: '10px'}}>
          <button onClick={() => navigate('/grade10lessons')} style={{padding: '5px 10px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px'}}>10</button>
          <button onClick={() => navigate('/grade11lessons')} style={{padding: '5px 10px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '4px'}}>11</button>
        </div>
        {/* Hamburger menu top-right */}
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
        <h1 className="header-text">Grade 10 Lessons</h1>
      </div>
 
      <div className="progress-bar-container">
        <div className="progress-bar"></div>
      </div>
 
      <div className="lessons">
        {lessons.map((lesson, index) => (
          <div key={lesson._id} className="lesson-card">
            <img
              src={
                lesson.image_url
                  ? lesson.image_url
                  : lessonImages[`Lesson ${index + 1} Title`] || lessonImages[lesson.lesson_title] || "https://yaarishayari.com/wp-content/uploads/2025/03/CF-Image.png"
              }
              alt={lesson.lesson_title}
            />
            <div className="lesson-title" style={{ fontSize: "32px" }}>Lesson {(index + 1).toString().padStart(2, '0')}</div>
            <div className="lesson-buttons">
              <button className="start-button" onClick={() => navigate(`/lesson/10/${index + 1}`)}>start</button>
              {(userRole === 'teacher' || userRole === 'admin') && (
                <button className="edit-button"
  onClick={() => {
    navigate(`/manage-content?grade=10&lesson=${lesson._id}`);
  }}
>
  Edit
</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
 
export default Grade10Lessons;