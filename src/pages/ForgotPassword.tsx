import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../styles/ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Redirecting to login...');
      setTimeout(() => {
        navigate('/login/graduate'); // or /login/employer, depending on your flow
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">Reset Password</h2>
      <p className="forgot-password-subtitle">To reset your password, enter your email below.</p>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="forgot-password-input"
        />
        <button type="submit" className="forgot-password-button">
          Send Reset Email
        </button>
        {error && <p className="forgot-password-message forgot-password-error">{error}</p>}
        {success && <p className="forgot-password-message forgot-password-success">{success}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
