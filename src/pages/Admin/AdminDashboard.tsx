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
    totalNotifications: 0,
    totalApplications: 0,
    totalAccepted: 0,
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

        // Fetch total notifications
        const notificationsSnapshot = await getDocs(collection(db, "notifications"));
        const totalNotifications = notificationsSnapshot.size;

        // Fetch total applications
        const applicationsSnapshot = await getDocs(collection(db, "applications"));
        const totalApplications = applicationsSnapshot.size;

        // Calculate total accepted from notifications (assuming message contains acceptance)
        let totalAccepted = 0;
        notificationsSnapshot.forEach(doc => {
          const data = doc.data();
          const message = data.message?.toLowerCase() || "";
          if (message.includes("accepted")) totalAccepted++;
        });

        setMetrics({
          totalGraduates: graduatesSnapshot.size,
          activeEmployers: employersSnapshot.size,
          jobsPosted: jobsSnapshot.size,
          placementsThisMonth: placementsThisMonthSnapshot.size,
          interviewVolume: interviewsSnapshot.size,
          totalNotifications,
          totalApplications,
          totalAccepted,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="admin-dashboard-container" style={{ padding: "1rem", marginLeft: "140px" }}>
      <h1>Admin Dashboard</h1>
      <div className="metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
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
        <div className="metric-card">
          <h2>{metrics.totalNotifications}</h2>
          <p>Total Notifications</p>
        </div>
        <div className="metric-card">
          <h2>{metrics.totalApplications}</h2>
          <p>Total Applications</p>
        </div>
        <div className="metric-card">
          <h2>{metrics.totalAccepted}</h2>
          <p>Total Accepted</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
