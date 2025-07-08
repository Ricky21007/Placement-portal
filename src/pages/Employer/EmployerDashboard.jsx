import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/UnifiedEmployer.css";
import {
  FaPlus,
  FaBriefcase,
  FaUsers,
  FaUserEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import { auth } from "../../firebase"; // Import Firebase auth

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const [employerName, setEmployerName] = useState("");
  const [activeJobs, setActiveJobs] = useState(0);
  const [applicants, setApplicants] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch data and get current user from Firebase auth
    const fetchData = () => {
      const user = auth.currentUser;
      if (user) {
        setEmployerName(user.displayName || user.email || "Employer");
      } else {
        setEmployerName("Employer");
      }
      setActiveJobs(5);
      setApplicants(23);
      setInterviews(7);
      setRecentActivity([
        'Job "Software Engineer" posted',
        '3 new applicants for "Product Manager"',
        "Interview scheduled with John Doe",
        "Profile updated",
      ]);
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    // Clear any authentication tokens or session data here
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to Welcome page
    navigate("/");
  };

  return (
    <div className="employer-page">
      <div className="employer-container">
        <button
          className="employer-logout-button"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <FaSignOutAlt />
        </button>

        <div className="employer-header">
          <h1 className="employer-title">Employer Portal</h1>
          <p className="employer-subtitle">
            Welcome back, <strong>{employerName}</strong>{" "}
            <span role="img" aria-label="wave">
              👋
            </span>
          </p>
        </div>

        <div className="employer-button-grid">
          <button
            className="employer-action-button"
            onClick={() => navigate("/employer/post-job")}
          >
            <FaPlus className="employer-button-icon" />
            Post Job
          </button>
          <button
            className="employer-action-button"
            onClick={() => navigate("/employer/view-jobs")}
          >
            <FaBriefcase className="employer-button-icon" />
            View Jobs
          </button>
          <button
            className="employer-action-button"
            onClick={() => navigate("/employer/applicants")}
          >
            <FaUsers className="employer-button-icon" />
            Applicants
          </button>
          <button
            className="employer-action-button"
            onClick={() => navigate("/employer/edit-profile")}
          >
            <FaUserEdit className="employer-button-icon" />
            Edit Profile
          </button>
        </div>

        <div className="employer-stats-container">
          <div className="employer-stat-card">
            <div className="employer-stat-number">{activeJobs}</div>
            <div className="employer-stat-label">Active Jobs</div>
          </div>
          <div className="employer-stat-card">
            <div className="employer-stat-number">{applicants}</div>
            <div className="employer-stat-label">Applicants</div>
          </div>
          <div className="employer-stat-card">
            <div className="employer-stat-number">{interviews}</div>
            <div className="employer-stat-label">Interviews</div>
          </div>
        </div>

        <div className="employer-activity-section">
          <h3 className="employer-activity-title">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="employer-empty-state">
              <p>No job activity yet.</p>
            </div>
          ) : (
            <ul className="employer-activity-list">
              {recentActivity.map((activity, index) => (
                <li key={index} className="employer-activity-item">
                  {activity}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
