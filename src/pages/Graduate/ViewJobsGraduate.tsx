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

  // ✅ Apply for job function
  const applyForJob = async (jobId: string, jobTitle: string) => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to apply.");
      return;
    }

    const motivation = prompt(`Why are you applying for "${jobTitle}"?`);
    if (!motivation || motivation.trim() === "") {
      alert("Application cancelled. Motivation is required.");
      return;
    }

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
        jobId,
        motivation,
        status: "pending",
        createdAt: serverTimestamp(),
        cvUrl, // Include CV URL in the application
      });
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to submit application.");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <h2 className="title">Available Jobs</h2>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="empty-state-title">No Jobs Available</h3>
          <p className="empty-state-text">
            There are no job opportunities available at the moment. Check back
            later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/graduate/dashboard" className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
          </svg>
          Back to Dashboard
        </Link>
        <h2 className="title">Available Jobs</h2>
        <p className="subtitle">Browse all available job opportunities</p>
      </div>
      <ul className="jobList">
        {jobs.map((job) => (
          <li key={job.id} className="jobItem">
            <h3 className="jobTitle">{job.jobTitle}</h3>
            <p className="jobDetail">
              <span className="jobLabel">Description:</span>{" "}
              {job.jobDescription}
            </p>
            <p className="jobDetail">
              <span className="jobLabel">Location:</span> {job.location}
            </p>
            <p className="jobDetail">
              <span className="jobLabel">Type:</span> {job.jobType}
            </p>
            <p className="jobDetail">
              <span className="jobLabel">Salary:</span> {job.salary}
            </p>
            <p className="jobDetail">
              <span className="jobLabel">Deadline:</span>{" "}
              {job.deadline && job.deadline.toDate
                ? job.deadline.toDate().toLocaleDateString()
                : job.deadline}
            </p>

            {/* ✅ Apply Button */}
            <button
              className="applyButton"
              onClick={() => applyForJob(job.id, job.jobTitle)}
            >
              Apply
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewJobsGraduate;
