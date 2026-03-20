import React from "react";
import { useNavigate } from "react-router-dom";
import "./security.css";

export default function Security() {
  const navigate = useNavigate(); // hook to navigate

  return (
    <div className="security-bg">
      <div className="security-card">
        <div className="security-header">
          <img
            className="settings-logo"
            src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand"
            alt="logo"
          />
          <h2>Security</h2>
          <span className="security-sub">Smart O/L ICT</span>

          {/* Back button */}
          <button 
            className="back-btn" 
            onClick={() => navigate("/setting")}
          >
            ← Back
          </button>
        </div>

        <div className="security-content">
          <section>
            <h4>1. Account Protection</h4>
            <p>
              User accounts are protected using secure authentication methods.
              Strong passwords are required to prevent unauthorized access.
            </p>
          </section>

          <section>
            <h4>2. Password Security</h4>
            <p>
              Passwords are encrypted and never stored in plain text. Users are
              encouraged to update passwords regularly.
            </p>
          </section>

          <section>
            <h4>3. Data Encryption</h4>
            <p>
              Sensitive data is encrypted during transmission to ensure privacy
              and protection against data breaches.
            </p>
          </section>

          <section>
            <h4>4. Secure Access</h4>
            <p>
              Access to the system is restricted based on user roles such as
              student, teacher, or administrator.
            </p>
          </section>

          <section>
            <h4>5. Threat Monitoring</h4>
            <p>
              The system is monitored continuously to detect suspicious
              activities and prevent security threats.
            </p>
          </section>

          <section>
            <h4>6. User Responsibility</h4>
            <p>
              Users should log out after use and avoid sharing their login
              credentials with others.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
