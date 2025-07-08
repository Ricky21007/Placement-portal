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
    <div className={styles.container}>
      <Link to="/employer/dashboard" className={styles.backToDashboardBtn}>
        ← Back to Dashboard
      </Link>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Post a New Job</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            className={styles.formInput}
            disabled={loading}
          />
          <textarea
            placeholder="Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            rows={4}
            className={styles.formTextarea}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className={styles.formInput}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Job Type (e.g., Full-time, Remote)"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
            className={styles.formInput}
            disabled={loading}
          />

          {/* Skills Section */}
          <div className={styles.skillsWrapper}>
            <div className={styles.skillsHeader}>
              <button
                type="button"
                className={styles.addSkillButton}
                onClick={handleAddSkill}
                disabled={loading}
                title="Add another skill"
              >
                + Add Skill
              </button>
              <label className={styles.skillsLabel}>Required Skills</label>
            </div>
            {skills.map((skill, index) => (
              <div className={styles.skillRow} key={index}>
                <input
                  type="text"
                  className={styles.formInput}
                  value={skill}
                  onChange={(e) => handleSkillChange(index, e.target.value)}
                  placeholder={`Skill #${index + 1}`}
                  disabled={loading}
                />
                {skills.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeSkillButton}
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
          <input
            type="text"
            placeholder="Salary"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
            className={styles.formInput}
            disabled={loading}
          />
          <input
            type="date"
            placeholder="Select Deadline Date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className={styles.formDate}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Posting..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
};

export { PostJob };
