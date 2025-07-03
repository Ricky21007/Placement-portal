// src/pages/GraduateProfile.tsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import "../../styles/GraduateProfile.css";

type Section =
  | "personal"
  | "contact"
  | "education"
  | "experience"
  | "skills"
  | "certifications"
  | "languages"
  | "security";

const GraduateProfile = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState<Record<Section, boolean>>({
    personal: false,
    contact: false,
    education: false,
    experience: false,
    skills: false,
    certifications: false,
    languages: false,
    security: false,
  });
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "graduates", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName || "");
        setEmail(data.email || user.email || "");
        setPhone(data.phone || "");
        setSkills(data.skills || []);
        setLocation(data.location || "");
        setCvUrl(data.cvUrl || "");
        setCvFileName(data.cvFileName || "");
        setEducation(data.education || "");
        setExperience(data.experience || "");
        setSummary(data.summary || "");
        setProfilePicUrl(data.profilePicUrl || "");
      } else {
        setEmail(user.email || "");
      }
    };
    fetchProfile();
  }, [user]);

  const toggleEditMode = (section: Section) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const cancelEdit = (section: Section) => {
    setEditMode((prev) => ({ ...prev, [section]: false }));
    // Reset values from Firebase when canceling
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, "graduates", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          setSkills(data.skills || []);
          setLocation(data.location || "");
          setEducation(data.education || "");
          setExperience(data.experience || "");
          setSummary(data.summary || "");
        }
      };
      fetchProfile();
    }
  };

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills((prev) => [...prev, currentSkill.trim()]);
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== skillToRemove));
  };

  const handleProfilePicUpload = async (file: File) => {
    if (!user) return;
    setLoading(true);

    try {
      const token = await user.getIdToken();
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });

      const filePath = `${user.uid}/profile-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get profile picture URL");

      setProfilePicUrl(publicUrl);

      await setDoc(
        doc(db, "graduates", user.uid),
        { profilePicUrl: publicUrl },
        { merge: true },
      );

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload profile picture.");
    } finally {
      setLoading(false);
    }
  };

  const handleCvUpload = async (file: File) => {
    if (!user) return;
    setLoading(true);

    try {
      const token = await user.getIdToken();
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: token,
      });

      const filePath = `${user.uid}/cv-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cv-uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("cv-uploads")
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL");

      setCvUrl(publicUrl);
      setCvFileName(file.name);

      await setDoc(
        doc(db, "graduates", user.uid),
        {
          cvUrl: publicUrl,
          cvFileName: file.name,
        },
        { merge: true },
      );

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveSection = async (section: Section) => {
    if (!user) return;
    setLoading(true);
    try {
      const docRef = doc(db, "graduates", user.uid);
      const data = {
        uid: user.uid,
        email: user.email,
        fullName,
        phone,
        location,
        skills,
        cvUrl,
        cvFileName,
        education,
        experience,
        summary,
        profilePicUrl,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(docRef, data, { merge: true });
      setProfileSaved(true);
      setEditMode((prev) => ({ ...prev, [section]: false }));
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="graduate-profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="header-title-section">
            <h1 className="profile-header-title">My Profile</h1>
            <p className="profile-header-subtitle">
              Manage your professional profile and settings
            </p>
          </div>
        </div>
      </div>

      <div className="profile-container">
        {/* Success Message */}
        {profileSaved && (
          <div className="success-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Profile updated successfully!
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              Profile Picture
            </h2>
          </div>

          <div className="profile-picture-section">
            <label
              htmlFor="profile-pic-input"
              className="profile-picture-wrapper"
            >
              <div className="profile-picture">
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt="Profile" />
                ) : (
                  <div className="profile-placeholder">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
                <div className="upload-overlay">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                  <span>Change Photo</span>
                </div>
              </div>
              <input
                id="profile-pic-input"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfilePicUpload(file);
                }}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              Personal Information
            </h2>
            <button
              className="edit-button"
              onClick={() =>
                editMode.personal
                  ? saveSection("personal")
                  : toggleEditMode("personal")
              }
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : editMode.personal ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Save
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Edit
                </>
              )}
            </button>
          </div>

          {editMode.personal ? (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">Professional Summary</label>
                <textarea
                  className="form-textarea"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a brief professional summary..."
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="info-display">
              <div className="info-item">
                <strong>Name:</strong> <span>{fullName || "Not provided"}</span>
              </div>
              <div className="info-item">
                <strong>Email:</strong> <span>{email}</span>
              </div>
              <div className="info-item">
                <strong>Phone:</strong> <span>{phone || "Not provided"}</span>
              </div>
              <div className="info-item">
                <strong>Location:</strong>{" "}
                <span>{location || "Not provided"}</span>
              </div>
              {summary && (
                <div className="info-item full-width">
                  <strong>Summary:</strong> <span>{summary}</span>
                </div>
              )}
            </div>
          )}

          {editMode.personal && (
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => cancelEdit("personal")}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                </svg>
              </div>
              Skills
            </h2>
            <button
              className="edit-button"
              onClick={() =>
                editMode.skills
                  ? saveSection("skills")
                  : toggleEditMode("skills")
              }
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : editMode.skills ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Save
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Edit
                </>
              )}
            </button>
          </div>

          {editMode.skills ? (
            <>
              <div className="skills-input-container">
                <input
                  type="text"
                  className="form-input"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Enter a skill and press Add"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddSkill())
                  }
                />
                <button
                  type="button"
                  className="add-skill-btn"
                  onClick={handleAddSkill}
                >
                  Add
                </button>
              </div>
              <div className="skills-container">
                {skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="skill-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="skills-container">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span key={index} className="skill-tag-display">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="empty-text">No skills added yet</p>
              )}
            </div>
          )}

          {editMode.skills && (
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => cancelEdit("skills")}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Experience & Education */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 10 2 10 2 9 2.54 8.5 3.34l-.5.68-.5-.67C7.18 2.54 6.22 2 5.5 2 4.67 2 4 2.67 4 3.5c0 .35.07.69.18 1H2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                </svg>
              </div>
              Experience & Education
            </h2>
            <button
              className="edit-button"
              onClick={() =>
                editMode.experience
                  ? saveSection("experience")
                  : toggleEditMode("experience")
              }
              disabled={loading}
            >
              {loading ? (
                <div className="loading-spinner" />
              ) : editMode.experience ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Save
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Edit
                </>
              )}
            </button>
          </div>

          {editMode.experience ? (
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">Experience</label>
                <textarea
                  className="form-textarea"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe your work experience, internships, projects..."
                  rows={4}
                />
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">Education</label>
                <textarea
                  className="form-textarea"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="List your educational qualifications, certifications, courses..."
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <div className="info-display">
              <div className="info-item full-width">
                <strong>Experience:</strong>
                <span>{experience || "No experience added yet"}</span>
              </div>
              <div className="info-item full-width">
                <strong>Education:</strong>
                <span>{education || "No education details added yet"}</span>
              </div>
            </div>
          )}

          {editMode.experience && (
            <div className="action-buttons">
              <button
                className="btn-secondary"
                onClick={() => cancelEdit("experience")}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* CV Upload Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2 className="section-title">
              <div className="section-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              CV / Resume
            </h2>
          </div>

          <div className="file-upload-area">
            <div className="upload-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>

            {cvUrl ? (
              <div className="file-uploaded">
                <p className="upload-text">CV Uploaded Successfully!</p>
                <p className="upload-subtext">{cvFileName}</p>
                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
                >
                  <a
                    href={cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    View CV
                  </a>
                  <label className="btn-secondary">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCvUpload(file);
                      }}
                    />
                    Upload New CV
                  </label>
                </div>
              </div>
            ) : (
              <label className="upload-label">
                <div className="upload-text">Upload your CV/Resume</div>
                <div className="upload-subtext">
                  Drag and drop or click to browse files (PDF, DOC, DOCX)
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCvUpload(file);
                  }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner-large" />
          <p className="loading-text">Processing...</p>
        </div>
      )}
    </div>
  );
};

export default GraduateProfile;
