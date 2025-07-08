import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/UnifiedEmployer.css";
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const PostJob = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState([""]);
  const [loading, setLoading] = useState(false);

  const handleSkillChange = (index, value) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = value;
    setSkills(updatedSkills);
  };

  const handleAddSkill = () => {
    setSkills([...skills, ""]);
  };

  const handleRemoveSkill = (index) => {
    if (skills.length === 1) return;
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "jobs"), {
        jobTitle,
        jobDescription,
        location,
        jobType,
        salary,
        deadline,
        requiredSkills: skills.filter((skill) => skill.trim() !== ""),
        employerId: user ? user.uid : null,
        createdAt: serverTimestamp(),
      });
      alert("Job posted successfully!");
      setJobTitle("");
      setJobDescription("");
      setLocation("");
      setJobType("");
      setSalary("");
      setDeadline("");
      setSkills([""]);
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="employer-page">
      <div className="employer-container">
        <Link to="/employer/dashboard" className="employer-back-button">
          ← Back to Dashboard
        </Link>

        <div className="employer-header">
          <h1 className="employer-title">Post a New Job</h1>
          <p className="employer-subtitle">
            Create an opportunity for talented graduates
          </p>
        </div>

        <div className="employer-form-container">
          <form onSubmit={handleSubmit} className="employer-form">
            <div className="employer-form-group">
              <label className="employer-form-label">Job Title *</label>
              <input
                type="text"
                placeholder="e.g., Frontend Developer, Marketing Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                className="employer-form-input"
                disabled={loading}
              />
            </div>

            <div className="employer-form-group">
              <label className="employer-form-label">Job Description *</label>
              <textarea
                placeholder="Describe the role, responsibilities, and requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                rows={5}
                className="employer-form-textarea"
                disabled={loading}
              />
            </div>

            <div className="employer-form-group">
              <label className="employer-form-label">Location *</label>
              <input
                type="text"
                placeholder="e.g., Cape Town, Remote, Hybrid"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="employer-form-input"
                disabled={loading}
              />
            </div>

            <div className="employer-form-group">
              <label className="employer-form-label">Job Type *</label>
              <input
                type="text"
                placeholder="e.g., Full-time, Part-time, Contract, Internship"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                required
                className="employer-form-input"
                disabled={loading}
              />
            </div>

            <div className="employer-skills-wrapper">
              <div className="employer-skills-header">
                <label className="employer-skills-label">Required Skills</label>
                <button
                  type="button"
                  className="employer-add-skill-button"
                  onClick={handleAddSkill}
                  disabled={loading}
                  title="Add another skill"
                >
                  + Add Skill
                </button>
              </div>
              {skills.map((skill, index) => (
                <div className="employer-skill-row" key={index}>
                  <input
                    type="text"
                    className="employer-form-input"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder={`Skill #${index + 1} (e.g., React, Python, Project Management)`}
                    disabled={loading}
                  />
                  {skills.length > 1 && (
                    <button
                      type="button"
                      className="employer-remove-skill-button"
                      onClick={() => handleRemoveSkill(index)}
                      disabled={loading}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="employer-form-group">
              <label className="employer-form-label">Salary *</label>
              <input
                type="text"
                placeholder="e.g., R25,000 - R35,000 per month, Competitive"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                required
                className="employer-form-input"
                disabled={loading}
              />
            </div>

            <div className="employer-form-group">
              <label className="employer-form-label">
                Application Deadline *
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="employer-form-input"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="employer-submit-button"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export { PostJob };
