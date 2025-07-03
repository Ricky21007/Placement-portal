import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const GraduationCapIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path d="M14 4L25 9L14 14L3 9L14 4Z" fill="#FF6F61" />
    <path
      d="M5 11V17C5 19.2091 9.02944 21 14 21C18.9706 21 23 19.2091 23 17V11"
      stroke="#FF6F61"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="4" y="9" width="20" height="12" rx="3" fill="#FF6F61" />
    <rect x="8" y="5" width="12" height="4" rx="2" fill="#FF6F61" />
    <rect x="12" y="13" width="4" height="4" rx="1" fill="#fff" opacity="0.7" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect x="5" y="16" width="4" height="7" rx="1" fill="#FF6F61" />
    <rect x="12" y="11" width="4" height="12" rx="1" fill="#FF6F61" />
    <rect x="19" y="7" width="4" height="16" rx="1" fill="#FF6F61" />
  </svg>
);

const Welcome = () => {
  const [loginType, setLoginType] = useState("");
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (loginType) {
      navigate(`/login/${loginType.toLowerCase()}`);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <img
          src="/Images/CAPACITI-LOGO.jpg"
          alt="CAPACITI Logo"
          className="welcome-logo"
        />
        <h1 className="welcome-title">CAPACITI Graduate Placement Portal</h1>
        <p className="welcome-subtitle">
          Empowering graduates. Connecting employers. Driving impact.
        </p>

        <div className="welcome-cards">
          <div className="welcome-card">
            <h2 className="welcome-card-title">
              For Graduates{" "}
              <span className="welcome-icon" aria-label="graduation cap">
                <GraduationCapIcon />
              </span>
            </h2>
            <p className="welcome-card-text">
              Discover job opportunities, track your applications, and build
              your career. Create a profile with your CV, skills, and
              certifications.
            </p>
          </div>

          <div className="welcome-card">
            <h2 className="welcome-card-title employers">
              For Employers{" "}
              <span className="welcome-icon" aria-label="briefcase">
                <BriefcaseIcon />
              </span>
            </h2>
            <p className="welcome-card-text">
              Post jobs and access a curated pool of skilled, CAPACITI-trained
              graduates. Save time with smart candidate matching and easy
              interview scheduling.
            </p>
          </div>

          <div className="welcome-card">
            <h2 className="welcome-card-title admins">
              For CAPACITI Admins{" "}
              <span className="welcome-icon" aria-label="chart">
                <BarChartIcon />
              </span>
            </h2>
            <p className="welcome-card-text">
              Gain insights into graduate placements, employer activity, and
              engagement metrics. Showcase success to funders and partners.
            </p>
          </div>
        </div>

        <div className="welcome-actions">
          <select
            value={loginType}
            onChange={(e) => setLoginType(e.target.value)}
            className="welcome-select"
          >
            <option value="">Select Your Role</option>
            <option value="Graduate">Graduate</option>
            <option value="Employer">Employer</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            onClick={handleGetStarted}
            disabled={!loginType}
            className="welcome-button"
          >
            Get Started
          </button>
        </div>

        <p className="welcome-footer">© 2025 CAPACITI Programme</p>
      </div>
    </div>
  );
};

export default Welcome;
