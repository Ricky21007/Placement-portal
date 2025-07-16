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
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

const EmployerDashboard = () => {
  const navigate = useNavigate();

  const [employerName, setEmployerName] = useState("");
  const [activeJobs, setActiveJobs] = useState(0);
  const [applicants, setApplicants] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login/employer");
          return;
        }

        // Set employer name
        setEmployerName(user.displayName || user.email || "Employer");

        // Fetch active jobs count
        const jobsQuery = query(
          collection(db, "jobs"),
          where("employerId", "==", user.uid),
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsCount = jobsSnapshot.size;
        setActiveJobs(jobsCount);

        // Fetch applicants count for this employer's jobs
        const jobIds = jobsSnapshot.docs.map((doc) => doc.id);
        let totalApplicants = 0;
        if (jobIds.length > 0) {
          const applicationsQuery = query(
            collection(db, "applications"),
            where("jobId", "in", jobIds),
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          totalApplicants = applicationsSnapshot.size;
        }
        setApplicants(totalApplicants);

        // Fetch interviews count
        const interviewsQuery = query(
          collection(db, "interviews"),
          where("employerId", "==", user.uid),
        );
        const interviewsSnapshot = await getDocs(interviewsQuery);
        setInterviews(interviewsSnapshot.size);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

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

        <div
          className="employer-button-grid"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            maxWidth: "1000px",
            margin: "0 auto 4rem auto",
          }}
        >
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
            <div className="employer-stat-number">
              {loading ? "..." : activeJobs}
            </div>
            <div className="employer-stat-label">Active Jobs</div>
          </div>
          <div className="employer-stat-card">
            <div className="employer-stat-number">
              {loading ? "..." : applicants}
            </div>
            <div className="employer-stat-label">Applicants</div>
          </div>
          <div className="employer-stat-card">
            <div className="employer-stat-number">
              {loading ? "..." : interviews}
            </div>
            <div className="employer-stat-label">Interviews Scheduled</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
