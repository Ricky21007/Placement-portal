import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../../styles/EmployerMetrics.css";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../firebase";

interface Employer {
  id: string;
  name: string;
  jobsPosted: number;
  views: number;
  interviewsScheduled: number;
  hires: number;
}

const EmployerMetrics: React.FC = () => {
  const navigate = useNavigate();
  const [employerData, setEmployerData] = useState<Employer[]>([]);

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "employers"));
        const data: Employer[] = snapshot.docs.map((doc) => {
          const d = doc.data() as DocumentData;
          return {
            id: doc.id,
            name: d.name || "Unknown",
            jobsPosted: d.jobsPosted || 0,
            views: d.views || 0,
            interviewsScheduled: d.interviewsScheduled || 0,
            hires: d.hires || 0,
          };
        });
        setEmployerData(data);
      } catch (error) {
        console.error("Error fetching employer data:", error);
      }
    };

    fetchEmployerData();
  }, []);

  return (
    <div className="employer-metrics-container">
      <button
        className="back-button"
        onClick={() => navigate("/admin-dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h1>Employer Engagement Metrics</h1>
      <div className="table-container">
        <table className="employer-metrics-table">
          <thead>
            <tr>
              <th>Employer</th>
              <th>Jobs Posted</th>
              <th>Views</th>
              <th>Interviews Scheduled</th>
              <th>Hires</th>
            </tr>
          </thead>
          <tbody>
            {employerData.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.jobsPosted}</td>
                <td>{emp.views}</td>
                <td>{emp.interviewsScheduled}</td>
                <td>{emp.hires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerMetrics;
