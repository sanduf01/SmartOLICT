import React, { useEffect, useRef, useState } from "react";
import "./quiz2.css";
import { useNavigate, useParams } from "react-router-dom";
import api from '../utils/api';


/*
  quiz2.jsx (Sequential questions mode)
  - Self-contained component. All classes are namespaced with "q2-"
  - No global CSS changes. Safe to drop into any project.
*/

export default function Quiz2() {
  const navigate = useNavigate();
  const { grade, lessonNumber } = useParams();

  // ==== STATE ====
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [totalTimer, setTotalTimer] = useState(600); // 10 minutes in seconds
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [confettiBurst, setConfettiBurst] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const timerRef = useRef(null);
  const confRef = useRef(null);

  // Fetch questions based on grade and lesson number
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // First, fetch lessons for this grade
        const lessonsResponse = await api.get(`/api/lessons/grade/${grade}`);
        const lessons = lessonsResponse.data;

        // Find the lesson by lesson number (assuming lessons are ordered)
        const lessonIndex = parseInt(lessonNumber) - 1;
        if (lessons[lessonIndex]) {
          const lesson = lessons[lessonIndex];

          // Fetch quiz for this lesson
          const quizResponse = await api.get(`/api/quizzes/lesson/${lesson._id}`);
          const quiz = quizResponse.data;

          if (quiz && quiz.questions && quiz.questions.length > 0) {
            // Fetch the actual questions
            const questionPromises = quiz.questions.map(qId =>
              api.get(`/api/questions/${qId}`).then(res => res.data)
            );
            const fetchedQuestions = await Promise.all(questionPromises);

            // Transform questions to match the expected format
            const transformedQuestions = fetchedQuestions.map(q => ({
              text: q.question_text,
              options: q.options,
              answer: q.correct_answer,
              time: 10 // Default time, can be customized
            }));

            setQuestions(transformedQuestions);
            setStartTime(Date.now()); // Set start time when questions are loaded
          } else {
            setError('No quiz available for this lesson');
          }
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (grade && lessonNumber) {
      fetchQuestions();
    }
  }, [grade, lessonNumber]);

  // helper: pick a random index, avoid immediate repeat if possible
  function randomIndex(exclude = null) {
    if (questions.length === 1) return 0;
    let idx;
    do {
      idx = Math.floor(Math.random() * questions.length);
    } while (idx === exclude);
    return idx;
  }

  // audio tone helper (basic WebAudio, wrapped with try/catch)
  const playTone = (freq = 440, duration = 0.12, type = "sine") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, (duration + 0.02) * 1000);
    } catch (e) {
      // audio may be blocked by browser policies — ignore silently
    }
  };

