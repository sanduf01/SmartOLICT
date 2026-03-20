import React from "react";
import { useNavigate } from "react-router-dom";
import "./privacy.css";

export default function Privacy() {
  const navigate = useNavigate(); // hook to navigate

  return (
    <div className="privacy-bg">
      <div className="privacy-card">
        <div className="privacy-header">
          <img
            className="settings-logo"
            src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand"
            alt="logo"
          />
          <h2>Privacy Policy</h2>
          <h3>Smart O/L ICT</h3>

          {/* Back button */}
          <button 
            className="back-btn" 
            onClick={() => navigate("/setting")}
          >
            ← Back
          </button>
        </div>

        <div className="privacy-content">
          <section>
            <h4>1. Information We Collect</h4>
            <p>
              We collect personal information such as your name, email address,
              grade, and learning progress to improve your learning experience.
            </p>
          </section>

          <section>
            <h4>2. How We Use Your Information</h4>
            <p>
              Your data is used to personalize lessons, track progress,
              maintain leaderboards, and provide feedback.
            </p>
          </section>

          <section>
            <h4>3. Data Protection</h4>
            <p>
              We use secure technologies and best practices to protect your
              personal information from unauthorized access.
            </p>
          </section>

          <section>
            <h4>4. Sharing Information</h4>
            <p>
              We do not sell or share your personal data with third parties
              except when required by law.
            </p>
          </section>

          <section>
            <h4>5. User Responsibility</h4>
            <p>
              Users are responsible for maintaining the confidentiality of
              their login credentials.
            </p>
          </section>

          <section>
            <h4>6. Updates to This Policy</h4>
            <p>
              This privacy policy may be updated from time to time. Continued
              use of the platform indicates acceptance of the changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
