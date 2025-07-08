import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Link } from "react-router-dom";
import "../../styles/GraduateViewJobs.css";

interface Job {
  id: string;
  jobTitle: string;
  jobDescription: string;
  location: string;
  jobType: string;
  salary: string;
  deadline?: any;
}

const ViewJobsGraduate = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [motivation, setMotivation] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const jobsRef = collection(db, "jobs");
        const q = query(jobsRef); // Get all jobs
        const querySnapshot = await getDocs(q);
        const jobsList: Job[] = [];
        querySnapshot.forEach((doc) => {
          jobsList.push({ id: doc.id, ...doc.data() } as Job);
        });
        setJobs(jobsList);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        alert("Failed to load jobs.");
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // Open application modal
  const openApplicationModal = (job: Job) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to apply.");
      return;
    }
    setSelectedJob(job);
    setShowModal(true);
    setMotivation("");
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setMotivation("");
  };

  // Submit application
  const submitApplication = async () => {
    if (!selectedJob || !motivation.trim()) {
      alert("Please provide your motivation for applying.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to apply.");
      return;
    }

    setApplying(true);
    try {
      // Fetch graduate CV from Firestore
      const gradRef = collection(db, "graduates");
      const gradSnap = await getDocs(query(gradRef));
      let cvUrl = "";

      gradSnap.forEach((doc) => {
        if (doc.id === user.uid) {
          const data = doc.data();
          if (data.cvUrl) {
            cvUrl = data.cvUrl;
          }
        }
      });

      await addDoc(collection(db, "applications"), {
        graduateId: user.uid,
        jobId: selectedJob.id,
        motivation,
        status: "pending",
        createdAt: serverTimestamp(),
        cvUrl,
      });

      closeModal();
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <Link to="/graduate/dashboard" className="back-button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="header-info">
              <h1 className="title">Available Jobs</h1>
              <p className="subtitle">
                Loading amazing opportunities for you...
              </p>
            </div>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Finding the best jobs for you...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <div className="page-header-content">
            <Link to="/graduate/dashboard" className="back-button">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
              </svg>
              Back to Dashboard
            </Link>
            <div className="header-info">
              <h1 className="title">Available Jobs</h1>
              <p className="subtitle">
                Your next opportunity is just around the corner
              </p>
            </div>
          </div>
        </div>
        <div className="jobs-container">
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <h3 className="empty-state-title">No Jobs Available Yet</h3>
            <p className="empty-state-text">
              We're working hard to bring you amazing opportunities. Check back
              soon for new job postings that match your skills and ambitions!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="header-info">
            <h1 className="title">Available Jobs</h1>
            <p className="subtitle">
              Discover opportunities that match your skills and aspirations
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="jobs-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Available Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {new Set(jobs.map((job) => job.jobType)).size}
            </div>
            <div className="stat-label">Job Types</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {new Set(jobs.map((job) => job.location)).size}
            </div>
            <div className="stat-label">Locations</div>
          </div>
        </div>
      </div>

      {/* Jobs Container */}
      <div className="jobs-container">
        <ul className="jobList">
          {jobs.map((job) => (
            <li key={job.id} className="jobItem">
              {/* Job Header */}
              <div className="job-header">
                <div className="job-title-section">
                  <h3 className="jobTitle">{job.jobTitle}</h3>
                  <p className="company-name">Company Position</p>
                </div>
                <div className="job-type-badge">{job.jobType}</div>
              </div>

              {/* Job Details Grid */}
              <div className="job-details-grid">
                <div className="job-detail-item">
                  <svg
                    className="detail-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div className="detail-content">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">{job.location}</div>
                  </div>
                </div>

                <div className="job-detail-item">
                  <svg
                    className="detail-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <div className="detail-content">
                    <div className="detail-label">Experience</div>
                    <div className="detail-value">Entry Level</div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="job-description">
                <p className="job-description-text">{job.jobDescription}</p>
              </div>

              {/* Salary & Deadline */}
              <div className="job-meta">
                <div className="salary-info">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M7 15h2c0 1.08 1.37 2 3 2s3-.92 3-2c0-1.1-1.04-1.5-3.24-2.03C9.64 12.44 7 11.78 7 9c0-1.79 1.47-3.31 3.5-3.82V3h3v2.18C15.53 5.69 17 7.21 17 9h-2c0-1.08-1.37-2-3-2s-3 .92-3 2c0 1.1 1.04 1.5 3.24 2.03C14.36 11.56 17 12.22 17 15c0 1.79-1.47 3.31-3.5 3.82V21h-3v-2.18C8.47 18.31 7 16.79 7 15z" />
                  </svg>
                  {job.salary}
                </div>
                <div className="deadline-info">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                  </svg>
                  Deadline:{" "}
                  {job.deadline && job.deadline.toDate
                    ? job.deadline.toDate().toLocaleDateString()
                    : job.deadline || "Not specified"}
                </div>
              </div>

              {/* Apply Button */}
              <button
                className="applyButton"
                onClick={() => openApplicationModal(job)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ marginRight: "0.5rem" }}
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                Apply Now
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Application Modal */}
      {showModal && selectedJob && (
        <div className="application-modal-overlay" onClick={closeModal}>
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <button className="modal-close" onClick={closeModal}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
              <h2 className="modal-title">Apply for Position</h2>
              <p className="modal-subtitle">{selectedJob.jobTitle}</p>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Why are you interested in this position? *
                </label>
                <textarea
                  className="form-textarea"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Tell us why you're excited about this opportunity and how your skills align with the role..."
                  rows={5}
                />
              </div>

              <div
                style={{
                  background: "rgba(255, 111, 97, 0.05)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 111, 97, 0.1)",
                  marginBottom: "1rem",
                }}
              >
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151" }}>
                  <strong>Note:</strong> Your CV and profile information will be
                  automatically included with this application.
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-button modal-button-secondary"
                onClick={closeModal}
                disabled={applying}
              >
                Cancel
              </button>
              <button
                className="modal-button modal-button-primary"
                onClick={submitApplication}
                disabled={applying || !motivation.trim()}
              >
                {applying ? (
                  <div className="loading-button">
                    <div className="button-spinner"></div>
                    Submitting...
                  </div>
                ) : (
                  "Submit Application"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobsGraduate;
