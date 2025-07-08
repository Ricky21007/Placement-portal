import React, { useState, useEffect } from "react";
import "../../styles/UnifiedEmployer.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc, DocumentData } from "firebase/firestore";

interface EmployerData {
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
}

const EmployerDashboard = () => {
  const [employerData, setEmployerData] = useState<EmployerData | null>(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeJobs: 5,
    applicants: 12,
    interviews: 3,
  });

  const [recentActivity, setRecentActivity] = useState<string[]>([
    "Job posting 'Frontend Developer' approved",
    "New applicant for 'Backend Engineer'",
    "Interview scheduled for 'Project Manager'",
  ]);

  useEffect(() => {
    const fetchEmployerData = async () => {
      if (auth.currentUser) {
        console.log("Fetching employer data for UID:", auth.currentUser.uid);
        const docRef = doc(db, "employers", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        console.log("Document exists:", docSnap.exists());
        if (docSnap.exists()) {
          setEmployerData(docSnap.data() as EmployerData);
        } else {
          console.log("No employer data found!");
        }
      } else {
        console.log("No authenticated user found");
      }
    };
    fetchEmployerData();
  }, []);

  // Added button click handlers for navigation
  const handlePostJob = () => {
    navigate("/employer/postjob");
  };

  const handleViewJobs = () => {
    navigate("/employer/viewjobs");
  };

  const handleApplicants = () => {
    navigate("/employer/applicants");
  };

  const handleEditProfile = () => {
    navigate("/employer/editprofile");
  };

  return (
    <div className="employer-page">
      <div className="employer-container">
        <button
          className="employer-logout-button"
          aria-label="Logout"
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              console.log("Logout clicked");
              navigate("/login");
            }
          }}
          title="Logout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>

        <div className="employer-header">
          <h1 className="employer-title">Employer Portal</h1>
          <p className="employer-subtitle">
            Welcome back, {employerData?.companyName ?? "Employer"}{" "}
            <span role="img" aria-label="waving hand">
              👋
            </span>
          </p>
        </div>

        <div className="employer-button-grid">
          <button
            className="employer-action-button"
            onClick={handlePostJob}
            title="Post a new job"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="employer-button-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Post Job
          </button>
          <button
            className="employer-action-button"
            onClick={handleViewJobs}
            title="View your job postings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="employer-button-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            View Jobs
          </button>
          <button
            className="employer-action-button"
            onClick={handleApplicants}
            title="View applicants"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="employer-button-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a4 4 0 0 0-3-3.87"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20H4v-2a4 4 0 0 1 3-3.87"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Applicants
          </button>
          <button
            className="employer-action-button"
            onClick={handleEditProfile}
            title="Edit your profile"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="employer-button-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect width="18" height="14" x="3" y="5" rx="2" ry="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Edit Profile
          </button>
        </div>

        {employerData && (
          <div className="employer-form-container">
            <h3 className="employer-activity-title">Company Details</h3>
            <div className="employer-item-detail">
              <span className="employer-item-label">Company Name:</span>{" "}
              {employerData.companyName}
            </div>
            <div className="employer-item-detail">
              <span className="employer-item-label">Email:</span>{" "}
              {employerData.email}
            </div>
            <div className="employer-item-detail">
              <span className="employer-item-label">Phone:</span>{" "}
              {employerData.phone || "N/A"}
            </div>
            <div className="employer-item-detail">
              <span className="employer-item-label">Website:</span>{" "}
              {employerData.website || "N/A"}
            </div>
          </div>
        )}

        <div className="employer-stats-container">
          <div className="employer-stat-card">
            <div className="employer-stat-number">{stats.activeJobs}</div>
            <div className="employer-stat-label">Active Jobs</div>
          </div>
          <div className="employer-stat-card">
            <div className="employer-stat-number">{stats.applicants}</div>
            <div className="employer-stat-label">Applicants</div>
          </div>
          <div className="employer-stat-card">
            <div className="employer-stat-number">{stats.interviews}</div>
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
