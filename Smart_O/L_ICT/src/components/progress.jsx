import React, { useState, useEffect } from "react";
import "./progress.css";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function ProgressTracking() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("Grade 10");
  const [username, setUsername] = useState('User');
  const [progressData, setProgressData] = useState([]);
  const [grade10Total, setGrade10Total] = useState(0);
  const [grade10Completed, setGrade10Completed] = useState(0);
  const [grade11Total, setGrade11Total] = useState(0);
  const [grade11Completed, setGrade11Completed] = useState(0);
  const [userRole, setUserRole] = useState('');
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'students'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lessons10, setLessons10] = useState([]);
  const [lessons11, setLessons11] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState({}); // Store quiz attempts by lesson ID

  // State for calculated percentages
  const [grade10Percentage, setGrade10Percentage] = useState(0);
  const [grade11Percentage, setGrade11Percentage] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);

  const matchesLesson = (p, lesson) => {
    if (!p || !lesson) return false;
    // Handle both populated (object) and non-populated (ObjectId string) lesson
    const pid = p.lesson?._id || p.lesson || p.lesson_id || p.lessonId;
    const lid = lesson._id || lesson.lesson_id || lesson.id;
    try { return pid && lid && String(pid) === String(lid); } catch(e) { return false; }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.username) setUsername(user.username);

    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.effectiveRole);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchPromises = [
      fetch('http://localhost:5000/api/lessons/grade/10', { headers }),
      fetch('http://localhost:5000/api/lessons/grade/11', { headers }),
      fetch('http://localhost:5000/api/progress', { headers })
    ];

    // If user is teacher, also fetch students' progress
    if (userRole === 'teacher' || userRole === 'admin') {
      fetchPromises.push(fetch('http://localhost:5000/api/progress/students', { headers }));
    }

    Promise.all(fetchPromises)
      .then(async (responses) => {
        const [g10Res, g11Res, progressRes, studentsRes] = responses;

        if (!g10Res.ok) throw new Error('Failed to fetch grade 10 lessons');
        if (!g11Res.ok) throw new Error('Failed to fetch grade 11 lessons');
        if (!progressRes.ok) throw new Error('Failed to fetch progress');

        const lessons10Data = await g10Res.json();
        const lessons11Data = await g11Res.json();
        const progress = await progressRes.json();

        setLessons10(lessons10Data);
        setLessons11(lessons11Data);
        setProgressData(progress);

        if (studentsRes && studentsRes.ok) {
          const studentsProgressData = await studentsRes.json();
          setStudentsProgress(studentsProgressData);
        }

        const total10 = Array.isArray(lessons10Data) ? lessons10Data.length : 0;
        const total11 = Array.isArray(lessons11Data) ? lessons11Data.length : 0;

        const completed10 = total10 > 0
          ? lessons10Data.filter(lesson => progress.some(p => matchesLesson(p, lesson) && p.completed)).length
          : 0;
        const completed11 = total11 > 0
          ? lessons11Data.filter(lesson => progress.some(p => matchesLesson(p, lesson) && p.completed)).length
          : 0;

        setGrade10Total(total10);
        setGrade10Completed(completed10);
        setGrade11Total(total11);
        setGrade11Completed(completed11);

        // Calculate percentages based on lessons AND quiz scores
        // Each lesson = 80% (lesson completion) + 20% (quiz score)
        let g10Score = 0;
        let g10MaxScore = total10 * 200; // 100 for lesson + 100 for quiz
        
        lessons10Data.forEach(lesson => {
          const progressEntry = progress.find(p => matchesLesson(p, lesson));
          const lessonComplete = progressEntry && progressEntry.completed ? 100 : 0;
          // Use actual quiz accuracy score (0-100), only count if score is >= 100 (meaning they got perfect score)
          // Or we can use the actual score for partial credit
          const quizScore = progressEntry && progressEntry.score !== undefined ? progressEntry.score : 0;
          g10Score += lessonComplete + quizScore;
        });
        
        let g11Score = 0;
        let g11MaxScore = total11 * 200; // 100 for lesson + 100 for quiz
        
        lessons11Data.forEach(lesson => {
          const progressEntry = progress.find(p => matchesLesson(p, lesson));
          const lessonComplete = progressEntry && progressEntry.completed ? 100 : 0;
          // Use actual quiz accuracy score (0-100)
          const quizScore = progressEntry && progressEntry.score !== undefined ? progressEntry.score : 0;
          g11Score += lessonComplete + quizScore;
        });
        
        const g10Percent = g10MaxScore > 0 ? Math.round(g10Score / g10MaxScore * 100) : 0;
        const g11Percent = g11MaxScore > 0 ? Math.round(g11Score / g11MaxScore * 100) : 0;
        
        const total = total10 + total11;
        const totalScore = g10Score + g11Score;
        const totalMaxScore = g10MaxScore + g11MaxScore;
        const totalPercent = totalMaxScore > 0 ? Math.round(totalScore / totalMaxScore * 100) : 0;

        setGrade10Percentage(g10Percent);
        setGrade11Percentage(g11Percent);
        setTotalPercentage(totalPercent);

        // Build quiz attempts map from progress data
        const quizMap = {};
        progress.forEach(p => {
          const lessonId = p.lesson?._id || p.lesson;
          if (lessonId && p.score !== undefined) {
            quizMap[String(lessonId)] = p.score;
          }
        });
        setQuizAttempts(quizMap);
      })
      .catch(err => console.error('Failed to fetch progress/lessons:', err));
  }, [userRole]);

  // Separate lesson arrays for each grade
  const lessonsGrade10 = [
    "Lesson 01", "Lesson 02", "Lesson 03", 
    "Lesson 04", "Lesson 05", "Lesson 06",
    "Lesson 07", "Lesson 08", "Lesson 09"
  ];

  const lessonsGrade11 = [
    "Lesson 01", "Lesson 02", "Lesson 03",
    "Lesson 04", "Lesson 05", "Lesson 06"
  ];

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
      <div className="pt-wrapper">
        {/* Header */}
        <header className="pt-header">
          <img src={logo} className="pt-logo" alt="Logo" />
          <h1 className="pt-title"> &nbsp;&nbsp; Hi {username}!</h1>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <div className="view-toggle">
              <button
                className={viewMode === 'personal' ? 'active' : ''}
                onClick={() => setViewMode('personal')}
              >
                My Progress
              </button>
              <button
                className={viewMode === 'students' ? 'active' : ''}
                onClick={() => setViewMode('students')}
              >
                Students Progress
              </button>
            </div>
          )}
        </header>

        {/* Main Content Container */}
        <div className="pt-main-content">
          {/* Left Section - Grades & Totals */}
          <section className="pt-left-section">
            <div className="pt-grades-container">
              <div className={`pt-grade-card ${selectedGrade === "Grade 10" ? 'active' : ''}`} onClick={() => navigate('/grade10lessons')}>
              <h2>Grade 10</h2>
              <div className="progress-and-total">
                <div className="progress-circle-container">
                  <div className="progress-circle">
                    <div className="circle-bg"></div>
                    <div className="circle-fill" style={{ transform: `rotate(${grade10Percentage * 3.6}deg)` }}></div>
                    <div className="circle-text">{grade10Percentage}%</div>
                  </div>
                </div>
                <div className="pt-total">{grade10Completed}/{grade10Total} Lessons</div>
              </div>
            </div>


