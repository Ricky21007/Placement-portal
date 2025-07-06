import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/ManageUsers.css";

interface Graduate {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

const Graduates: React.FC = () => {
  const [graduates, setGraduates] = useState<Graduate[]>([]);

  useEffect(() => {
    const fetchGraduates = async () => {
      try {
        const snapshot = await getDocs(collection(db, "graduates"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGraduates(data);
      } catch (error) {
        console.error("Error fetching graduates:", error);
      }
    };

    fetchGraduates();
  }, []);

  if (graduates.length === 0) {
    return <div className="manage-users-container" style={{ marginLeft: "260px", marginTop: "0", marginBottom: "0", minHeight: "100vh", padding: "1rem" }}><h2>No graduates found.</h2></div>;
  }

  return (
    <div className="manage-users-container" style={{ marginLeft: "260px", marginTop: "0", marginBottom: "0", minHeight: "100vh", padding: "1rem" }}>
      <h1>Graduates</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Cellphone Number</th>
          </tr>
        </thead>
        <tbody>
          {graduates.map(grad => (
            <tr key={grad.id}>
              <td>{grad.fullName || "N/A"}</td>
              <td>{grad.email || "N/A"}</td>
              <td>{grad.phone || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Graduates;
