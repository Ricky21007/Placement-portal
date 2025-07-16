import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/GraduateDashboard.css";

const GraduateDashboard = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;

  // Load profile picture from Firestore on mount
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "graduates", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profilePicUrl) {
            setProfileImage(data.profilePicUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [user]);

  // Redirect to profile page for image upload
  const handleProfilePictureClick = () => {
    // Navigate to profile page where they can upload/change their picture
    window.location.href = "/graduate/profile";
  };

  return (
    <div className="graduate-dashboard">
      {/* Header */}
      <header className="header">
        <h1 className="header-title">Graduate Dashboard</h1>
        <span className="header-greeting">Welcome back</span>
      </header>

      <div className="content-wrapper">
        {/* Simplified Sidebar - Only Profile Picture and Edit Profile */}
        <aside className="sidebar">
          <div className="profile-picture-section">
            <div
              className="profile-picture-wrapper"
              style={{ cursor: "pointer" }}
              onClick={handleProfilePictureClick}
            >
              <div className="profile-picture">
                <img
                  id="profile-img"
                  src={
                    profileImage ||
                    "https://ui-avatars.com/api/?name=User&background=ff6b35&color=ffffff&size=200"
                  }
                  alt="Profile Picture"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://ui-avatars.com/api/?name=User&background=ff6b35&color=ffffff&size=200";
                  }}
                />
                <div className="upload-overlay">
                  <i
                    className="fas fa-camera"
                    style={{ fontSize: 24, marginBottom: 8 }}
                  ></i>
                  <span>Go to Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Only Edit Profile in Sidebar */}
          <nav>
            <Link to="/graduate/profile" className="nav-link">
              <h4 className="nav-title">Edit Profile</h4>
              <p className="nav-description">
                Update your CV, skills and portfolio.
              </p>
            </Link>
            <button
              className="sidebar-logout-button"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "/";
              }}
              style={{ marginTop: "1rem", cursor: "pointer" }}
            >
              Log Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Overview */}
          <section>
            <h2 className="section-title">Overview</h2>
            <p className="section-description">
              Track your progress and navigate your placement journey.
            </p>
          </section>

          {/* Navigation Cards - Moved from Sidebar to Center */}
          <section className="navigation-grid">
            <Link to="/graduate/jobs" className="nav-card">
              <div className="nav-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 13V9C21 8.4 20.6 8 20 8H4C3.4 8 3 8.4 3 9V13M21 13V18C21 18.6 20.6 19 20 19H4C3.4 19 3 18.6 3 18V13M21 13H3M8 8V6C8 5.4 8.4 5 9 5H15C15.6 5 16 5.4 16 6V8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="nav-card-title">View Job Matches</h3>
              <p className="nav-card-description">
                Explore jobs tailored to your skills and experience.
              </p>
              <span className="nav-card-arrow">→</span>
            </Link>

            <Link to="/graduate/applications" className="nav-card">
              <div className="nav-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="nav-card-title">Track Applications</h3>
              <p className="nav-card-description">
                Monitor the status of your job applications.
              </p>
              <span className="nav-card-arrow">→</span>
            </Link>

            <Link to="/graduate/view-jobs" className="nav-card">
              <div className="nav-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="nav-card-title">View All Jobs</h3>
              <p className="nav-card-description">
                Browse all available job opportunities.
              </p>
              <span className="nav-card-arrow">→</span>
            </Link>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} CAPACITI Graduate Placement Portal. All
        rights reserved.
      </footer>
    </div>
  );
};

export default GraduateDashboard;
