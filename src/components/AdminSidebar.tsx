import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminSidebar.css';
 
const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Placement Tracker', path: '/admin/placement-tracker' },
    { label: 'Employer Metrics', path: '/admin/employer-metrics' },
    { label: 'Manage Users', path: '/admin/manage-users' },
    { label: 'Manage Admins', path: '/admin/manage-admins' },
  ];
 
  const handleLogout = () => {
    // Clear any auth tokens or session here if needed
    navigate('/login/admin');
  };
 
  return (
    <div className="admin-sidebar">
      <h2 className="sidebar-title">Admin Menu</h2>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.label}
            className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>
      <button className="sidebar-logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};
 
export default AdminSidebar;
 
 