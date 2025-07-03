import React, { useState } from 'react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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
    <div
      style={{
        maxWidth: 400,
        margin: '40px auto',
        padding: 32,
        border: '2px solid #222',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(241, 238, 238, 0.15)',
        background: '#fff',
        color: '#000'
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Reset Password</h2>
      <p style={{ textAlign: 'center', marginBottom: 20 }}>To reset your password, enter your email below.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12, padding: 8, color: '#000', background: '#fff', border: '1px solid #222' }}
        />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#222', color: '#fff', border: 'none' }}>
          Send Reset Email
        </button>
        {error && <p style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginTop: 8, textAlign: 'center' }}>{success}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;