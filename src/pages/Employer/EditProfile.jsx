import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import styles from './EditProfile.module.css';
 
const EditProfile = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          alert('You must be logged in to view profile.');
          setLoading(false);
          return;
        }
        console.log('Fetching profile for UID:', user.uid);
        const profileRef = doc(db, 'employersignup', user.uid);
        const profileSnap = await getDoc(profileRef);
        console.log('Profile document exists:', profileSnap.exists());
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setCompanyName(data.companyName || '');
          setCompanyEmail(data.email || '');
          setCompanyPhone(data.phone || '');
          setCompanyWebsite(data.website || '');
          setCompanyDescription(data.companyDescription || '');
        } else {
          console.log('No profile data found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to load profile data.');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);
 
  const validate = () => {
    const newErrors = {};
    if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!companyEmail.trim()) newErrors.companyEmail = 'Company Email is required';
    else if (!/\S+@\S+\.\S+/.test(companyEmail)) newErrors.companyEmail = 'Email is invalid';
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
        alert('You must be logged in to update profile.');
        setLoading(false);
        return;
      }
      const profileRef = doc(db, 'employersignup', user.uid);
      await setDoc(profileRef, {
        companyName,
        email: companyEmail,
        phone: companyPhone,
        website: companyWebsite,
        companyDescription,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
    setLoading(false);
  };
 
  return (
    <>
      <button
        className={styles.backButton}
        onClick={() => navigate("/employer/dashboard")}
      >
        ← Back to Dashboard
      </button>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <h2 className={styles.title}>Edit Company Profile</h2>
            <label htmlFor="companyName">
              Company Name
              <input
                id="companyName"
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
                className={styles.formInput}
                aria-invalid={errors.companyName ? "true" : "false"}
                aria-describedby="companyName-error"
              />
              {errors.companyName && (
                <span id="companyName-error" className={styles.error}>
                  {errors.companyName}
                </span>
              )}
            </label>
            <label htmlFor="companyEmail">
              Company Email
              <input
                id="companyEmail"
                type="email"
                placeholder="Company Email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                required
                disabled={loading}
                className={styles.formInput}
                aria-invalid={errors.companyEmail ? "true" : "false"}
                aria-describedby="companyEmail-error"
              />
              {errors.companyEmail && (
                <span id="companyEmail-error" className={styles.error}>
                  {errors.companyEmail}
                </span>
              )}
            </label>
            <label htmlFor="companyPhone">
              Company Phone
              <input
                id="companyPhone"
                type="tel"
                placeholder="Company Phone"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                disabled={loading}
                className={styles.formInput}
              />
            </label>
            <label htmlFor="companyWebsite">
              Company Website
              <input
                id="companyWebsite"
                type="url"
                placeholder="Company Website"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                disabled={loading}
                className={styles.formInput}
              />
            </label>
            <label htmlFor="companyDescription">
              Company Description
              <textarea
                id="companyDescription"
                placeholder="Company Description"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                rows={4}
                disabled={loading}
                className={styles.formTextarea}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
 
export default EditProfile;