import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import "./grade11_lessons.css";

const Grade11Lessons = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressData, setProgressData] = useState([]);
  const userRole = localStorage.getItem('role');

  const lessonImages = {
  "Lesson 1 Title": "https://i.imgur.com/t2DzT9M_d.webp?maxwidth=1520&fidelity=grand",
  "Lesson 2 Title": "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*vafo6t1qd2yv_g9O.png",
  "Lesson 3 Title": "https://kvrwebtech.com/blog/wp-content/uploads/2023/10/Email-Open-Rate.jpg",
  "Lesson 4 Title": "https://images.squarespace-cdn.com/content/v1/554ebbf2e4b069b360b75a50/5f5d1709-8801-47b2-9a40-f23e9a219b73/05+-+Logic+gates+copy.001.png?format=2500w%22",
  "Lesson 5 Title": "https://i.imgur.com/qdOfF26_d.webp?maxwidth=760&fidelity=grand",
  "Lesson 6 Title": "https://ec.europa.eu/eurostat/cache/infographs/ict/images/digital-hp-cover.jpg",
  };

  useEffect(() => {
    fetchLessons();
    fetchProgressData();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await api.get('/api/lessons/grade/11');
      setLessons(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      const response = await api.get('/api/progress');
      setProgressData(response.data);
    } catch (err) {
      console.error('Failed to fetch progress data:', err);
    }
  };

  const matchesLesson = (p, lesson) => {
    if (!p || !lesson) return false;
    const pid = p.lesson || p.lesson_id || p.lessonId || p.lesson_id;
    const lid = lesson._id || lesson.lesson_id || lesson.id;
    try { return pid && lid && String(pid) === String(lid); } catch(e) { return false; }
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
        <h1 className="header-text">Grade 11 Lessons</h1>
      </div>
 
      <div className="progress-bar-container">
        <div className="progress-bar"></div>
      </div>
 
      <div className="lessons">
        {lessons.map((lesson, index) => {
          const progressEntry = progressData.find(p => matchesLesson(p, lesson));
          const isLessonCompleted = progressEntry ? progressEntry.completed : false;
          const quizScore = progressEntry ? progressEntry.score : 0;
          const lessonProgressWidth = isLessonCompleted ? '50%' : '0%';
          const quizProgressWidth = quizScore > 0 ? '50%' : '0%';

          return (
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

              {/* Progress Bar */}
              <div className="progress-bar-container" style={{ width: '100%', height: '15px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '7px', marginBottom: '0.5rem', overflow: 'hidden', position: 'relative' }}>
                <div className="progress-bar" style={{ height: '100%', display: 'flex', borderRadius: '7px' }}>
                  <div className="lesson-progress-fill" style={{ width: lessonProgressWidth, height: '100%', background: 'linear-gradient(90deg, #4b6cff, #c048ff)', transition: 'width 0.3s ease', boxShadow: '0 0 5px rgba(75, 108, 255, 0.5)' }}></div>
                  <div className="quiz-progress-fill" style={{ width: quizProgressWidth, height: '100%', background: 'linear-gradient(90deg, #4caf50, #66bb6a)', transition: 'width 0.3s ease', boxShadow: '0 0 5px rgba(76, 175, 80, 0.5)' }}></div>
                </div>
                <div className="progress-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', fontWeight: 'bold', color: 'white', textShadow: '0 0 5px rgba(0, 0, 0, 0.5)', zIndex: 1 }}>
                  {Math.round((isLessonCompleted ? 50 : 0) + (quizScore > 0 ? 50 : 0))}%
                </div>
              </div>

              {/* Scores */}
              {isLessonCompleted && (
                <div className="lesson-score">Lesson Score: 50</div>
              )}
              {quizScore > 0 && (
                <div className="quiz-score">Quiz Score: {quizScore}</div>
              )}

              <div className="lesson-buttons">
                <button className="start-button" onClick={() => navigate(`/lesson/11/${index + 1}`)}>start</button>
                {(userRole === 'teacher' || userRole === 'admin') && (
                  <button
                    className="edit-button"
                    onClick={() => navigate(`/manage-content?grade=11&lesson=${lesson._id}`)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
 
export default Grade11Lessons;
 