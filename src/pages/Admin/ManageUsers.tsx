import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../../styles/ManageUsers.css";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  approved?: boolean;
}

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const data: User[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<User, "id">),
        }));
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const toggleActive = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      const user = users.find((u) => u.id === id);
      if (!user) return;
      await updateDoc(userRef, { active: !user.active });
      setUsers(
        users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
      );
    } catch (error) {
      console.error("Error toggling active status:", error);
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { role: newRole });
      setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
    } catch (error) {
      console.error("Error changing role:", error);
    }
  };

  const approveEmployer = async (id: string) => {
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, { approved: true });
      setUsers(users.map((u) => (u.id === id ? { ...u, approved: true } : u)));
    } catch (error) {
      console.error("Error approving employer:", error);
    }
  };

  const resetPassword = async (email: string) => {
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Reset password link sent to ${email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      alert("Failed to send reset password email.");
    }
  };

  return (
    <div className="manage-users-container">
      <button
        className="back-button"
        onClick={() => navigate("/admin-dashboard")}
      >
        ← Back to Dashboard
      </button>
      <h1>User Management</h1>
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.active ? "" : "inactive"}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="grad">Graduate</option>
                    <option value="employer">Employer</option>
                  </select>
                </td>
                <td>{user.active ? "Active" : "Inactive"}</td>
                <td>
                  {user.role === "employer"
                    ? user.approved
                      ? "Yes"
                      : "No"
                    : "-"}
                </td>
                <td>
                  <button onClick={() => resetPassword(user.email)}>
                    Reset Password
                  </button>
                  <button onClick={() => toggleActive(user.id)}>
                    {user.active ? "Deactivate" : "Reactivate"}
                  </button>
                  {user.role === "employer" && !user.approved && (
                    <button onClick={() => approveEmployer(user.id)}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