<div className={`pt-grade-card ${selectedGrade === "Grade 11" ? 'active' : ''}`} onClick={() => navigate('/grade11lessons')}>
  <h2>Grade 11</h2>
  <div className="progress-and-total">
    <div className="progress-circle-container">
      <div className="progress-circle">
        <div className="circle-bg"></div>
        <div className="circle-fill" style={{ transform: `rotate(${grade11Percentage * 3.6}deg)` }}></div>
        <div className="circle-text">{grade11Percentage}%</div>
      </div>
    </div>
    <div className="pt-total">{grade11Completed}/{grade11Total} Lessons</div>
  </div>
</div>

<div className="pt-grade-card" style={{ border: '2px solid #0e0557' }}>
  <h2>Total Progress</h2>
  <div className="progress-and-total">
    <div className="progress-circle-container">
      <div className="progress-circle">
        <div className="circle-bg"></div>
        <div className="circle-fill" style={{ transform: `rotate(${totalPercentage * 3.6}deg)`, background: '#020232' }}></div>
        <div className="circle-text" style={{ color: '#e2e0f0' }}>{totalPercentage}%</div>
      </div>
    </div>
    <div className="pt-total">{grade10Completed + grade11Completed}/{grade10Total + grade11Total} Lessons</div>
  </div>
