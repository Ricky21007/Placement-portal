// src/pages/Graduate/ApplicationTracker.tsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import "../../styles/ApplicationTracker.css";

interface Application {
  id: string;
  jobTitle: string;
  status: string;
  createdAt: Timestamp;
  interviewDate?: string;
  interviewLink?: string;
  companyName?: string;
  jobType?: string;
  location?: string;
}

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        const appsRef = collection(db, "applications");
        const q = query(appsRef, where("graduateId", "==", user.uid));
        const appSnap = await getDocs(q);

        const appsData: Application[] = [];

        for (const docSnap of appSnap.docs) {
          const appData = docSnap.data();
          const jobRef = doc(db, "jobs", appData.jobId);
          const jobSnap = await getDoc(jobRef);

          let jobDetails = {
            jobTitle: "Unknown Job",
            companyName: "Unknown Company",
            jobType: "Unknown",
            location: "Unknown",
          };

          if (jobSnap.exists()) {
            const jobData = jobSnap.data();
            jobDetails = {
              jobTitle: jobData.jobTitle || jobData.title || "Unknown Job",
              companyName: jobData.companyName || "Unknown Company",
              jobType: jobData.jobType || "Unknown",
              location: jobData.location || "Unknown",
            };
          }

          let interviewDate = "";
          let interviewLink = "";

          if (appData.status === "accepted") {
            const interviewsRef = collection(db, "interviews");
            const interviewQuery = query(
              interviewsRef,
              where("graduateId", "==", appData.graduateId),
              where("jobId", "==", appData.jobId),
            );
            const interviewSnap = await getDocs(interviewQuery);

            if (!interviewSnap.empty) {
              const interviewData = interviewSnap.docs[0].data();
              interviewDate = interviewData.date
                ? interviewData.date.toDate().toLocaleString("en-ZA")
                : "";
              interviewLink = interviewData.link || "";
            }
          }

          appsData.push({
            id: docSnap.id,
            ...jobDetails,
            status: appData.status || "pending",
            createdAt: appData.createdAt,
            interviewDate,
            interviewLink,
          });
        }

        // Sort by application date (most recent first)
        appsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return (
            b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          );
        });

        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        );
      case "declined":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        );
      case "pending":
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z" />
          </svg>
        );
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "accepted":
        return "status-accepted";
      case "declined":
        return "status-declined";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const filteredApplications =
    selectedStatus === "all"
      ? applications
      : applications.filter((app) => app.status === selectedStatus);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    accepted: applications.filter((app) => app.status === "accepted").length,
    declined: applications.filter((app) => app.status === "declined").length,
  };

  if (loading) {
    return (
      <div className="application-tracker-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="application-tracker-page">
      <div className="application-tracker-container">
        {/* Header */}
        <div className="page-header">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="page-title">Application Tracker</h1>
          <p className="page-subtitle">
            Track the status of your job applications and upcoming interviews
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="status-tabs">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              className={`status-tab ${selectedStatus === status ? "active" : ""}`}
              onClick={() => setSelectedStatus(status)}
            >
              <span className="tab-label">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              <span className="tab-count">{count}</span>
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
              </svg>
            </div>
            <h3 className="empty-title">
              {selectedStatus === "all"
                ? "No Applications Yet"
                : `No ${selectedStatus} Applications`}
            </h3>
            <p className="empty-text">
              {selectedStatus === "all"
                ? "You haven't applied for any jobs yet. Start exploring job opportunities!"
                : `You don't have any ${selectedStatus} applications at the moment.`}
            </p>
            {selectedStatus === "all" && (
              <Link to="/graduate/jobs" className="btn-primary">
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="applications-grid">
            {filteredApplications.map((app) => (
              <div key={app.id} className="application-card">
                <div className="application-header">
                  <div className="job-info">
                    <h3 className="job-title">{app.jobTitle}</h3>
                    <p className="company-name">{app.companyName}</p>
                  </div>
                  <div className={`status-badge ${getStatusClass(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span>{app.status.toUpperCase()}</span>
                  </div>
                </div>

                <div className="application-details">
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                    </svg>
                    <span>
                      Applied:{" "}
                      {app.createdAt?.toDate().toLocaleDateString("en-ZA")}
                    </span>
                  </div>

                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span>{app.location}</span>
                  </div>

                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 10 2 10 2 9 2.54 8.5 3.34l-.5.68-.5-.67C7.18 2.54 6.22 2 5.5 2 4.67 2 4 2.67 4 3.5c0 .35.07.69.18 1H2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                    </svg>
                    <span>{app.jobType}</span>
                  </div>
                </div>

                {app.status === "accepted" && app.interviewDate && (
                  <div className="interview-section">
                    <div className="interview-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
                      </svg>
                      <h4>Interview Scheduled</h4>
                    </div>
                    <div className="interview-details">
                      <p className="interview-date">
                        <strong>Date & Time:</strong> {app.interviewDate}
                      </p>
                      {app.interviewLink && (
                        <a
                          href={app.interviewLink}
                          className="interview-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                          </svg>
                          Join Interview
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {app.status === "declined" && (
                  <div className="declined-section">
                    <p className="declined-message">
                      Unfortunately, your application was not successful this
                      time. Keep applying and improving your profile!
                    </p>
                  </div>
                )}

                {app.status === "pending" && (
                  <div className="pending-section">
                    <p className="pending-message">
                      Your application is being reviewed. We'll notify you once
                      there's an update.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
