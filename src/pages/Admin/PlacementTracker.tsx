import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/PlacementTracker.css";

const graduatesData = [
  {
    id: 1,
    name: "Alice Johnson",
    skillset: "JavaScript",
    cohort: "2023",
    employer: "TechCorp",
    status: "Placed",
  },
  {
    id: 2,
    name: "Bob Smith",
    skillset: "Python",
    cohort: "2022",
    employer: "InnovateX",
    status: "Interviewing",
  },
  {
    id: 3,
    name: "Carol Lee",
    skillset: "Java",
    cohort: "2023",
    employer: "TechCorp",
    status: "Not Placed",
  },
  // Add more sample data as needed
];

const PlacementTracker = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    skillset: "",
    cohort: "",
    employer: "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredGraduates = graduatesData.filter((grad) => {
    return (
      (filters.skillset === "" || grad.skillset === filters.skillset) &&
      (filters.cohort === "" || grad.cohort === filters.cohort) &&
      (filters.employer === "" || grad.employer === filters.employer)
    );
  });

  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,Name,Skillset,Cohort,Employer,Status"]
        .concat(
          filteredGraduates.map(
            (g) =>
              `${g.id},${g.name},${g.skillset},${g.cohort},${g.employer},${g.status}`,
          ),
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "placement_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const skillsets = Array.from(new Set(graduatesData.map((g) => g.skillset)));
  const cohorts = Array.from(new Set(graduatesData.map((g) => g.cohort)));
  const employers = Array.from(new Set(graduatesData.map((g) => g.employer)));

  return (
    <div className="placement-tracker-container">
      <button
        className="back-button"
        onClick={() => navigate("/admin-dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h1>Graduate Placement Tracker</h1>
      <div className="filters">
        <select
          name="skillset"
          value={filters.skillset}
          onChange={handleFilterChange}
        >
          <option value="">All Skillsets</option>
          {skillsets.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>
        <select
          name="cohort"
          value={filters.cohort}
          onChange={handleFilterChange}
        >
          <option value="">All Cohorts</option>
          {cohorts.map((cohort) => (
            <option key={cohort} value={cohort}>
              {cohort}
            </option>
          ))}
        </select>
        <select
          name="employer"
          value={filters.employer}
          onChange={handleFilterChange}
        >
          <option value="">All Employers</option>
          {employers.map((emp) => (
            <option key={emp} value={emp}>
              {emp}
            </option>
          ))}
        </select>
        <button onClick={exportData} className="export-button">
          Export Data
        </button>
      </div>
      <div className="table-container">
        <table className="placement-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Skillset</th>
              <th>Cohort</th>
              <th>Employer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredGraduates.map((grad) => (
              <tr key={grad.id}>
                <td>{grad.id}</td>
                <td>{grad.name}</td>
                <td>{grad.skillset}</td>
                <td>{grad.cohort}</td>
                <td>{grad.employer}</td>
                <td>{grad.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlacementTracker;
