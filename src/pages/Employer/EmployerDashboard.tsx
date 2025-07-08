import React, { useState, useEffect } from "react";
import "../../styles/UnifiedEmployer.css";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

interface EmployerData {
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
}

const EmployerDashboard = () => {
  const [employerData, setEmployerData] = useState<EmployerData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    activeJobs: 0,
    applicants: 0,
    interviews: 0,
  });

  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login/employer");
          return;
        }

        // Fetch employer profile data
        const employerDocRef = doc(db, "employers", user.uid);
        const employerDocSnap = await getDoc(employerDocRef);
        if (employerDocSnap.exists()) {
          setEmployerData(employerDocSnap.data() as EmployerData);
        }

        // Also try employersignup collection if not found in employers
        if (!employerDocSnap.exists()) {
          const employerSignupDocRef = doc(db, "employersignup", user.uid);
          const employerSignupDocSnap = await getDoc(employerSignupDocRef);
          if (employerSignupDocSnap.exists()) {
            setEmployerData(employerSignupDocSnap.data() as EmployerData);
          }
        }

        // Fetch active jobs count
        const jobsQuery = query(
          collection(db, "jobs"),
          where("employerId", "==", user.uid),
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsCount = jobsSnapshot.size;

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

        // Fetch interviews count
        const interviewsQuery = query(
          collection(db, "interviews"),
          where("employerId", "==", user.uid),
        );
        const interviewsSnapshot = await getDocs(interviewsQuery);

        setStats({
          activeJobs: jobsCount,
          applicants: totalApplicants,
          interviews: interviewsSnapshot.size,
        });

        // Fetch recent activity
        const activities: string[] = [];

        // Add recent job postings
        const recentJobsQuery = query(
          collection(db, "jobs"),
          where("employerId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(3),
        );
        const recentJobsSnapshot = await getDocs(recentJobsQuery);
        recentJobsSnapshot.forEach((doc) => {
          const jobData = doc.data();
          const date = jobData.createdAt?.toDate();
          const timeAgo = date ? getTimeAgo(date) : "recently";
          activities.push(
            `Job "${jobData.jobTitle || jobData.title}" posted ${timeAgo}`,
          );
        });

        // Add recent applications
        if (jobIds.length > 0) {
          const recentAppsQuery = query(
            collection(db, "applications"),
            where("jobId", "in", jobIds.slice(0, 10)),
            orderBy("createdAt", "desc"),
            limit(3),
          );
          const recentAppsSnapshot = await getDocs(recentAppsQuery);

          for (const appDoc of recentAppsSnapshot.docs) {
            const appData = appDoc.data();
            const jobDoc = await getDoc(doc(db, "jobs", appData.jobId));
            const jobTitle = jobDoc.exists()
              ? jobDoc.data()?.jobTitle || jobDoc.data()?.title
              : "Unknown Position";
            const date = appData.createdAt?.toDate();
            const timeAgo = date ? getTimeAgo(date) : "recently";
            activities.push(`New applicant for "${jobTitle}" ${timeAgo}`);
          }
        }

        // Add recent interviews
        const recentInterviewsQuery = query(
          collection(db, "interviews"),
          where("employerId", "==", user.uid),
          orderBy("date", "desc"),
          limit(2),
        );
        const recentInterviewsSnapshot = await getDocs(recentInterviewsQuery);
        recentInterviewsSnapshot.forEach((doc) => {
          const interviewData = doc.data();
          const date = interviewData.date?.toDate();
          const timeAgo = date ? getTimeAgo(date) : "recently";
          activities.push(`Interview scheduled ${timeAgo}`);
        });

        setRecentActivity(activities.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setRecentActivity(["Error loading recent activity"]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

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

        <div
          className="employer-button-grid"
          style={{
            gridTemplateColumns: "repeat(4, 1fr)",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
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
