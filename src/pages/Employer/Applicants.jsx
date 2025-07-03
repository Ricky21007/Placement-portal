import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import styles from "./Applicants.module.css";
import ScheduleInterview from "./ScheduleInterviews"; // Import the ScheduleInterview component

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

          // ✅ Validate jobId before proceeding
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
                graduateId: appData.graduateId, // ✅ Add this
                jobId: appData.jobId, // ✅ Add this too if needed in ScheduleInterview
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

  // Accept/Decline handlers
  const handleStatusChange = async (applicant, newStatus) => {
    try {
      const appRef = doc(db, "applications", applicant.id);
      await updateDoc(appRef, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicant.id ? { ...a, status: newStatus } : a,
        ),
      );

      // Send notification to graduate
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

  if (loading) {
    return <div className={styles.container}>Loading applicants...</div>;
  }

  if (applicants.length === 0) {
    return <div className={styles.container}>No applicants found.</div>;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/employer-dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h2 className={styles.title}>Applicants</h2>
      <ul className={styles.applicantList}>
        {applicants.map((applicant) => (
          <li key={applicant.id} className={styles.applicantItem}>
            <p>
              <span className={styles.applicantLabel}>Name:</span>{" "}
              {applicant.name}
            </p>
            <p>
              <span className={styles.applicantLabel}>Email:</span>{" "}
              {applicant.email}
            </p>
            <p>
              <span className={styles.applicantLabel}>Job Applied:</span>{" "}
              {applicant.jobTitle}
            </p>
            <p>
              <span className={styles.applicantLabel}>Motivation:</span>{" "}
              {applicant.motivation}
            </p>
            <p>
              <span className={styles.applicantLabel}>CV:</span>
              {applicant.cvUrl ? (
                <a
                  href={applicant.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#0070f3" }}
                >
                  View CV
                </a>
              ) : (
                "No CV uploaded"
              )}
            </p>
            <p>
              <span className={styles.applicantLabel}>Status:</span>{" "}
              {applicant.status}
            </p>
            {applicant.status === "pending" && (
              <div style={{ marginTop: 8 }}>
                <button
                  className={styles.acceptButton}
                  onClick={() => handleStatusChange(applicant, "accepted")}
                >
                  Accept
                </button>
                <button
                  className={styles.declineButton}
                  onClick={() => handleStatusChange(applicant, "declined")}
                >
                  Decline
                </button>
              </div>
            )}
            {applicant.status === "accepted" && (
              <>
                <button
                  className={styles.scheduleButton}
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
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Applicants;
