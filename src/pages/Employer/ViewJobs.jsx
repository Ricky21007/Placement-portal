import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/UnifiedEmployer.css";

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to view jobs.");
          setLoading(false);
          return;
        }
        const jobsRef = collection(db, "jobs");
        // Assuming jobs have a field 'employerId' to filter by current user
        const q = query(jobsRef, where("employerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const jobsList = [];
        querySnapshot.forEach((doc) => {
          jobsList.push({ id: doc.id, ...doc.data() });
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

  if (loading) {
    return (
      <div className="employer-page">
        <div className="employer-container">
          <div className="employer-loading">
            <div className="employer-loading-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
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
            <h3>No Jobs Posted Yet</h3>
            <p>
              You haven't posted any jobs yet. Create your first job posting to
              start attracting talented candidates!
            </p>
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
          <h1 className="employer-title">Your Job Postings</h1>
          <p className="employer-subtitle">
            Manage and review your active job listings
          </p>
        </div>

        <div className="employer-list">
          {jobs.map((job) => (
            <div key={job.id} className="employer-list-item">
              <h3 className="employer-item-title">{job.jobTitle}</h3>

              <div className="employer-item-detail">
                <span className="employer-item-label">Description:</span>
                {job.jobDescription}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Location:</span>
                {job.location}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Type:</span>
                {job.jobType}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Salary:</span>
                {job.salary}
              </div>

              <div className="employer-item-detail">
                <span className="employer-item-label">Deadline:</span>
                {job.deadline}
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="employer-item-detail">
                  <span className="employer-item-label">Required Skills:</span>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--spacing-xs)",
                      marginTop: "var(--spacing-xs)",
                    }}
                  >
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        style={{
                          background: "rgba(255, 111, 97, 0.2)",
                          color: "var(--accent-coral)",
                          padding: "var(--spacing-xs) var(--spacing-sm)",
                          borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-sm)",
                          fontWeight: "500",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewJobs;
