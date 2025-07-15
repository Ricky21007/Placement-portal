import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Welcome.css";

const GraduationCapIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 28 28"
    fill="none"
    className="welcome-card-icon"
  >
    <path d="M14 4L25 9L14 14L3 9L14 4Z" fill="currentColor" />
    <path
      d="M5 11V17C5 19.2091 9.02944 21 14 21C18.9706 21 23 19.2091 23 17V11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <circle cx="14" cy="8" r="1" fill="currentColor" opacity="0.8" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 28 28"
    fill="none"
    className="welcome-card-icon"
  >
    <rect x="4" y="9" width="20" height="12" rx="3" fill="currentColor" />
    <rect x="8" y="5" width="12" height="4" rx="2" fill="currentColor" />
    <rect x="12" y="13" width="4" height="4" rx="1" fill="#fff" opacity="0.8" />
    <circle cx="10" cy="15" r="1" fill="#fff" opacity="0.6" />
    <circle cx="18" cy="15" r="1" fill="#fff" opacity="0.6" />
  </svg>
);

const BarChartIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 28 28"
    fill="none"
    className="welcome-card-icon"
  >
    <rect x="5" y="16" width="4" height="7" rx="1" fill="currentColor" />
    <rect x="12" y="11" width="4" height="12" rx="1" fill="currentColor" />
    <rect x="19" y="7" width="4" height="16" rx="1" fill="currentColor" />
    <circle cx="7" cy="14" r="1" fill="currentColor" opacity="0.7" />
    <circle cx="14" cy="9" r="1" fill="currentColor" opacity="0.7" />
    <circle cx="21" cy="5" r="1" fill="currentColor" opacity="0.7" />
  </svg>
);

const FloatingParticle = ({ delay = 0 }) => (
  <div
    className="floating-particle"
    style={{
      animationDelay: `${delay}s`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${3 + Math.random() * 4}s`,
    }}
  />
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
  </svg>
);

const Welcome = () => {
  const [loginType, setLoginType] = useState("");
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const particleArray = Array.from({ length: 15 }, (_, i) => i);
    setParticles(particleArray);
  }, []);

  const handleGetStarted = () => {
    if (loginType) {
      navigate(`/login/${loginType.toLowerCase()}`);
    }
  };

  return (
    <div className="welcome-container">
      {particles.map((particle, index) => (
        <FloatingParticle key={index} delay={index * 0.5} />
      ))}

      <div className="welcome-glow-orb welcome-glow-orb-1" />
      <div className="welcome-glow-orb welcome-glow-orb-2" />
      <div className="welcome-glow-orb welcome-glow-orb-3" />

      <div className="welcome-box">
        <div className="welcome-logo-container">
          <img
            src="/Images/CAPACITI-LOGO.jpg"
            alt="CAPACITI Logo"
            className="welcome-logo"
          />
          <div className="welcome-logo-glow" />
        </div>

        <div className="welcome-header">
          <h1 className="welcome-title">
            <span className="welcome-title-main">CAPACITI</span>
            <span className="welcome-title-sub">Graduate Placement Portal</span>
          </h1>
          <p className="welcome-subtitle">
            <StarIcon />
            Empowering graduates. Connecting employers. Driving impact.
            <StarIcon />
          </p>
        </div>

        <div className="welcome-cards">
          <div className="welcome-card welcome-card-graduates">
            <div className="welcome-card-background" />
            <div className="welcome-card-content">
              <div className="welcome-card-header">
                <h2 className="welcome-card-title">For Graduates</h2>
                <div className="welcome-icon">
                  <GraduationCapIcon />
                </div>
              </div>
              <p className="welcome-card-text">
                Discover job opportunities, track your applications, and build
                your career. Create a profile with your CV, skills, and
                certifications.
              </p>
              <div className="welcome-card-stats">
                <span className="welcome-stat">1000+ Jobs</span>
                <span className="welcome-stat">95% Success Rate</span>
              </div>
            </div>
          </div>

          <div className="welcome-card welcome-card-employers">
            <div className="welcome-card-background" />
            <div className="welcome-card-content">
              <div className="welcome-card-header">
                <h2 className="welcome-card-title">For Employers</h2>
                <div className="welcome-icon">
                  <BriefcaseIcon />
                </div>
              </div>
              <p className="welcome-card-text">
                Post jobs and access a curated pool of skilled, CAPACITI-trained
                graduates. Save time with smart candidate matching and easy
                interview scheduling.
              </p>
              <div className="welcome-card-stats">
                <span className="welcome-stat">500+ Companies</span>
                <span className="welcome-stat">24h Response</span>
              </div>
            </div>
          </div>

          <div className="welcome-card welcome-card-admins">
            <div className="welcome-card-background" />
            <div className="welcome-card-content">
              <div className="welcome-card-header">
                <h2 className="welcome-card-title">For CAPACITI Admins</h2>
                <div className="welcome-icon">
                  <BarChartIcon />
                </div>
              </div>
              <p className="welcome-card-text">
                Gain insights into graduate placements, employer activity, and
                engagement metrics. Showcase success to funders and partners.
              </p>
              <div className="welcome-card-stats">
                <span className="welcome-stat">Real-time Analytics</span>
                <span className="welcome-stat">Smart Insights</span>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <div className="welcome-select-container">
            <select
              value={loginType}
              onChange={(e) => setLoginType(e.target.value)}
              className="welcome-select"
            >
              <option value="">Select Your Role</option>
              <option value="Graduate">🎓 Graduate</option>
              <option value="Employer">💼 Employer</option>
              <option value="Admin">📊 Admin</option>
            </select>

            <button
              onClick={handleGetStarted}
              disabled={!loginType}
              className="welcome-button"
            >
              <span>Get Started</span>
              <div className="welcome-button-glow" />
            </button>
          </div>
        </div>

        <footer className="welcome-footer">
          <div className="welcome-footer-content">
            <div className="welcome-footer-main">
              <div className="welcome-footer-brand">
                <h3 className="welcome-footer-title">CAPACITI Programme</h3>
                <p className="welcome-footer-tagline">
                  Building tomorrow's workforce today
                </p>
              </div>

              <div className="welcome-footer-links">
                <div className="welcome-footer-section">
                  <h4>Platform</h4>
                  <ul>
                    <li>
                      <a href="#about">About Us</a>
                    </li>
                    <li>
                      <a href="#careers">Careers</a>
                    </li>
                    <li>
                      <a href="#contact">Contact</a>
                    </li>
                  </ul>
                </div>

                <div className="welcome-footer-section">
                  <h4>Support</h4>
                  <ul>
                    <li>
                      <a href="#help">Help Center</a>
                    </li>
                    <li>
                      <a href="#privacy">Privacy Policy</a>
                    </li>
                    <li>
                      <a href="#terms">Terms of Service</a>
                    </li>
                  </ul>
                </div>

                <div className="welcome-footer-section">
                  <h4>Connect</h4>
                  <div className="welcome-social-links">
                    <a
                      href="#linkedin"
                      className="welcome-social-link"
                      aria-label="LinkedIn"
                    >
                      <LinkedInIcon />
                    </a>
                    <a
                      href="#twitter"
                      className="welcome-social-link"
                      aria-label="Twitter"
                    >
                      <TwitterIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="welcome-footer-bottom">
              <p className="welcome-footer-copyright">
                © 2025 CAPACITI Programme. All rights reserved.
              </p>
            </div>
          </div>

          <div className="welcome-footer-decoration">
            <div className="welcome-footer-wave" />
            <div className="welcome-footer-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="welcome-footer-star"
                  style={{
                    left: `${20 + i * 15}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
