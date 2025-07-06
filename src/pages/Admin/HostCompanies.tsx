import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/ManageUsers.css";

interface HostCompany {
  id: string;
  companyName?: string;
  email?: string;
  phone?: string;
  website?: string;
}

const HostCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<HostCompany[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snapshot = await getDocs(collection(db, "employersignup"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanies(data);
      } catch (error) {
        console.error("Error fetching host companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  if (companies.length === 0) {
    return <div className="manage-users-container" style={{ marginLeft: "260px", marginTop: "0", marginBottom: "0", minHeight: "100vh", padding: "1rem" }}><h2>No host companies found.</h2></div>;
  }

  return (
    <div className="manage-users-container" style={{ marginLeft: "260px", marginTop: "0", marginBottom: "0", minHeight: "100vh", padding: "1rem" }}>
      <h1>Host Companies</h1>
      <table className="users-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Website</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.id}>
              <td>{company.companyName || "N/A"}</td>
              <td>{company.email || "N/A"}</td>
              <td>{company.phone || "N/A"}</td>
              <td>{company.website || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HostCompanies;
