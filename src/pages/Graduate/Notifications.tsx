import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: any;
  recipientId?: string; // for compatibility
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    // Listen in real-time
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as Notification);
      });
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "notifications", id), { read: true });
  };

  return (
    <div style={{ position: "fixed", top: 10, right: 10, width: 300, zIndex: 1000 }}>
      {notifications.map((notif) => (
        <div
          key={notif.id}
          style={{
            marginBottom: 10,
            padding: 10,
            backgroundColor: notif.read ? "#eee" : "#ffd",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer"
          }}
          onClick={() => markAsRead(notif.id)}
          title="Click to mark as read"
        >
          <small>{notif.createdAt?.toDate().toLocaleString()}</small>
          <p>{notif.message}</p>
        </div>
      ))}
    </div>
  );
};

export default