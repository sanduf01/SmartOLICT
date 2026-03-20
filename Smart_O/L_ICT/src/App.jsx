import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import "./App.css";
import Quiz from "./components/quizz";
import Grade10Lessons from "./components/grade10_lessons";
import Grade11Lessons from "./components/grade11_lessons";
import Register from "./components/register";
import Createpassword from "./components/createpassword";
import Leaderboard from "./components/leaderboard";
import Setting from "./components/setting";
import Loading from "./components/loading";
import Dashboard from "./components/dashboard";
import Feedback from "./components/feedback";
import HomePage from "./components/home_page";
import Completed from "./components/completed";
import Profile from "./components/profile";
import ProgressTracking from "./components/progress";

import Intro from "./components/intro";
import Quiz2 from "./components/quiz2";
import Notification from "./components/notification";
import Privacy from "./components/privacy";
import Security from "./components/security";
import PrivateRoute from "./components/PrivateRoute";
import ManageUsers from "./components/manage-users";
import ManageContent from "./components/manage-content";
import ManageNotifications from "./components/manage-notifications";
import DynamicLesson from "./components/dynamic-lesson";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Loading />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/createpassword" element={<Createpassword />} />
        <Route path="/quiz/:quizId" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/grade10lessons"element={<PrivateRoute><Grade10Lessons /></PrivateRoute>} />
        <Route path="/grade11lessons"element={<PrivateRoute><Grade11Lessons /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="/setting" element={<PrivateRoute><Setting /></PrivateRoute>} />   
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
        <Route path="/homepage" element={<PrivateRoute><HomePage/></PrivateRoute>} />
        <Route path="/completed" element={<PrivateRoute><Completed /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><ProgressTracking /></PrivateRoute>} />
        <Route path="/quiz2" element={<PrivateRoute><div style={{padding: '20px', textAlign: 'center'}}><h2>Quiz Access</h2><p>Please specify a grade and lesson number in the URL.</p><p>Example: /quiz2/10/1 (Grade 10, Lesson 1)</p></div></PrivateRoute>} />
        <Route path="/quiz2/:grade/:lessonNumber" element={<PrivateRoute><Quiz2 /></PrivateRoute>} />
        <Route path="/notification" element={<PrivateRoute><Notification /></PrivateRoute>} />
        <Route path="/privacy" element={<PrivateRoute><Privacy /></PrivateRoute>} />
        <Route path="/security" element={<PrivateRoute><Security /></PrivateRoute>} />
        <Route path="/manage-users" element={<PrivateRoute><ManageUsers /></PrivateRoute>} />
        <Route path="/manage-content" element={<PrivateRoute><ManageContent /></PrivateRoute>} />
        <Route path="/manage-notifications" element={<PrivateRoute><ManageNotifications /></PrivateRoute>} />
        <Route path="/lesson/:grade/:lessonNumber" element={<PrivateRoute><DynamicLesson /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
