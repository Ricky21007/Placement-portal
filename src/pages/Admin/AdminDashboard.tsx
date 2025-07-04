import React, { useEffect, useState } from "react";
import "../../styles/AdminDashboard.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
 
const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalGraduates: 0,
    activeEmployers: 0,
    jobsPosted: 0,
    placementsThisMonth: 0,
    interviewVolume: 0,
  });
 
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const graduatesSnapshot = await getDocs(collection(db, "graduates"));
        const employersSnapshot = await getDocs(collection(db, "employers"));
        const jobsSnapshot = await getDocs(collection(db, "jobs"));
        const placementsSnapshot = await getDocs(collection(db, "placements"));
 
        // For interview volume, assuming a collection "interviews"
        const interviewsSnapshot = await getDocs(collection(db, "interviews"));
 
        // For placements this month, filter by timestamp field "placedAt" in current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const placementsThisMonthQuery = query(
          collection(db, "placements"),
          where("placedAt", ">=", startOfMonth)
        );
        const placementsThisMonthSnapshot = await getDocs(placementsThisMonthQuery);
 
        setMetrics({
          totalGraduates: graduatesSnapshot.size,
          activeEmployers: employersSnapshot.size,
          jobsPosted: jobsSnapshot.size,
          placementsThisMonth: placementsThisMonthSnapshot.size,
          interviewVolume: interviewsSnapshot.size,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };
 
    fetchMetrics();
  }, []);
 
  return (
    <div className="admin-dashboard-container admin-main-content" style={{ padding: "1rem" }}>
      <h1>Admin Dashboard</h1>
      <div className="metrics-grid">
        <div className="metric-card">
          <h2>{metrics.totalGraduates}</h2>
          <p>Total Graduates</p>
        </div>
        <div className="metric-card">
          <h2>{metrics.activeEmployers}</h2>
          <p>Active Employers</p>
        </div>
        <div className="metric-card">
          <h2>{metrics.jobsPosted}</h2>
          <p>Jobs Posted</p>
        </div>
        <div className="metric-card">
          <h2>{metrics.placementsThisMonth}</h2>
          <p>Placements This Month</p>
        </div>
        <div className="metric-card">
          <h2>{metrics.interviewVolume}</h2>
          <p>Interview Volume</p>
        </div>
      </div>
    </div>
  );
};
 
export default AdminDashboard;
 