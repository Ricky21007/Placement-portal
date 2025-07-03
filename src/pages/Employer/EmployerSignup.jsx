import React, { useState } from 'react';
import styles from './EmployerSignup.module.css';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { deleteUser as firebaseDeleteUser } from 'firebase/auth';
import { doc, deleteDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
 
const EmployerSignup = () => {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check if user already exists and delete if so
      // This approach does not handle email already exists error properly
      // Instead, catch the error and handle it gracefully
 
      // Create user with email and password
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          // Find and delete existing user and their Firestore data
          alert('This email is already registered. Attempting to delete existing user data to allow re-signup.');
          try {
            // Firebase does not allow deleting users by email client-side directly
            // So we can only delete current logged-in user, or instruct manual deletion
            alert('Please delete the user manually from Firebase Authentication console or log in and delete your account.');
          } catch (deleteError) {
            console.error('Error deleting existing user:', deleteError);
            alert('Failed to delete existing user: ' + deleteError.message);
          }
          setLoading(false);
          return;
        } else {
          throw error;
        }
      }
      const user = userCredential.user;
 
      // Save employer details in Firestore
      await setDoc(doc(db, 'employersignup', user.uid), {
        companyName,
        email,
        phone,
        website,
        createdAt: new Date(),
      }).then(() => {
        console.log('Employer data saved successfully');
      }).catch((error) => {
        console.error('Error saving employer data:', error);
        alert('Error saving employer data: ' + error.message);
      });
 
      alert('Signup successful!');
      navigate('/employer/dashboard'); // Redirect after signup
    } catch (error) {
      console.error('Error during signup:', error);
      alert('Signup failed. Please try again.');
    }
    setLoading(false);
  };
 
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Employer Signup</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={loading}
          className={styles.formInput}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className={styles.formInput}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          className={styles.formInput}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          className={styles.formInput}
        />
        <input
          type="url"
          placeholder="Website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          disabled={loading}
          className={styles.formInput}
        />
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};
 
export default EmployerSignup;
 
 