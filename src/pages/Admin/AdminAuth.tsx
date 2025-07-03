import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/AdminAuth.css";
import { verifyAdmin } from "../../services/adminService";
 
interface Props {
  mode: "login" | "signup";
}
 
const AdminAuth: React.FC<Props> = ({ mode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
 
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Debug: log email and password values before sending
      console.log("Login attempt with email:", email, "password:", password);
      const isValidAdmin = await verifyAdmin(email, password);
      if (isValidAdmin) {
        setError("");
        navigate('/admin/dashboard');
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      setError("Error verifying admin credentials");
    }
  };
 
  return (
    <div className="admin-auth-bg">
      <div className="admin-auth-container">
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
        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-subtitle">
          Empowering graduates. Connecting employers.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
          <div className="input-group" style={{ position: "relative" }}>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.61 3.31-4.77 6-6.32M1 1l22 22"
                    stroke="currentColor"
                  />
                  <path
                    d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97"
                    stroke="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <ellipse
                    cx="12"
                    cy="12"
                    rx="10"
                    ry="7"
                    stroke="currentColor"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" />
                </svg>
              )}
            </button>
          </div>
          <button type="submit" className="auth-button">
            Login
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
        <div className="auth-links">
          <Link to="/forgot-password" className="auth-link">
            Forgot Password?
          </Link>
        </div>
        <footer className="auth-footer">© 2025 CAPACITI Programme</footer>
      </div>
    </div>
  );
};
 
export default AdminAuth;
 
 