</div>

              </div>
          </section>

          {/* Right Section - Lesson List */}

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

          <section className="pt-right-section">
            {viewMode === 'personal' ? (
              <div className="pt-lesson-list">
                <h2 className="pt-lesson-title">Lesson List</h2>
                <div className="pt-lesson-cols">
                  <div className="pt-col">
                    <div
                      className={`pt-grade-header ${selectedGrade === "Grade 10" ? 'active' : ''}`}
                      onClick={() => setSelectedGrade("Grade 10")}>
                      Grade 10
                    </div>
                    <ul>
                      {lessons10.map((lesson, index) => {
                        const lessonId = lesson._id || `lesson-${index}`;
                        const progressEntry = progressData.find(p => matchesLesson(p, lesson));
                        const lessonScore = progressEntry && progressEntry.completed ? 100 : 0;
                        // Use actual quiz accuracy score (0-100)
                        const quizScore = progressEntry && progressEntry.score !== undefined ? progressEntry.score : 0;
                        const quizPercentage = quizScore > 0 ? quizScore : 0; // Show actual quiz accuracy

                        const totalScore = lessonScore + quizPercentage;
                        const lessonWidth = totalScore > 0 ? (lessonScore / totalScore) * 100 : 50;
                        const quizWidth = totalScore > 0 ? (quizPercentage / totalScore) * 100 : 50;
                        const isCompleted = (progressEntry ? progressEntry.completed : false) || lessonScore >= 100;
                        return (
                          <li key={lesson._id || index}>
                            <Link to={`/lesson/10/${index + 1}`}>
                              {lesson.lesson_title || `Lesson ${index + 1}`}
                            </Link>
                            <div className="lesson-progress-info">
                              <span className="progress-percent">Lesson: {Math.round(lessonScore)}% | Quiz: {quizPercentage}%</span>
                              <span className={`completion-status ${isCompleted ? 'completed' : 'in-progress'}`}>
                                {isCompleted ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <div className="lesson-progress-bar">
                              <div className={`lesson-fill ${isCompleted ? 'completed-fill' : ''}`} style={{ width: `${lessonWidth}%` }}></div>
                              <div className={`quiz-fill ${isCompleted ? 'completed-fill' : ''}`} style={{ width: `${quizWidth}%` }}></div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="pt-col">
                    <div
                      className={`pt-grade-header ${selectedGrade === "Grade 11" ? 'active' : ''}`}
                      onClick={() => setSelectedGrade("Grade 11")}>
                      Grade 11
                    </div>
                    <ul>
                      {lessons11.map((lesson, index) => {
                        const lessonId = lesson._id || `lesson-11-${index}`;
                        const progressEntry = progressData.find(p => matchesLesson(p, lesson));
                        const lessonScore = progressEntry && progressEntry.completed ? 100 : 0;
                        // Use actual quiz accuracy score (0-100)
                        const quizScore = progressEntry && progressEntry.score !== undefined ? progressEntry.score : 0;
                        const quizPercentage = quizScore > 0 ? quizScore : 0; // Show actual quiz accuracy
                         
                        const totalScore = lessonScore + quizPercentage;
                        const lessonWidth = totalScore > 0 ? (lessonScore / totalScore) * 100 : 50;
                        const quizWidth = totalScore > 0 ? (quizPercentage / totalScore) * 100 : 50;
                        const isCompleted = (progressEntry ? progressEntry.completed : false) || lessonScore >= 100;
                        return (
                          <li key={lesson._id || index}>
                            <Link to={`/lesson/11/${index + 1}`}>
                              {lesson.lesson_title || `Lesson ${index + 1}`}
                            </Link>
                            <div className="lesson-progress-info">
                              <span className="progress-percent">Lesson: {Math.round(lessonScore)}% | Quiz: {quizPercentage}%</span>
                              <span className={`completion-status ${isCompleted ? 'completed' : 'in-progress'}`}>
                                {isCompleted ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <div className="lesson-progress-bar">
                              <div className={`lesson-fill ${isCompleted ? 'completed-fill' : ''}`} style={{ width: `${lessonWidth}%` }}></div>
                              <div className={`quiz-fill ${isCompleted ? 'completed-fill' : ''}`} style={{ width: `${quizWidth}%` }}></div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-students-list">
                <h2 className="pt-lesson-title">
                  {selectedStudent ? `Progress for ${selectedStudent.username}` : 'Students Progress'}
                </h2>
                {selectedStudent && (
                  <button
                    className="back-button"
                    onClick={() => setSelectedStudent(null)}
                  >
                    ← Back to All Students
                  </button>
                )}
                <div className="students-progress-container">
                  {studentsProgress.length === 0 ? (
                    <p>No student progress data available</p>
                  ) : selectedStudent ? (
                    // Show detailed progress for selected student
                    studentsProgress
                      .filter(progress => progress.user?.username === selectedStudent.username)
                      .map((progress, index) => (
                        <div key={index} className="student-detailed-card">
                          <div className="lesson-detail">
                            <h4>{progress.lesson?.lesson_title || 'Unknown Lesson'}</h4>
                            <div className="lesson-info">
                              <p><strong>Grade:</strong> {progress.lesson?.grade || 'N/A'}</p>
                              <p><strong>Status:</strong> {progress.completed ? 'Completed' : 'In Progress'}</p>
                              {progress.score !== undefined && (
                                <p><strong>Score:</strong> {progress.score}%</p>
                              )}
                              {progress.completed_at && (
                                <p><strong>Completed At:</strong> {new Date(progress.completed_at).toLocaleDateString()}</p>
                              )}
                              {progress.last_accessed && (
                                <p><strong>Last Accessed:</strong> {new Date(progress.last_accessed).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    // Show all students overview
                    [...new Set(studentsProgress.map(p => p.user?.username).filter(Boolean))]
                      .map(username => {
                        const studentProgress = studentsProgress.filter(p => p.user?.username === username);
                        const completedLessons = studentProgress.filter(p => p.completed).length;
                        const totalLessons = studentProgress.length;
                        const averageScore = studentProgress
                          .filter(p => p.score !== undefined)
                          .reduce((sum, p) => sum + p.score, 0) / studentProgress.filter(p => p.score !== undefined).length || 0;

                        return (
                          <div
                            key={username}
                            className="student-progress-card clickable"
                            onClick={() => setSelectedStudent({ username })}
                          >
                            <div className="student-info">
                              <h3>{username}</h3>
                              <p>{studentProgress[0]?.user?.email || ''}</p>
                            </div>
                            <div className="lesson-progress">
                              <p><strong>Completed:</strong> {completedLessons}/{totalLessons} lessons</p>
                              <p><strong>Progress:</strong> {totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%</p>
                              {averageScore > 0 && (
                                <p><strong>Average Score:</strong> {Math.round(averageScore)}%</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