// Submit quiz results to backend
  const submitQuizResults = async (finalScore, answered, duration) => {
    try {
      // First, fetch lessons for this grade to get the quiz ID
      const lessonsResponse = await api.get(`/api/lessons/grade/${grade}`);
      const lessons = lessonsResponse.data;

      // Find the lesson by lesson number (assuming lessons are ordered)
      const lessonIndex = parseInt(lessonNumber) - 1;
      if (lessons[lessonIndex]) {
        const lesson = lessons[lessonIndex];

        // Fetch quiz for this lesson
        const quizResponse = await api.get(`/api/quizzes/lesson/${lesson._id}`);
        const quiz = quizResponse.data;

        if (quiz && quiz._id) {
          // Submit the quiz attempt with score and total possible score
          // Backend will calculate: (score / total_possible_score) * 100
          await api.post(`/api/quizzes/${quiz._id}/attempt`, {
            answers: [], // We don't track individual answers in this implementation
            score: finalScore,
            total_possible_score: questions.length // Total number of questions
          });
          console.log('Quiz results submitted successfully');
        }
      }
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      // Don't block navigation if submission fails
    }
  };

  // ===== TIMER EFFECT =====
  useEffect(() => {
    if (isStopped) return; // paused state

    timerRef.current = setTimeout(() => {
      if (totalTimer <= 1) {
        setTotalTimer(0);
        const endTime = Date.now();
        const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0; // Duration in seconds
        submitQuizResults(score, answeredCount, duration);
        navigate("/completed", { state: { totalScore: score, answered: answeredCount, duration, grade, lessonNumber } });
      } else {
        setTotalTimer((t) => t - 1);
      }
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [totalTimer, isStopped, score, answeredCount, navigate, grade, lessonNumber]);

  // reset when question changes
  useEffect(() => {
    if (questions.length > 0 && questions[current]) {
      setSelected(null);
      setShowResult(false);
      setConfettiBurst(false);
    }
  }, [current, questions]);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(confRef.current);
    };
  }, []);

  // ===== HANDLERS =====
  const handleSelect = (opt) => {
    if (showResult || isStopped) return;
    setSelected(opt);
    setShowResult(true);
    setAnsweredCount((c) => c + 1);

    const correct = opt === questions[current].answer;
    if (correct) {
      setScore((s) => s + 1);
      if (soundOn) playTone(880, 0.14, "sine");
      setConfettiBurst(true);
      confRef.current = setTimeout(() => setConfettiBurst(false), 1400);
    } else {
      if (soundOn) playTone(220, 0.14, "sawtooth");
    }
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      // Last question done, auto-finish quiz
      const endTime = Date.now();
      const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0; // Duration in seconds
      submitQuizResults(score, answeredCount, duration);
      navigate("/completed", { state: { totalScore: score, answered: answeredCount, duration, grade, lessonNumber } });
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    if (showResult || isStopped) {
      handleNext();
      return;
    }
    setSelected(null);
    setShowResult(true);
    setAnsweredCount((c) => c + 1);
    if (soundOn) playTone(220, 0.12, "sawtooth");
  };

  const handleStop = () => setIsStopped(true);
  const handleResume = () => {
    setIsStopped(false);
    setShowResult(false);
  };
  const handleRetry = () => {
    setScore(0);
    setAnsweredCount(0);
    setIsStopped(false);
    setTotalTimer(600); // Reset to 10 minutes
    const first = randomIndex();
    setCurrent(first);
    setSelected(null);
    setShowResult(false);
  };

  const formatTime = (t) => {
    const minutes = Math.floor(t / 60);
    const seconds = t % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  const q = questions[current];
  const accuracy = answeredCount === 0 ? 0 : Math.round((score / answeredCount) * 100);

  if (loading) {
    return <div className="q2-root">Loading quiz...</div>;
  }

  if (error || questions.length === 0) {
    return <div className="q2-root">Error: {error || 'No questions available'}</div>;
  }

  return (
    <div className="q2-root">
      {/* Top small controls */}
      <div className="q2-top">
        <div className={`q2-timer ${totalTimer <= 3 && !showResult && !isStopped ? "q2-urgent" : ""}`}>
          {formatTime(totalTimer)}
        </div>

        <div className="q2-top-controls">
          <label className="q2-sound-toggle">
            <input
              type="checkbox"
              checked={soundOn}
              onChange={() => setSoundOn((s) => !s)}
            />{" "}
            Sound
          </label>

          <div className="q2-stats">
            <div>Score: <strong>{score}</strong></div>
            <div>Answered: <strong>{answeredCount}</strong></div>
          </div>

          <button className="q2-btn q2-ghost" onClick={handleStop}>Stop Quiz</button>
        </div>
      </div>

  {/* Main quiz card */}
  <div className="q2-card">
    <h2 className="q2-question">{q.text}</h2>

        <div className="q2-options">
          {q.options.map((opt, i) => {
            const isCorrect = showResult && opt === q.answer;
            const isWrong = showResult && selected === opt && opt !== q.answer;
            return (
              <button
                key={i}
                disabled={showResult || isStopped}
                className={`q2-option ${isCorrect ? "q2-correct" : ""} ${isWrong ? "q2-wrong" : ""}`}
                onClick={() => handleSelect(opt)}
              >
                <span className="q2-opt-letter">{String.fromCharCode(65 + i)}</span>
                <span className="q2-opt-text">{opt}</span>
              </button>
            );
          })}
        </div>

        {showResult ? (
          <div className="q2-result-row">
            {selected === q.answer ? (
              <div className="q2-result q2-correct-result">🎉 Correct! +1</div>
            ) : (
              <div className="q2-result q2-wrong-result">
                ❌ Incorrect. (Correct: <strong>{q.answer})</strong>
              </div>
            )}

            <div className="q2-controls">
              <button className="q2-btn" onClick={handleNext}>Next</button>
            </div>
          </div>
        ) : (
          <div className="q2-controls-row">
            <button className="q2-btn q2-ghost" onClick={handleSkip}>Skip</button>
            <div className="q2-hint">Pick an option — timer running</div>
          </div>
        )}

        {/* confetti */}
        {confettiBurst && <Confetti count={26} />}
      </div>

      {/* STOP modal */}
      {isStopped && (
        <div className="q2-stop-modal">
          <div className="q2-modal-card">
            <h3>Quiz paused</h3>
            <p>Your stats</p>
            <div className="q2-modal-stats">
              <div>Score: <strong>{score}</strong></div>
              <div>Answered: <strong>{answeredCount}</strong></div>
              <div>Accuracy: <strong>{accuracy}%</strong></div>
            </div>

            <div className="q2-modal-actions">
              <button className="q2-btn q2-primary" onClick={handleResume}>Resume</button>
              <button className="q2-btn" onClick={handleRetry}>Retry Session</button>
              <button
  className="q2-btn q2-primary"
  onClick={() => {
    const endTime = Date.now();
    const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0; // Duration in seconds
    submitQuizResults(score, answeredCount, duration);
    navigate("/completed", { state: { totalScore: score, answered: answeredCount, duration, grade, lessonNumber } });
  }}
>
  Finish Quiz
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Confetti subcomponent - pure DOM + CSS. Namespaced "q2-" */
function Confetti({ count = 20 }) {
  const pieces = Array.from({ length: count }).map((_, i) => {
    const left = Math.random() * 100;
    const size = 6 + Math.random() * 12;
    const delay = Math.random() * 0.25;
    const rotate = Math.random() * 360;
    const colors = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#8338ec", "#ff9f1c"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return (
      <span
        key={i}
        className="q2-confetti-piece"
        style={{
          left: `${left}%`,
          width: `${size}px`,
          height: `${size * 0.6}px`,
          background: color,
          transform: `rotate(${rotate}deg)`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });

  return <div className="q2-confetti-wrap">{pieces}</div>;
}

