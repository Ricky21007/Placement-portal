import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/UnifiedEmployer.css";
import ScheduleInterview from "./ScheduleInterviews"; // Keep this import as you use it

const Applicants = () => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInterviewFor, setShowInterviewFor] = useState(null);
  const [hiringStatus, setHiringStatus] = useState({}); // Track hiring status per applicant
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to view applicants.");
          setLoading(false);
          return;
        }

        const appSnap = await getDocs(collection(db, "applications"));
        const relevantApplicants = [];
        const statusData = {};

        for (const appDoc of appSnap.docs) {
          const appData = appDoc.data();

          if (
            !appData.jobId ||
            typeof appData.jobId !== "string" ||
            appData.jobId.trim() === ""
          ) {
            console.warn(
              `Skipping application ${appDoc.id} due to invalid jobId:`,
              appData.jobId,
            );
            continue;
          }

          const jobRef = doc(db, "jobs", appData.jobId);
          const jobSnap = await getDoc(jobRef);

          if (jobSnap.exists()) {
            const jobData = jobSnap.data();
            if (jobData.employerId === user.uid) {
              const gradRef = doc(db, "graduates", appData.graduateId);
              const gradSnap = await getDoc(gradRef);
              const gradData = gradSnap.exists() ? gradSnap.data() : {};

              // Check for hiring status in interviews collection
              const interviewQuery = query(
                collection(db, "interviews"),
                where("graduateId", "==", appData.graduateId),
                where("jobId", "==", appData.jobId),
              );
              const interviewSnap = await getDocs(interviewQuery);

              let hiringStatus = null;
              if (!interviewSnap.empty) {
                const interviewData = interviewSnap.docs[0].data();
                if (interviewData.status === "Hired") {
                  hiringStatus = "hired";
                } else if (interviewData.status === "Not Hired") {
                  hiringStatus = "not_hired";
                }
              }

              if (hiringStatus) {
                statusData[appDoc.id] = hiringStatus;
              }

              relevantApplicants.push({
                id: appDoc.id,
                name: gradData.fullName || "Unknown",
                email: gradData.email || "Unknown",
                cvUrl: appData.cvUrl || "",
                portfolioUrl: gradData.portfolioUrl || "",
                jobTitle: jobData.jobTitle || "Unknown",
                motivation: appData.motivation,
                status: appData.status || "pending",
                graduateId: appData.graduateId,
                jobId: appData.jobId,
              });
            }
          }
        }

        setApplicants(relevantApplicants);
        setHiringStatus(statusData);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        alert("Failed to load applicants.");
      }
      setLoading(false);
    };

    fetchApplicants();
  }, []);

  const handleStatusChange = async (applicant, newStatus) => {
    try {
      const appRef = doc(db, "applications", applicant.id);
      await updateDoc(appRef, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: newStatus } : a,
        ),
      );

      if (newStatus === "accepted" || newStatus === "declined") {
        await addDoc(collection(db, "notifications"), {
          userId: applicant.graduateId,
          message: `Your application for "${applicant.jobTitle}" was ${newStatus}!`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const markAsHired = async (application) => {
    try {
      const interviewQuery = query(
        collection(db, "interviews"),
        where("graduateId", "==", application.graduateId),
        where("jobId", "==", application.jobId),
      );
      const interviewSnap = await getDocs(interviewQuery);
      const interviewDoc = interviewSnap.docs[0];
      if (interviewDoc) {
        await updateDoc(interviewDoc.ref, { status: "Hired" });
      }

      await addDoc(collection(db, "placements"), {
        graduateId: application.graduateId,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        employerId: auth.currentUser.uid,
        company: application.companyName || "",
        placedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, "notifications"), {
        userId: application.graduateId,
        message: `Congratulations! You've been hired for "${application.jobTitle}"${application.companyName ? ` at ${application.companyName}` : ""}.`,
        read: false,
        createdAt: serverTimestamp(),
      });

      alert("Graduate marked as hired.");
    } catch (err) {
      console.error(err);
      alert("Failed to mark as hired.");
    }
  };

  const markAsNotHired = async (application) => {
    try {
      const interviewQuery = query(
        collection(db, "interviews"),
        where("graduateId", "==", application.graduateId),
        where("jobId", "==", application.jobId),
      );
      const interviewSnap = await getDocs(interviewQuery);
      const interviewDoc = interviewSnap.docs[0];
      if (interviewDoc) {
        await updateDoc(interviewDoc.ref, { status: "Not Hired" });
      }

      await addDoc(collection(db, "notifications"), {
        userId: application.graduateId,
        message: `We regret to inform you that you were not selected for "${application.jobTitle}".`,
        read: false,
        createdAt: serverTimestamp(),
      });

      alert("Graduate marked as not hired.");
    } catch (err) {
      console.error(err);
      alert("Failed to mark as not hired.");
    }
  };

  if (loading) {
    return (
      <div className="employer-page">
        <div className="employer-container">
          <div className="employer-loading">
            <div className="employer-loading-spinner"></div>
            <p>Loading applicants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="employer-page">
        <div className="employer-container">
          <button
            className="employer-back-button"
            onClick={() => navigate("/employer/dashboard")}
          >
            ← Back to Dashboard
          </button>
          <div className="employer-empty-state">
            <h3>No Applicants Found</h3>
            <p>You haven't received any job applications yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-page">
      <div className="employer-container">
        <button
          className="employer-back-button"
          onClick={() => navigate("/employer/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="employer-header">
          <h1 className="employer-title">Applicants</h1>
          <p className="employer-subtitle">
            Review and manage job applications
          </p>
          <div
            style={{
              background: "rgba(255, 111, 97, 0.1)",
              border: "1px solid rgba(255, 111, 97, 0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--spacing-md)",
              marginTop: "var(--spacing-lg)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "var(--accent-coral)",
                margin: 0,
                fontSize: "var(--font-size-sm)",
                fontWeight: "500",
              }}
            >
              💡 <strong>Tip:</strong> Accept an application to unlock interview
              scheduling options
            </p>
          </div>
        </div>

        <div className="employer-list">
          {applicants.map((applicant) => (
            <div key={applicant.id} className="employer-list-item">
              <h3 className="employer-item-title">{applicant.name}</h3>

              <div className="employer-item-detail">
                <span className="employer-item-label">Email:</span>
                {applicant.email}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Job Applied:</span>
                {applicant.jobTitle}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Motivation:</span>
                {applicant.motivation}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">CV:</span>
                {applicant.cvUrl ? (
                  <a
                    href={applicant.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--accent-coral)",
                      textDecoration: "underline",
                    }}
                  >
                    View CV
                  </a>
                ) : (
                  "No CV uploaded"
                )}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Portfolio:</span>
                {applicant.portfolioUrl ? (
                  <a
                    href={applicant.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--accent-coral)",
                      textDecoration: "underline",
                    }}
                  >
                    View Portfolio
                  </a>
                ) : (
                  "No portfolio provided"
                )}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Status:</span>
                {applicant.status}
              </div>

              {applicant.status === "pending" && (
                <div
                  style={{
                    marginTop: "var(--spacing-lg)",
                    display: "flex",
                    gap: "var(--spacing-sm)",
                  }}
                >
                  <button
                    className="employer-button-primary"
                    onClick={() => handleStatusChange(applicant, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="employer-button-danger"
                    onClick={() => handleStatusChange(applicant, "declined")}
                  >
                    Decline
                  </button>
                </div>
              )}

              {applicant.status === "accepted" && (
                <div
                  style={{
                    marginTop: "var(--spacing-lg)",
                    padding: "var(--spacing-lg)",
                    background: "rgba(255, 111, 97, 0.05)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid rgba(255, 111, 97, 0.2)",
                  }}
                >
                  {hiringStatus[applicant.id] ? (
                    // Show status message after hiring decision
                    <div
                      style={{
                        textAlign: "center",
                        padding: "var(--spacing-lg)",
                      }}
                    >
                      {hiringStatus[applicant.id] === "hired" ? (
                        <div>
                          <div
                            style={{
                              fontSize: "2rem",
                              marginBottom: "var(--spacing-sm)",
                            }}
                          >
                            🎉
                          </div>
                          <h3
                            style={{
                              color: "#10b981",
                              margin: "0 0 var(--spacing-sm) 0",
                              fontSize: "var(--font-size-lg)",
                              fontWeight: "600",
                            }}
                          >
                            Candidate Placed
                          </h3>
                          <p
                            style={{
                              color: "#374151",
                              margin: 0,
                              fontSize: "var(--font-size-sm)",
                            }}
                          >
                            This candidate has been successfully hired for the
                            position.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div
                            style={{
                              fontSize: "2rem",
                              marginBottom: "var(--spacing-sm)",
                            }}
                          >
                            📋
                          </div>
                          <h3
                            style={{
                              color: "#dc2626",
                              margin: "0 0 var(--spacing-sm) 0",
                              fontSize: "var(--font-size-lg)",
                              fontWeight: "600",
                            }}
                          >
                            Not Placed
                          </h3>
                          <p
                            style={{
                              color: "#374151",
                              margin: 0,
                              fontSize: "var(--font-size-sm)",
                            }}
                          >
                            This candidate was not selected for the position.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Show original next steps section
                    <>
                      <h4
                        style={{
                          color: "var(--accent-coral)",
                          margin: "0 0 var(--spacing-md) 0",
                          fontSize: "var(--font-size-base)",
                          fontWeight: "600",
                        }}
                      >
                        Next Steps
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          gap: "var(--spacing-sm)",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="employer-button-primary"
                          onClick={() => {
                            console.log(
                              "Schedule Interview clicked for applicant:",
                              applicant.id,
                            );
                            setShowInterviewFor(applicant.id);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "var(--spacing-xs)",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                          </svg>
                          Schedule Interview
                        </button>
                      </div>

                      <MarkOutcomeButtons
                        applicant={applicant}
                        markAsHired={markAsHired}
                        markAsNotHired={markAsNotHired}
                        showInterviewFor={showInterviewFor}
                        hiringStatus={hiringStatus}
                        setHiringStatus={setHiringStatus}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interview Modal - Rendered outside of list items for better visibility */}
        {showInterviewFor && (
          <ScheduleInterview
            application={applicants.find((app) => app.id === showInterviewFor)}
            onClose={() => setShowInterviewFor(null)}
          />
        )}
      </div>
    </div>
  );
};

const MarkOutcomeButtons = ({
  applicant,
  markAsHired,
  markAsNotHired,
  showInterviewFor,
  hiringStatus,
  setHiringStatus,
}) => {
  const [interviewStatus, setInterviewStatus] = useState(null);

  useEffect(() => {
    const fetchInterviewStatus = async () => {
      const q = query(
        collection(db, "interviews"),
        where("graduateId", "==", applicant.graduateId),
        where("jobId", "==", applicant.jobId),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setInterviewStatus(snap.docs[0].data().status);
      }
    };
    fetchInterviewStatus();
  }, [applicant.graduateId, applicant.jobId]);

  // Show buttons if interview is being scheduled OR if interview is already scheduled
  // Hide if hiring decision has been made
  if (
    (interviewStatus !== "Scheduled" && showInterviewFor !== applicant.id) ||
    hiringStatus[applicant.id]
  )
    return null;

  const handleMarkHired = () => {
    markAsHired(applicant);
    setHiringStatus((prev) => ({
      ...prev,
      [applicant.id]: "hired",
    }));
  };

  const handleMarkNotHired = () => {
    markAsNotHired(applicant);
    setHiringStatus((prev) => ({
      ...prev,
      [applicant.id]: "not_hired",
    }));
  };

  return (
    <div
      style={{
        marginTop: "var(--spacing-md)",
        display: "flex",
        gap: "var(--spacing-sm)",
      }}
    >
      <button className="employer-button-primary" onClick={handleMarkHired}>
        ✅ Mark as Hired
      </button>
      <button className="employer-button-danger" onClick={handleMarkNotHired}>
        ❌ Mark as Not Hired
      </button>
    </div>
  );
};

export default Applicants;
