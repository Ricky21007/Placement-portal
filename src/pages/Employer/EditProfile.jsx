import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/UnifiedEmployer.css";

const EditProfile = () => {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to view profile.");
          setLoading(false);
          return;
        }
        console.log("Fetching profile for UID:", user.uid);
        const profileRef = doc(db, "employersignup", user.uid);
        const profileSnap = await getDoc(profileRef);
        console.log("Profile document exists:", profileSnap.exists());
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setCompanyName(data.companyName || "");
          setCompanyEmail(data.email || "");
          setCompanyPhone(data.phone || "");
          setCompanyWebsite(data.website || "");
          setCompanyDescription(data.companyDescription || "");
        } else {
          console.log("No profile data found");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("Failed to load profile data.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!companyEmail.trim())
      newErrors.companyEmail = "Company Email is required";
    else if (!/\S+@\S+\.\S+/.test(companyEmail))
      newErrors.companyEmail = "Email is invalid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to update profile.");
        setLoading(false);
        return;
      }
      const profileRef = doc(db, "employersignup", user.uid);
      await setDoc(profileRef, {
        companyName,
        email: companyEmail,
        phone: companyPhone,
        website: companyWebsite,
        companyDescription,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="employer-page">
      <div className="employer-container">
        <button
          className="employer-back-button"
          onClick={() => navigate("/employer/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <div className="employer-header">
          <h1 className="employer-title">Edit Company Profile</h1>
          <p className="employer-subtitle">Update your company information</p>
        </div>

        <div className="employer-form-container">
          <form onSubmit={handleSubmit} className="employer-form" noValidate>
            <div className="employer-form-group">
              <label htmlFor="companyName" className="employer-form-label">
                Company Name *
              </label>
              <input
                id="companyName"
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
                className="employer-form-input"
                aria-invalid={errors.companyName ? "true" : "false"}
                aria-describedby="companyName-error"
              />
              {errors.companyName && (
                <span id="companyName-error" className="employer-error">
                  {errors.companyName}
                </span>
              )}
            </div>

            <div className="employer-form-group">
              <label htmlFor="companyEmail" className="employer-form-label">
                Company Email *
              </label>
              <input
                id="companyEmail"
                type="email"
                placeholder="Company Email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                required
                disabled={loading}
                className="employer-form-input"
                aria-invalid={errors.companyEmail ? "true" : "false"}
                aria-describedby="companyEmail-error"
              />
              {errors.companyEmail && (
                <span id="companyEmail-error" className="employer-error">
                  {errors.companyEmail}
                </span>
              )}
            </div>

            <div className="employer-form-group">
              <label htmlFor="companyPhone" className="employer-form-label">
                Company Phone
              </label>
              <input
                id="companyPhone"
                type="tel"
                placeholder="Company Phone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                disabled={loading}
                className="employer-form-input"
              />
            </div>

            <div className="employer-form-group">
              <label htmlFor="companyWebsite" className="employer-form-label">
                Company Website
              </label>
              <input
                id="companyWebsite"
                type="url"
                placeholder="https://company-website.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                disabled={loading}
                className="employer-form-input"
              />
            </div>

            <div className="employer-form-group">
              <label
                htmlFor="companyDescription"
                className="employer-form-label"
              >
                Company Description
              </label>
              <textarea
                id="companyDescription"
                placeholder="Tell us about your company..."
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={4}
                disabled={loading}
                className="employer-form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="employer-submit-button"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
