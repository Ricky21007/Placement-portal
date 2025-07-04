import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export const MyPlacement = () => {
  const [placement, setPlacement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "placements"),
      where("graduateId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPlacement(snapshot.docs[0].data());
      } else {
        setPlacement(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching placement:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading placement...</p>;
  if (!placement) return <p>No placement found yet.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">🎉 You’ve Been Placed!</h2>
      <p><strong>Job Title:</strong> {placement.jobTitle}</p>
      <p>
        <strong>Placed At:</strong>{" "}
        {placement.placedAt?.toDate
          ? placement.placedAt.toDate().toLocaleDateString("en-ZA")
          : ""}
      </p>
    </div>
  );
};

export default MyPlacement;
