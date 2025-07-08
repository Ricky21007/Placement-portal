import React, { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import "./styles/UnifiedAuth.css";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(
        "Password reset email sent! Check your inbox and follow the instructions.",
      );
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(
        err.message || "Failed to send password reset email. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <Link to="/" className="back-to-welcome-btn">
          <span className="back-arrow-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle
                cx="14"
                cy="14"
                r="13"
                stroke="#ff6f61"
                strokeWidth="2"
                fill="#fff"
              />
              <path
                d="M16 9l-5 5 5 5"
                stroke="#ff6f61"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Back to Welcome
        </Link>

        <img
          src="/Images/CAPACITI-LOGO.jpg"
          alt="CAPACITI Logo"
          className="auth-logo"
        />

        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Email"}
          </button>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}
        </form>

        <div className="auth-links">
          <Link to="/login/graduate" className="auth-link">
            Back to Graduate Login
          </Link>
          <Link to="/login/employer" className="auth-link">
            Back to Employer Login
          </Link>
          <Link to="/login/admin" className="auth-link">
            Back to Admin Login
          </Link>
        </div>

        <footer className="auth-footer">© 2025 CAPACITI Programme</footer>
      </div>
    </div>
  );
};

export default ForgotPassword;
