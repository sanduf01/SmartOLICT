import React, { useState, useEffect } from "react";
import "./quizz.css";

const Quiz = () => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [selected, setSelected] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  const question = {
    text: "Which of the following is an example of system software?",
    options: [
      { id: "A", text: "Photoshop" },
      { id: "B", text: "Windows 11" },
      { id: "C", text: "MS Excel" },
      { id: "D", text: "VLC Media Player" },
    ],
    answer: "B",
  };

  useEffect(() => {
    if (timeLeft === 0) {
      setIsTimeUp(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSelect = (id) => {
    if (!isTimeUp) setSelected(id);
  };

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
    <div className="quiz-container">
      <div className="timer">
        {timeLeft < 10 ? `00:0${timeLeft}` : `00:${timeLeft}`}
      </div>

      <div className="quiz-box">
        <h2 className="question-text">{question.text}</h2>

        <div className="options-grid">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              disabled={isTimeUp}
              className={`option-btn ${
                selected === opt.id
                  ? opt.id === question.answer
                    ? "correct"
                    : "wrong"
                  : ""
              }`}
            >
              {opt.id}: {opt.text}
            </button>
          ))}
        </div>

        {isTimeUp && (
          <div className="result-text">
            ⏰ Time’s up! Correct answer:{" "}
            <strong>{question.answer} - Windows 11</strong>
          </div>
        )}

        {!isTimeUp && selected && (
          <div className="result-text">
            {selected === question.answer ? (
              <span className="correct"> Correct!</span>
            ) : (
              <span className="wrong"> Wrong Answer</span>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Quiz;
