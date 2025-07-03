import React from "react";
import { Outlet } from "react-router-dom";
// Make sure the file exists at the specified path, or update the path if needed
import AdminSidebar from "./AdminSidebar";
import '../styles/AdminSidebar.css';
 
const AdminLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <main style={{ flexGrow: 1, padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
};
 
export default AdminLayout;
 