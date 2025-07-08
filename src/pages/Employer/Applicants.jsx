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

              relevantApplicants.push({
                id: appDoc.id,
                name: gradData.fullName || "Unknown",
                email: gradData.email || "Unknown",
                cvUrl: appData.cvUrl || "",
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
                <div style={{ marginTop: "var(--spacing-lg)" }}>
                  <button
                    className="employer-button-secondary"
                    onClick={() => setShowInterviewFor(applicant.id)}
                  >
                    Schedule Interview
                  </button>
                  {showInterviewFor === applicant.id && (
                    <ScheduleInterview
                      application={applicant}
                      onClose={() => setShowInterviewFor(null)}
                    />
                  )}
                  <MarkOutcomeButtons
                    applicant={applicant}
                    markAsHired={markAsHired}
                    markAsNotHired={markAsNotHired}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MarkOutcomeButtons = ({ applicant, markAsHired, markAsNotHired }) => {
  const [interviewStatus, setInterviewStatus] = useState(null);
  const [marked, setMarked] = useState(false);

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

  if (interviewStatus !== "Scheduled" || marked) return null;

  const handleMarkHired = () => {
    markAsHired(applicant);
    setMarked(true);
  };

  const handleMarkNotHired = () => {
    markAsNotHired(applicant);
    setMarked(true);
  };

  return (
    <div style={{ marginTop: 8 }}>
      <button className={styles.acceptButton} onClick={handleMarkHired}>
        ✅ Mark as Hired
      </button>
      <button className={styles.declineButton} onClick={handleMarkNotHired}>
        ❌ Mark as Not Hired
      </button>
    </div>
  );
};

export default Applicants;
