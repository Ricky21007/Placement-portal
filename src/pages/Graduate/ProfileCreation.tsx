import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../../styles/ProfileCreation.css";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

export const ProfileCreation = ({ user }: { user?: any }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    location: "",
    skills: [],
    experience: "",
    education: "",
    summary: "",
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (
      currentSkill.trim() &&
      !profileData.skills.includes(currentSkill.trim())
    ) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }));
      setCurrentSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Navigate to dashboard or show success message
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h3 className="step-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter your first name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter your last name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group form-group-full">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Enter your city/location"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h3 className="step-title">Profile Picture & Summary</h3>
            <div className="profile-picture-section">
              <div
                className="profile-picture-wrapper"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="profile-picture">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
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
                      <span>Click to upload photo</span>
                    </div>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Professional Summary</label>
              <textarea
                className="form-textarea"
                value={profileData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="Write a brief summary about yourself, your career goals, and what makes you unique..."
                rows={5}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h3 className="step-title">Skills & Experience</h3>
            <div className="form-group">
              <label className="form-label">Skills</label>
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
                {profileData.skills.map((skill, index) => (
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
            </div>
            <div className="form-group">
              <label className="form-label">Experience</label>
              <textarea
                className="form-textarea"
                value={profileData.experience}
                onChange={(e) =>
                  handleInputChange("experience", e.target.value)
                }
                placeholder="Describe your work experience, internships, projects..."
                rows={4}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h3 className="step-title">Education & Review</h3>
            <div className="form-group">
              <label className="form-label">Education</label>
              <textarea
                className="form-textarea"
                value={profileData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="List your educational qualifications, certifications, courses..."
                rows={4}
              />
            </div>
            <div className="profile-preview">
              <h4 className="preview-title">Profile Preview</h4>
              <div className="preview-content">
                <p>
                  <strong>Name:</strong> {profileData.firstName}{" "}
                  {profileData.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {profileData.email}
                </p>
                <p>
                  <strong>Location:</strong> {profileData.location}
                </p>
                <p>
                  <strong>Skills:</strong> {profileData.skills.join(", ")}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-creation-page">
      <div className="profile-creation-container">
        {/* Header */}
        <div className="page-header">
          <Link to="/graduate/dashboard" className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="page-title">Create Your Profile</h1>
          <p className="page-subtitle">
            Let's build your professional profile to get you noticed by
            employers
          </p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Form Content */}
        <div className="form-container">{renderStep()}</div>

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrevStep}
            >
              Previous
            </button>
          )}
          <div className="nav-spacer" />
          {currentStep < totalSteps ? (
            <button
              type="button"
              className="btn-primary"
              onClick={handleNextStep}
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating Profile..." : "Complete Profile"}
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p className="loading-text">Creating your profile...</p>
        </div>
      )}
    </div>
  );
};
