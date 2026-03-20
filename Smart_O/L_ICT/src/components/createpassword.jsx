import React, { useState } from "react";
import "./createpassword.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function CreatePassword() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend password match check
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Password reset failed");
      } else {
        setSuccess("Password updated successfully");
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setError("Server error. Please try again.");
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

      <div className="createpassword-container">
        <div className="login-left">
          <img src={logo} alt="Smart O/ICT Logo" className="logo" />

          <h2 className="title">
            Create New <br /> Password
          </h2>
        </div>

        <div className="right-panel">
          <form className="cp-form" onSubmit={handleSubmit}>
            <input
              type="text"
              id="username"
              placeholder="Username or Email"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              id="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button type="submit" className="main-login-btn">
              Update Password
            </button>

            <Link to="/login" className="login-link">Log in</Link>
          </form>
        </div>
      </div>
    </>
  );
}

export default CreatePassword;
