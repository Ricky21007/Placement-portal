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
  onSnapshot,
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
  interviewTime?: string;
  interviewType?: string;
  interviewNotes?: string;
  interviewStatus?: string;
  employerName?: string;
  interviewDuration?: string;
  companyName?: string;
  jobType?: string;
  location?: string;
  jobId?: string;
  meetingType?: string;
  interviewLocation?: string;
}

interface Placement {
  id: string;
  graduateId: string;
  jobId: string;
  jobTitle: string;
  placedAt: Timestamp;
  employerId: string;
  companyName?: string;
}

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    let unsubscribePlacements: (() => void) | null = null;

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

            let companyName = "Unknown Company";
            if (jobData.employerId) {
              const companyRef = doc(db, "companyProfiles", jobData.employerId);
              const companySnap = await getDoc(companyRef);
              if (companySnap.exists()) {
                companyName =
                  companySnap.data().companyName || "Unknown Company";
              }
            }

            jobDetails = {
              jobTitle: jobData.jobTitle || jobData.title || "Unknown Job",
              companyName,
              jobType: jobData.jobType || "Unknown",
              location: jobData.location || "Unknown",
            };
          }

          let interviewDate = "";
          let interviewLink = "";
          let interviewTime = "";
          let interviewType = "";
          let interviewNotes = "";
          let interviewStatus = "";
          let employerName = "";
          let interviewDuration = "";
          let meetingType = "";
          let interviewLocation = "";

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
                ? interviewData.date.toDate().toLocaleDateString("en-ZA")
                : "";
              interviewTime = interviewData.date
                ? interviewData.date.toDate().toLocaleTimeString("en-ZA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              // Use the correct field names from the employer's interview creation
              interviewLink =
                interviewData.teamsLink || interviewData.link || "";
              meetingType = interviewData.meetingType || "Not specified";
              interviewLocation = interviewData.location || "Not specified";
              interviewType =
                meetingType === "teams"
                  ? "Microsoft Teams"
                  : meetingType === "in-person"
                    ? "In-Person Meeting"
                    : meetingType === "other"
                      ? "Online Meeting"
                      : interviewData.type || "Not specified";

              interviewNotes = interviewData.notes || "";
              interviewStatus = interviewData.status || "Scheduled";
              employerName =
                interviewData.employerName || jobDetails.companyName;
              interviewDuration = interviewData.duration || "Not specified";
            }
          }

          appsData.push({
            id: docSnap.id,
            ...jobDetails,
            status: appData.status || "pending",
            createdAt: appData.createdAt,
            interviewDate,
            interviewLink,
            interviewTime,
            interviewType,
            interviewNotes,
            interviewStatus,
            employerName,
            interviewDuration,
            meetingType,
            interviewLocation,
            jobId: appData.jobId,
          });
        }

        appsData.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return (
            b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
          );
        });

        setApplications(appsData);

        // Fetch placements
        const placementRef = collection(db, "placements");
        const placementsQuery = query(
          placementRef,
          where("graduateId", "==", user.uid),
        );

        unsubscribePlacements = onSnapshot(
          placementsQuery,
          async (snapshot) => {
            const placementArr: Placement[] = [];
            for (const docSnap of snapshot.docs) {
              const data = docSnap.data() as Placement;

              let companyName = "Unknown Company";

              // Get job to find employerId
              const jobRef = doc(db, "jobs", data.jobId);
              const jobSnap = await getDoc(jobRef);

              if (jobSnap.exists()) {
                const jobData = jobSnap.data();
                if (jobData.employerId) {
                  const companyRef = doc(
                    db,
                    "companyProfiles",
                    jobData.employerId,
                  );
                  const companySnap = await getDoc(companyRef);
                  if (companySnap.exists()) {
                    companyName =
                      companySnap.data().companyName || "Unknown Company";
                  }
                }
              }

              placementArr.push({ ...data, companyName, id: docSnap.id });
            }
            setPlacements(placementArr);
          },
        );
      } catch (error) {
        console.error("Error fetching applications or placements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      if (unsubscribePlacements) unsubscribePlacements();
    };
  }, []);

  const applicationsWithPlacement = applications.map((app) => {
    const placed = placements.find((p) => p.jobId === app.jobId);
    return {
      ...app,
      isPlaced: !!placed,
      placement: placed,
      companyName: placed?.companyName || app.companyName,
    };
  });

  const filteredApplications =
    selectedStatus === "all"
      ? applicationsWithPlacement
      : applicationsWithPlacement.filter(
          (app) => app.status === selectedStatus,
        );

  const statusCounts = {
    all: applicationsWithPlacement.length,
    pending: applicationsWithPlacement.filter((app) => app.status === "pending")
      .length,
    accepted: applicationsWithPlacement.filter(
      (app) => app.status === "accepted",
    ).length,
    declined: applicationsWithPlacement.filter(
      (app) => app.status === "declined",
    ).length,
  };

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
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        );
    }
  };

  const getStatusClass = (status: string, isPlaced: boolean): string => {
    if (isPlaced) return "status-placed";
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
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="header-info">
            <h1 className="page-title">Application Tracker</h1>
            <p className="page-subtitle">
              Track the status of your job applications and upcoming interviews
            </p>
          </div>
        </div>
      </div>

      <div className="application-tracker-container">
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
                  <div
                    className={`status-badge ${getStatusClass(
                      app.status,
                      app.isPlaced,
                    )}`}
                  >
                    {app.isPlaced ? (
                      <>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                        </svg>
                        <span>PLACED</span>
                      </>
                    ) : (
                      <>
                        {getStatusIcon(app.status)}
                        <span>{app.status.toUpperCase()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Application Details */}
                <div className="application-details">
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <span>
                      <strong>Type:</strong> {app.jobType}
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
                    <span>
                      <strong>Location:</strong> {app.location}
                    </span>
                  </div>
                  <div className="detail-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                    <span>
                      <strong>Applied:</strong>{" "}
                      {app.createdAt?.toDate().toLocaleDateString("en-ZA")}
                    </span>
                  </div>
                </div>

                {/* Interview Section for Accepted Applications */}
                {app.status === "accepted" && app.interviewDate && (
                  <div className="interview-section">
                    <div className="interview-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 16H9V7h9v14z" />
                      </svg>
                      <h4>Interview Scheduled</h4>
                    </div>
                    <div className="interview-details">
                      <div className="interview-info-grid">
                        <div className="interview-info-item">
                          <strong>Date:</strong>
                          <span>{app.interviewDate}</span>
                        </div>
                        <div className="interview-info-item">
                          <strong>Time:</strong>
                          <span>{app.interviewTime || "Not specified"}</span>
                        </div>
                        <div className="interview-info-item">
                          <strong>Type:</strong>
                          <span>{app.interviewType || "Not specified"}</span>
                        </div>
                        <div className="interview-info-item">
                          <strong>Duration:</strong>
                          <span>
                            {app.interviewDuration || "Not specified"}
                          </span>
                        </div>
                        {app.employerName && (
                          <div className="interview-info-item">
                            <strong>Interviewer:</strong>
                            <span>{app.employerName}</span>
                          </div>
                        )}
                        <div className="interview-info-item">
                          <strong>Status:</strong>
                          <span
                            className={`interview-status ${app.interviewStatus}`}
                          >
                            {app.interviewStatus === "scheduled"
                              ? "📅 Scheduled"
                              : app.interviewStatus === "completed"
                                ? "✅ Completed"
                                : app.interviewStatus === "cancelled"
                                  ? "❌ Cancelled"
                                  : "📋 " +
                                    (app.interviewStatus || "Scheduled")}
                          </span>
                        </div>
                      </div>

                      {app.interviewNotes && (
                        <div className="interview-notes">
                          <strong>Additional Notes:</strong>
                          <p>{app.interviewNotes}</p>
                        </div>
                      )}

                      {app.interviewLink && (
                        <div className="interview-actions">
                          <a
                            href={app.interviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="interview-link"
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
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status-specific messages */}
                {app.status === "pending" && (
                  <div className="pending-section">
                    <p className="pending-message">
                      Your application is under review. You will be notified
                      once the employer makes a decision.
                    </p>
                  </div>
                )}

                {app.status === "declined" && (
                  <div className="declined-section">
                    <p className="declined-message">
                      Unfortunately, your application was not successful this
                      time. Keep applying to other opportunities!
                    </p>
                  </div>
                )}

                {app.isPlaced && (
                  <div className="placement-section">
                    <div className="placement-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <h4>🎉 Congratulations! You've been placed!</h4>
                    </div>
                    <p className="placement-message">
                      You have been successfully placed at {app.companyName}.
                      Welcome to your new role!
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
