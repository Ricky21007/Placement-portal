import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase.js";
import {
  collection,
  query,
  where,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "../../styles/ManageAdmins.css"; // Import your CSS styles


const ManageAdmins: React.FC = () => {
  interface AdminUser {
    id: string;
    fullname: string;
    email: string;
    role: string;
    active: boolean;
  }

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "admin",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<{ [key: string]: boolean }>({});

  // Fetch admins (with optional search)
  const fetchAdmins = async (search = "") => {
    setLoading(true);
    try {
      const adminsRef = collection(db, "admins");
      const q = search
        ? query(
            adminsRef,
            where("fullname", ">=", search),
            where("fullname", "<=", search + "\uf8ff")
          )
        : query(adminsRef);
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AdminUser, "id">),
      }));
      setAdmins(list);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const createDefaultAdminIfNotExists = async () => {
      try {
        const adminsRef = collection(db, "admins");
        const q = query(adminsRef, where("email", "==", "admin@gmail.com"));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          // Create default admin user in Firebase Auth and Firestore
          const userCredential = await createUserWithEmailAndPassword(auth, "admin@gmail.com", "admin12345");
          const user = userCredential.user;
          await addDoc(adminsRef, {
            fullname: "ADMIN ADMIN",
            email: "admin@gmail.com",
            role: "admin",
            active: true,
            uid: user.uid,
          });
          alert("Default admin created with email: admin@gmail.com and password: admin12345");
        }
      } catch (error) {
        console.error("Error creating default admin:", error);
      }
    };

    createDefaultAdminIfNotExists();
    fetchAdmins();
  }, []);

  // Add new admin
  const handleAddAdmin = async () => {
    const { fullname, email, password, role, active } = newAdmin;
    if (!fullname || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }
    setPending((prev) => ({ ...prev, add: true }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newAdmin.email, newAdmin.password);
      const user = userCredential.user;

      await addDoc(collection(db, "admins"), {
        fullname,
        email,
        role,
        active,
        uid: user.uid,
      });
      setNewAdmin({ fullname: "", email: "", password: "", role: "admin", active: true });
      fetchAdmins();
      alert("Admin added successfully.");
    } catch (err: any) {
      console.error("Add admin error:", err);
      alert("Error adding admin: " + err.message);
    }
    setPending((prev) => ({ ...prev, add: false }));
  };

  // Toggle active/inactive
  const handleToggleActive = async (id: string, status: boolean, email: string) => {
    // Prevent toggling default admin or self
    if (email === "admin@gmail.com") {
      alert("Default admin cannot be deactivated.");
      return;
    }
    if (auth.currentUser && auth.currentUser.email === email) {
      alert("You cannot deactivate yourself.");
      return;
    }
    setPending((prev) => ({ ...prev, [id]: true }));
    try {
      await updateDoc(doc(db, "admins", id), { active: !status });
      fetchAdmins();
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
    setPending((prev) => ({ ...prev, [id]: false }));
  };

  // Delete admin
  const handleDeleteAdmin = async (id: string, email: string) => {
    // Prevent deleting default admin or self
    if (email === "admin@gmail.com") {
      alert("Default admin cannot be deleted.");
      return;
    }
    if (auth.currentUser && auth.currentUser.email === email) {
      alert("You cannot delete yourself.");
      return;
    }
    if (!confirm("Are you sure you want to delete this admin?")) return;
    setPending((prev) => ({ ...prev, [id]: true }));
    try {
      await deleteDoc(doc(db, "admins", id));
      fetchAdmins();
    } catch (err: any) {
      alert("Error deleting admin: " + err.message);
    }
    setPending((prev) => ({ ...prev, [id]: false }));
  };

  return (
    <div className="manage-users-container" style={{ marginLeft: "260px", minHeight: "100vh", padding: "1rem", overflowY: "auto", marginTop: "0", marginBottom: "0" }}>
      <h1>Manage Admins</h1>
      <div className="form-row">
        <button onClick={handleAddAdmin} disabled={pending.add}>
          {pending.add ? "Adding..." : "Add Admin"}
        </button>
        <input
          type="text"
          placeholder="Fullname"
          value={newAdmin.fullname}
          onChange={(e) => setNewAdmin({ ...newAdmin, fullname: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newAdmin.email}
          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newAdmin.password}
          onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
        />
      </div>

      <input
        type="text"
        placeholder="Search admins..."
        onChange={(e) => fetchAdmins(e.target.value)}
        className="search-bar"
      />

      {loading ? (
        <p>Loading admins...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Fullname</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className={!admin.active ? "inactive" : ""}>
                <td>{admin.fullname}</td>
                <td>{admin.email}</td>
                <td>{admin.role}</td>
                <td>{admin.active ? "Active" : "Inactive"}</td>
                <td>
                  <button
                    onClick={() => handleToggleActive(admin.id, admin.active, admin.email)}
                    disabled={pending[admin.id]}
                  >
                    {admin.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                    disabled={pending[admin.id]}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageAdmins;
