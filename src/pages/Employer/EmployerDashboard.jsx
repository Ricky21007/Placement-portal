import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EmployerDashboard.module.css';
import { FaPlus, FaBriefcase, FaUsers, FaUserEdit, FaSignOutAlt } from 'react-icons/fa';
 
const EmployerDashboard = () => {
  const navigate = useNavigate();
 
  const [employerName, setEmployerName] = useState('Mkhuseli Mditshwa');
  const [activeJobs, setActiveJobs] = useState(0);
  const [applicants, setApplicants] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
 
  useEffect(() => {
    // Simulate fetching data from an API
    const fetchData = () => {
      // Mock data
      setEmployerName('Mkhuseli Mditshwa');
      setActiveJobs(5);
      setApplicants(23);
      setInterviews(7);
      setRecentActivity([
        'Job "Software Engineer" posted',
        '3 new applicants for "Product Manager"',
        'Interview scheduled with John Doe',
        'Profile updated',
      ]);
    };
 
    fetchData();
  }, []);
 
  const handleLogout = () => {
    // Clear any authentication tokens or session data here
    localStorage.clear();
    sessionStorage.clear();
    // Redirect to employer login page
    navigate('/login/employer');
  };
 
  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.container}>
        <button className={styles.logoutButton} onClick={handleLogout} aria-label="Logout">
          <FaSignOutAlt />
        </button>
        <div className={styles.header}>
          <h2>Employer Portal</h2>
          <p>
            Welcome back, {employerName} <span role="img" aria-label="wave">👋</span>
          </p>
        </div>
 
      <div className={styles.buttonGrid}>
        <button className={styles.button} onClick={() => navigate('/employer/post-job')}>
          <FaPlus className={styles.icon} /> Post Job
        </button>
        <button className={styles.button} onClick={() => navigate('/employer/view-jobs')}>
          <FaBriefcase className={styles.icon} /> View Jobs
        </button>
        <button className={styles.button} onClick={() => navigate('/employer/applicants')}>
          <FaUsers className={styles.icon} /> Applicants
        </button>
        <button className={styles.button} onClick={() => navigate('/employer/edit-profile')}>
          <FaUserEdit className={styles.icon} /> Edit Profile
        </button>
      </div>
 
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{activeJobs}</div>
          <div className={styles.statLabel}>Active Jobs</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{applicants}</div>
          <div className={styles.statLabel}>Applicants</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{interviews}</div>
          <div className={styles.statLabel}>Interviews</div>
        </div>
      </div>
 
      <div className={styles.recentActivity}>
        <h3>Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p>No job activity yet.</p>
        ) : (
          <ul>
            {recentActivity.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
  );
};
 
export default EmployerDashboard;
 
 