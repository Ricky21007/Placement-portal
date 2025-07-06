import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/ManageUsers.css";

interface MetricsSummary {
  totalApplications: number;
  totalInterviews: number;
  totalAccepted: number;
  totalRejected: number;
  totalNotifications: number;
}

const EmployerMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsSummary>({
    totalApplications: 0,
    totalInterviews: 0,
    totalAccepted: 0,
    totalRejected: 0,
    totalNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch total applications
        const applicationsSnapshot = await getDocs(collection(db, "applications"));
        const totalApplications = applicationsSnapshot.size;

        // Fetch total interviews
        const interviewsSnapshot = await getDocs(collection(db, "interviews"));
        const totalInterviews = interviewsSnapshot.size;

        // Fetch total accepted and rejected from notifications (assuming message contains acceptance/rejection)
        const notificationsSnapshot = await getDocs(collection(db, "notifications"));
        let totalAccepted = 0;
        let totalRejected = 0;
        notificationsSnapshot.forEach(doc => {
          const data = doc.data();
          const message = data.message?.toLowerCase() || "";
          if (message.includes("accepted")) totalAccepted++;
          if (message.includes("rejected")) totalRejected++;
        });
        const totalNotifications = notificationsSnapshot.size;

        setMetrics({
          totalApplications,
          totalInterviews,
          totalAccepted,
          totalRejected,
          totalNotifications,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="manage-users-container" style={{ marginLeft: "260px", backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}><h2>Loading Employer Metrics...</h2></div>;
  }

  return (
    <div className="manage-users-container" style={{ marginLeft: "260px", backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}>
      <h1>Employer Metrics Summary</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Total Applications</th>
            <th>Total Interviews</th>
            <th>Total Accepted</th>
            <th>Total Notifications</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ backgroundColor: "white" }}>
            <td>{metrics.totalApplications}</td>
            <td>{metrics.totalInterviews}</td>
            <td>{metrics.totalAccepted}</td>
            <td>{metrics.totalNotifications}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EmployerMetrics;
