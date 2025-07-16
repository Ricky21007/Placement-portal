import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/PlacementTracker.css";

interface Graduate {
  id: string;
  fullName: string;
  stream: string;
  cohort: string;
}

interface Application {
  id: string;
  graduateId: string;
  jobId: string;
  status: string;
}

interface Job {
  id: string;
  companyName: string;
  jobTitle: string;
}

interface PlacementData {
  id: string;
  fullName: string;
  stream: string;
  cohort: string;
  jobTitle: string;
  companyName: string;
  status: string;
  placed: string;
}

const PlacementTracker: React.FC = () => {
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobsMap, setJobsMap] = useState<Map<string, Job>>(new Map());
  const [placementData, setPlacementData] = useState<PlacementData[]>([]);
  const [filters, setFilters] = useState({
    stream: "",
    companyName: "",
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<PlacementData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch graduates
        const gradsSnapshot = await getDocs(collection(db, "graduates"));
        const gradsData: Graduate[] = gradsSnapshot.docs.map((doc) => ({
          id: doc.id,
          fullName: doc.data().fullName || "N/A",
          stream: doc.data().stream || "N/A",
          cohort: doc.data().cohort || "N/A",
        }));
        setGraduates(gradsData);

        // Fetch applications
        const appsSnapshot = await getDocs(collection(db, "applications"));
        const appsData: Application[] = appsSnapshot.docs.map((doc) => ({
          id: doc.id,
          graduateId: doc.data().graduateId,
          jobId: doc.data().jobId,
          status: doc.data().status || "pending",
        }));
        setApplications(appsData);

        // Fetch jobs and employers
        const jobsSnapshot = await getDocs(collection(db, "jobs"));
        const employersSnapshot = await getDocs(
          collection(db, "employersignup"),
        );

        // Create employers map
        const employersMap = new Map();
        employersSnapshot.docs.forEach((doc) => {
          employersMap.set(doc.id, doc.data());
        });

        const jobsMapTemp = new Map<string, Job>();
        jobsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Get company name from employers collection
          const employerData = employersMap.get(data.employerId);
          const companyName = employerData?.companyName || "N/A";

          console.log("Job doc id:", doc.id, "companyName:", companyName);
          jobsMapTemp.set(doc.id, {
            id: doc.id,
            companyName,
            jobTitle: data.jobTitle || "N/A",
          });
        });
        setJobsMap(jobsMapTemp);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Join graduates with applications and jobs
    const data: PlacementData[] = [];

    graduates.forEach((grad) => {
      // Find applications for this graduate
      const gradApps = applications.filter((app) => app.graduateId === grad.id);
      if (gradApps.length === 0) {
        // No application, still show graduate with empty company and status
        data.push({
          id: grad.id,
          fullName: grad.fullName,
          stream: grad.stream,
          cohort: grad.cohort,
          jobTitle: "N/A",
          companyName: "N/A",
          status: "No Application",
          placed: "No",
        });
      } else {
        gradApps.forEach((app) => {
          const job = jobsMap.get(app.jobId);
          data.push({
            id: grad.id,
            fullName: grad.fullName,
            stream: grad.stream,
            cohort: grad.cohort,
            jobTitle: job ? job.jobTitle : "N/A",
            companyName: job ? job.companyName : "N/A",
            status: app.status,
            placed: app.status.toLowerCase() === "accepted" ? "Yes" : "No",
          });
        });
      }
    });

    setPlacementData(data);
  }, [graduates, applications, jobsMap]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredData = placementData.filter((item) => {
    return (
      (filters.stream === "" || item.stream === filters.stream) &&
      (filters.companyName === "" || item.companyName === filters.companyName)
    );
  });

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleEdit = (item: PlacementData, index: number) => {
    setEditingRow(`${item.id}-${index}`);
    setEditData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const handleSaveEdit = async () => {
    if (!editData) return;

    try {
      // Update graduate data
      const gradRef = doc(db, "graduates", editData.id);
      await updateDoc(gradRef, {
        fullName: editData.fullName,
        stream: editData.stream,
        cohort: editData.cohort,
      });

      // Find and update application if exists
      const app = applications.find((app) => app.graduateId === editData.id);
      if (app) {
        const appRef = doc(db, "applications", app.id);
        await updateDoc(appRef, {
          status: editData.status,
        });
      }

      // Refresh data
      window.location.reload();

      setEditingRow(null);
      setEditData(null);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Failed to update data.");
    }
  };

  const handleDelete = async (item: PlacementData) => {
    if (
      !confirm(
        `Are you sure you want to remove ${item.fullName} from the placement tracker? This will delete their graduate record and all associated applications.`,
      )
    ) {
      return;
    }

    try {
      // Find and delete applications for this graduate
      const gradApps = applications.filter((app) => app.graduateId === item.id);
      for (const app of gradApps) {
        await deleteDoc(doc(db, "applications", app.id));
      }

      // Delete any interviews for this graduate
      const interviewsQuery = query(
        collection(db, "interviews"),
        where("graduateId", "==", item.id),
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      for (const interviewDoc of interviewsSnapshot.docs) {
        await deleteDoc(interviewDoc.ref);
      }

      // Delete any placements for this graduate
      const placementsQuery = query(
        collection(db, "placements"),
        where("graduateId", "==", item.id),
      );
      const placementsSnapshot = await getDocs(placementsQuery);
      for (const placementDoc of placementsSnapshot.docs) {
        await deleteDoc(placementDoc.ref);
      }

      // Delete the graduate record itself
      await deleteDoc(doc(db, "graduates", item.id));

      // Update local state immediately to reflect the deletion
      setGraduates((prev) => prev.filter((grad) => grad.id !== item.id));
      setApplications((prev) =>
        prev.filter((app) => app.graduateId !== item.id),
      );
      setPlacementData((prev) => prev.filter((data) => data.id !== item.id));

      alert("Graduate removed from placement tracker successfully!");
    } catch (error) {
      console.error("Error deleting data:", error);
      alert("Failed to remove graduate from placement tracker.");
    }
  };

  const handleEditDataChange = (field: keyof PlacementData, value: string) => {
    if (editData) {
      setEditData({
        ...editData,
        [field]: value,
      });
    }
  };

  // Extract unique filter options
  const streams = Array.from(new Set(graduates.map((g) => g.stream)));
  const cohorts = Array.from(new Set(graduates.map((g) => g.cohort)));
  const companies = Array.from(
    new Set(placementData.map((d) => d.companyName)),
  );

  return (
    <div className="placement-tracker-container">
      <h1>Graduate Placement Tracker</h1>
      <div className="filters">
        <select
          name="stream"
          value={filters.stream}
          onChange={handleFilterChange}
        >
          <option value="">All Streams</option>
          {streams.map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>
        {/* Removed cohort filter */}
        <select
          name="companyName"
          value={filters.companyName}
          onChange={handleFilterChange}
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>
      <table className="placement-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Stream</th>
            {/* Removed Cohort header */}
            <th>Job Title</th>
            <th>Company</th>
            <th>Status</th>
            <th>Placed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <React.Fragment key={`${item.id}-${index}`}>
              <tr
                style={{
                  cursor:
                    editingRow === `${item.id}-${index}`
                      ? "default"
                      : "pointer",
                }}
              >
                {editingRow === `${item.id}-${index}` ? (
                  // Edit mode
                  <>
                    <td>
                      <input
                        type="text"
                        value={editData?.fullName || ""}
                        onChange={(e) =>
                          handleEditDataChange("fullName", e.target.value)
                        }
                        style={{ width: "100%", padding: "4px" }}
                      />
                    </td>
                    <td>
                      <select
                        value={editData?.stream || ""}
                        onChange={(e) =>
                          handleEditDataChange("stream", e.target.value)
                        }
                        style={{ width: "100%", padding: "4px" }}
                      >
                        <option value="">Select Stream</option>
                        <option value="Software Development">
                          Software Development
                        </option>
                        <option value="Full Stack Development">
                          Full Stack Development
                        </option>
                        <option value="Data Science">Data Science</option>
                        <option value="Data Analytics">Data Analytics</option>
                        <option value="IT Support">IT Support</option>
                        <option value="Artificial Intelligence">
                          Artificial Intelligence
                        </option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Mobile Development">
                          Mobile Development
                        </option>
                        <option value="UI/UX Design">UI/UX Design</option>
                      </select>
                    </td>
                    <td>{item.jobTitle}</td>
                    <td>{item.companyName}</td>
                    <td>
                      <select
                        value={editData?.status || ""}
                        onChange={(e) =>
                          handleEditDataChange("status", e.target.value)
                        }
                        style={{ width: "100%", padding: "4px" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="No Application">No Application</option>
                      </select>
                    </td>
                    <td>{editData?.status === "accepted" ? "Yes" : "No"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={handleSaveEdit}
                          style={{
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  // View mode
                  <>
                    <td
                      onClick={() => toggleRow(`${item.id}-${index}`)}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {item.fullName}
                    </td>
                    <td
                      onClick={() => toggleRow(`${item.id}-${index}`)}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {item.stream}
                    </td>
                    <td
                      onClick={() => toggleRow(`${item.id}-${index}`)}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {item.jobTitle}
                    </td>
                    <td
                      onClick={() => toggleRow(`${item.id}-${index}`)}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {item.companyName}
                    </td>
                    <td
                      onClick={() => toggleRow(`${item.id}-${index}`)}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {item.status}
                    </td>
                    <td
                      onClick={() => toggleRow(`${item.id}-${index}`)}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "150px",
                      }}
                    >
                      {item.placed}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          onClick={() => handleEdit(item, index)}
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          style={{
                            background: "#dc2626",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
              {expandedRows.has(`${item.id}-${index}`) &&
                editingRow !== `${item.id}-${index}` && (
                  <tr className="expanded-row">
                    <td colSpan={7} style={{ whiteSpace: "normal" }}>
                      <strong>Full Stream:</strong> {item.stream} <br />
                      <strong>Job Title:</strong> {item.jobTitle} <br />
                      <strong>Full Company Name:</strong> {item.companyName}{" "}
                      <br />
                      <strong>Full Status:</strong> {item.status} <br />
                      <strong>Placed:</strong> {item.placed}
                    </td>
                  </tr>
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlacementTracker;
