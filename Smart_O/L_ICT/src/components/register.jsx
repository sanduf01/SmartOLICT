import React, { useState } from "react";
import "./register.css";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

// Special Password Modal Component
const SpecialPasswordModal = ({ isOpen, onClose, onConfirm, role, isGoogle }) => {
  const [specialPassword, setSpecialPassword] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const requiredPassword = role === "teacher" ? "TeachGamified1011" : "AdminGamified1011";
    if (specialPassword === requiredPassword) {
      onConfirm(specialPassword);
      setSpecialPassword("");
      setError("");
      onClose();
    } else {
      setError(`Invalid ${role} registration password`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{role.charAt(0).toUpperCase() + role.slice(1)} Registration</h3>
        <p>Please enter the special {role} registration password:</p>
        <input
          type="password"
          placeholder={`Enter ${role} password`}
          value={specialPassword}
          onChange={(e) => setSpecialPassword(e.target.value)}
          className="modal-input"
        />
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-buttons">
          <button onClick={onClose} className="modal-cancel">Cancel</button>
          <button onClick={handleConfirm} className="modal-confirm">Confirm</button>
        </div>
      </div>
    </div>
  );
};

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const [showEmailRegister, setShowEmailRegister] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalRole, setModalRole] = useState("");
  const [isGoogleModal, setIsGoogleModal] = useState(false);

  // Handle backend redirects
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msg = params.get("message");

    if (msg === "prefer_google") {
      setMessage("Please register first. Prefer Google registration.");
      setMessageType("info");
      navigate("/register");
    }

    if (msg === "not_registered" || msg === "prefer_google") {
      setMessage("This Gmail is not registered. Please register first (prefer Google).");
      setMessageType("info");
      navigate("/register");
    }

  }, [location, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if special password is required
    if (formData.role === "teacher" || formData.role === "admin") {
      setModalRole(formData.role);
      setIsGoogleModal(false);
      setShowModal(true);
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", formData);
      setSuccess("Registration successful");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  const handleGoogleRegister = () => {
    if (formData.role === "teacher" || formData.role === "admin") {
      setModalRole(formData.role);
      setIsGoogleModal(true);
      setShowModal(true);
    } else {
      window.location.href = `http://localhost:5000/auth/google/register?role=${formData.role}`;
    }
  };

  const handleModalConfirm = async (specialPassword) => {
    const dataToSend = { ...formData, specialPassword };

    try {
      if (isGoogleModal) {
        // For Google registration, redirect after password verification
        window.location.href = `http://localhost:5000/auth/google/register?role=${formData.role}`;
      } else {
        // For username registration, submit the form
        await axios.post("http://localhost:5000/register", dataToSend);
        setSuccess("Registration successful");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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

      <div className="register-container">
        <div className="register-left">

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}


          <img src={logo} alt="Smart O/ICT Logo" className="login-logo" />

          <h1 className="title">Register</h1>

          <select className="select-box" id="role-select" name="role" required onChange={handleChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          <button
            className="cosmic-button"
            onClick={handleGoogleRegister}
          >
            <span className="btn-text">Register with Google</span>
            <span className="btn-stars"></span>
            <span className="btn-glow"></span>
          </button>
          <p className="or">or</p>
          <button 
            className="cosmic-button"
            onClick={() => setShowEmailRegister(true)}
          >
            <span className="btn-text">Register with Username</span>
            <span className="btn-stars"></span>
            <span className="btn-glow"></span>
          </button>
        </div>

        {showEmailRegister && (

          <div className="right-panel">

            <form className="register-form" onSubmit={handleSubmit}>

              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <input
                type="text"
                id="username"
                placeholder="Username"
                name="username"
                required
                onChange={handleChange}
              />

              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                name="firstName"
                required
                onChange={handleChange}
              />

              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                name="lastName"
                required
                onChange={handleChange}
              />

              <input
                type="email"
                id="email"
                placeholder="E-Mail"
                name="email"
                required
                onChange={handleChange}
              />

              <input
                type="password"
                id="password"
                placeholder="Password"
                name="password"
                required
                onChange={handleChange}
              />

              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                name="confirmPassword"
                required
                onChange={handleChange}
              />

              <button type="submit" className="register-btn">
                Register
              </button>

              <Link to="/login" className="login-link">
                Log in
              </Link>

            </form>
          </div>
        )}

        {/* Special Password Modal */}
        <SpecialPasswordModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleModalConfirm}
          role={modalRole}
          isGoogle={isGoogleModal}
        />
      </div>
    </>
  );
}

export default Register;
