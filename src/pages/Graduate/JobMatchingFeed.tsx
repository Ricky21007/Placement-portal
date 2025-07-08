// src/pages/Graduate/JobMatchingFeed.tsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/JobMatchingFeed.css";

interface Job {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  companyName?: string;
  location?: string;
  jobType?: string;
  salary?: string;
  deadline?: any;
  matchPercentage?: number;
}

const JobMatchingFeed: React.FC = () => {
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [motivation, setMotivation] = useState("");
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const calculateMatchPercentage = (
    jobSkills: string[],
    userSkills: string[],
  ): number => {
    if (jobSkills.length === 0) return 0;

    const userSkillsLower = userSkills.map((skill) => skill.toLowerCase());
    const matchingSkills = jobSkills.filter((skill) =>
      userSkillsLower.includes(skill.toLowerCase()),
    );

    return Math.round((matchingSkills.length / jobSkills.length) * 100);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        // 1. Get graduate's skills
        const gradRef = doc(db, "graduates", user.uid);
        const gradSnap = await getDoc(gradRef);
        if (!gradSnap.exists()) return;

        const gradSkills = gradSnap.data().skills || [];
        setUserSkills(gradSkills);

        // 2. Fetch all jobs
        const jobsRef = collection(db, "jobs");
        const jobSnap = await getDocs(jobsRef);

        const matches: Job[] = [];

        jobSnap.forEach((doc) => {
          const jobData = doc.data();
          const requiredSkills = jobData.requiredSkills || [];

          const gradSkillsLower = gradSkills.map((s: string) =>
            s.toLowerCase(),
          );
          const isMatch = requiredSkills.some((skill: string) =>
            gradSkillsLower.includes(skill.toLowerCase()),
          );

          if (isMatch) {
            const matchPercentage = calculateMatchPercentage(
              requiredSkills,
              gradSkills,
            );
            matches.push({
              id: doc.id,
              title: jobData.title || jobData.jobTitle,
              description: jobData.description || jobData.jobDescription,
              requiredSkills: jobData.requiredSkills,
              companyName: jobData.companyName || "Company Name",
              location: jobData.location || "Location not specified",
              jobType: jobData.jobType || "Full-time",
              salary: jobData.salary || "Competitive",
              deadline: jobData.deadline,
              matchPercentage,
            });
          }
        });

        // Sort by match percentage (highest first)
        matches.sort(
          (a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0),
        );
        setMatchingJobs(matches);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
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
      const gradSnap = await getDocs(gradRef);
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
        jobTitle: selectedJob.title,
        motivation,
        status: "pending",
        createdAt: serverTimestamp(),
        cvUrl,
      });

      closeModal();
      alert("Application submitted successfully!");
      // Remove the applied job from the list
      setMatchingJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
    } catch (error) {
      console.error("Error applying for job:", error);
      alert("Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const getMatchClass = (percentage: number): string => {
    if (percentage >= 80) return "match-excellent";
    if (percentage >= 60) return "match-good";
    if (percentage >= 40) return "match-fair";
    return "match-low";
  };

  if (loading) {
    return (
      <div className="job-matching-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p className="loading-text">Finding jobs that match your skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-matching-page">
      <div className="page-header">
        <div className="page-header-content">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="header-info">
            <h1 className="page-title">Jobs Matching Your Skills</h1>
            <p className="page-subtitle">
              We found {matchingJobs.length} job
              {matchingJobs.length !== 1 ? "s" : ""} that match your profile
            </p>
          </div>
        </div>
      </div>

      <div className="job-matching-container">
        {/* User Skills Display */}
        {userSkills.length > 0 && (
          <div className="skills-summary">
            <h3 className="skills-title">Your Skills:</h3>
            <div className="skills-container">
              {userSkills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Jobs List */}
        {matchingJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 10 2 10 2 9 2.54 8.5 3.34l-.5.68-.5-.67C7.18 2.54 6.22 2 5.5 2 4.67 2 4 2.67 4 3.5c0 .35.07.69.18 1H2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <h3 className="empty-title">No Matching Jobs Found</h3>
            <p className="empty-text">
              We couldn't find any jobs that match your current skills. Try
              updating your profile or adding more skills to increase your
              matches.
            </p>
            <Link to="/graduate/profile" className="btn-primary">
              Update Profile
            </Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {matchingJobs.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <div className="job-title-section">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="company-name">{job.companyName}</p>
                  </div>
                  <div
                    className={`match-badge ${getMatchClass(job.matchPercentage || 0)}`}
                  >
                    {job.matchPercentage}% Match
                  </div>
                </div>

                <div className="job-meta">
                  <div className="job-meta-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {job.location}
                  </div>
                  <div className="job-meta-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 10 2 10 2 9 2.54 8.5 3.34l-.5.68-.5-.67C7.18 2.54 6.22 2 5.5 2 4.67 2 4 2.67 4 3.5c0 .35.07.69.18 1H2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                    </svg>
                    {job.jobType}
                  </div>
                  <div className="job-meta-item">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                    </svg>
                    {job.salary}
                  </div>
                </div>

                <div className="job-description">
                  <p>{job.description}</p>
                </div>

                <div className="required-skills">
                  <h4 className="skills-title">Required Skills:</h4>
                  <div className="skills-container">
                    {job.requiredSkills.map((skill, index) => {
                      const isMatched = userSkills.some(
                        (userSkill) =>
                          userSkill.toLowerCase() === skill.toLowerCase(),
                      );
                      return (
                        <span
                          key={index}
                          className={`skill-tag ${isMatched ? "skill-matched" : "skill-required"}`}
                        >
                          {skill}
                          {isMatched && (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            </svg>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="job-actions">
                  <button
                    className="btn-apply"
                    onClick={() => handleApply(job)}
                    disabled={applyingJobId === job.id}
                  >
                    {applyingJobId === job.id ? (
                      <>
                        <div className="btn-spinner" />
                        Applying...
                      </>
                    ) : (
                      "Apply Now"
                    )}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      navigate(`/job-details/${job.id}`, { state: { job } })
                    }
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatchingFeed;
