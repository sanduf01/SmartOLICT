import React, { useState } from "react";
import "./login.css";
import axios from "axios";
import logo from "../assets/logo.png";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error

  // Handle messages from backend redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("message");
    const token = params.get("token");

    if (token) {
      // Handle Google OAuth token
      sessionStorage.setItem("token", token);
      // Decode token to get user info
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        localStorage.setItem("user", JSON.stringify({
          user_id: decoded.user_id,
          username: decoded.username,
          email: decoded.email,
          provider: decoded.provider
        }));
        localStorage.setItem("role", decoded.effectiveRole);
        // Reset progress for new user
        localStorage.removeItem('manualProgressGrade10');
        localStorage.removeItem('manualLessonProgress');
        navigate("/homepage");
        return;
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    if (msg === "email_exists") {
      setMessage("This Gmail is already registered. Please login instead.");
      setMessageType("error");
      navigate("/login"); // optional if you still want redirect
    }
    if (msg === "registered_google") {
      setMessage("Google registration successful! Please login using Google.");
      setMessageType("success");
      navigate("/login");
    }

    if (msg === "role_violation") {
      setMessage("You are not authorized to login with this Gmail for the selected role.");
      setMessageType("error");
    }
    if (msg === "link_google") {
      setMessage("Google account automatically linked to your existing account!");
      setMessageType("success");
    }
    if (msg === "google_linked") {
      setMessage("Google account successfully linked to your existing account!");
      setMessageType("success");
    }
  }, [location, navigate]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");

  // Determine if special password is required
  const requiresSpecialPassword = selectedRole === "teacher" || selectedRole === "admin";

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showUsernameLogin, setShowUsernameLogin] = useState(false);

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/login", {
        username,
        password,
        selectedRole,
      });

      // CHECK: user exists & login success
      if (res.data?.user) {
        setSuccess(`Logged in as ${res.data.effectiveRole}`);

        // Optional: store login info
        localStorage.setItem("user", JSON.stringify({
          ...res.data.user,
          provider: 'local'
        }));
        localStorage.setItem("role", res.data.effectiveRole);
        sessionStorage.setItem("token", res.data.token);
        // Reset progress for new user
        localStorage.removeItem('manualProgressGrade10');
        localStorage.removeItem('manualLessonProgress');

        setTimeout(() => {
          navigate("/homepage");
        }, 1200);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid username, password, or role"
      );
    }
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
          body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: 'Orbitron', sans-serif;
            color: #eee;
            overflow: hidden;
          }
        `}
      </style>

      <div className="login-container">
        <div className="login-left">

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <img src={logo} alt="Smart O/ICT Logo" className="login-logo" />
          <h1 className="login-title">Login</h1>

          <select className="select-box" id="role-select" name="role" onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <br/>

          <button
            className="cosmic-button"
            onClick={() =>
              window.location.href =
              `http://localhost:5000/auth/google/login?role=${selectedRole}`
            }
          >
            <span className="btn-text">Log in with Google</span>
            <span className="btn-stars"></span>
            <span className="btn-glow"></span>
          </button>
          <p className="or">or</p>
          <button 
            className="cosmic-button"
            onClick={() => setShowUsernameLogin(true)}
          >
            <span className="btn-text">Log in with Username</span>
            <span className="btn-stars"></span>
            <span className="btn-glow"></span>
          </button>
        </div>

        {showUsernameLogin && (
          <div className="login-right">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <input
              className="input-box"
              type="text"
              id="username"
              name="username"
              placeholder="Username or Email"
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="input-box"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="main-login-btn" onClick={handleLogin}>
              Login
            </button>

            <div className="links">
              <Link to="/register" className="link">
                Register
              </Link>
              <a href="/createpassword" className="link">
                Forgot Password?
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;