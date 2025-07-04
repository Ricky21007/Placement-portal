import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import styles from "./ViewJobs.module.css";

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
    return <div className={styles.container}>Loading jobs...</div>;
  }

  if (jobs.length === 0) {
    return <div className={styles.container}>No jobs posted yet.</div>;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/employer/dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h2 className={styles.title}>View Jobs</h2>
      <ul className={styles.jobList}>
        {jobs.map((job) => (
          <li key={job.id} className={styles.jobItem}>
            <h3 className={styles.jobTitle}>{job.jobTitle}</h3>
            <p className={styles.jobDetail}>
              <span className={styles.jobLabel}>Description:</span>{" "}
              {job.jobDescription}
            </p>
            <p className={styles.jobDetail}>
              <span className={styles.jobLabel}>Location:</span> {job.location}
            </p>
            <p className={styles.jobDetail}>
              <span className={styles.jobLabel}>Type:</span> {job.jobType}
            </p>
            <p className={styles.jobDetail}>
              <span className={styles.jobLabel}>Salary:</span> {job.salary}
            </p>
            <p className={styles.jobDetail}>
              <span className={styles.jobLabel}>Deadline:</span> {job.deadline}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewJobs;
