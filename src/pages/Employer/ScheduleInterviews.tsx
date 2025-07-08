import { useState } from "react";
import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import "../../styles/UnifiedEmployer.css";

type Application = {
  graduateId: string;
  jobId: string;
  jobTitle: string;
};

type ScheduleInterviewProps = {
  application: Application;
  onClose?: () => void;
};

type Interview = {
  id: string;
  graduateId: string;
  jobId: string;
  jobTitle: string;
  status: string;
};

const ScheduleInterview: React.FC<ScheduleInterviewProps> = ({
  application,
  onClose,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingType, setMeetingType] = useState("in-person");
  const [teamsLink, setTeamsLink] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [interview, setInterview] = useState<Interview | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!date || !time || !location) {
      alert("Please fill in date, time, and location.");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const interviewDoc = await addDoc(collection(db, "interviews"), {
        graduateId: application.graduateId,
        jobId: application.jobId,
        employerId: user.uid,
        date: Timestamp.fromDate(new Date(`${date}T${time}`)),
        location,
        status: "Scheduled",
        notes,
      });

      setInterview({
        id: interviewDoc.id,
        graduateId: application.graduateId,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        status: "Scheduled",
      });

      await addDoc(collection(db, "notifications"), {
        userId: application.graduateId,
        message: `Your interview for "${application.jobTitle}" has been scheduled on ${new Date(`${date}T${time}`).toLocaleString()}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      setStatus("Interview scheduled successfully.");
      if (onClose) setTimeout(onClose, 1500);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      setStatus("Failed to schedule interview.");
    } finally {
      setLoading(false);
    }
  };

  // Function to mark interview outcome
  const markOutcome = async (
    interviewId: string,
    outcome: "Hired" | "Not Hired",
    graduateId: string,
    jobId: string,
    jobTitle: string,
  ) => {
    try {
      const interviewRef = doc(db, "interviews", interviewId);
      await updateDoc(interviewRef, { status: outcome });

      if (outcome === "Hired") {
        const placementRef = doc(collection(db, "placements"));
        await setDoc(placementRef, {
          graduateId,
          jobId,
          jobTitle,
          employerId: auth.currentUser.uid,
          placedAt: serverTimestamp(),
        });

        await addDoc(collection(db, "notifications"), {
          userId: graduateId,
          message: `🎉 Congratulations! You've been hired for "${jobTitle}".`,
          read: false,
          createdAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "notifications"), {
          userId: graduateId,
          message: `Unfortunately, you were not selected for the "${jobTitle}" role.`,
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      alert(`Graduate marked as ${outcome}`);
    } catch (err) {
      console.error("Error updating interview outcome:", err);
      alert("Failed to update interview outcome.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 12,
        background: "#f8f8ff",
        padding: 16,
        borderRadius: 8,
      }}
    >
      <h3>Schedule Interview</h3>

      <label>
        Date:
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>
      <br />

      <label>
        Time:
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </label>
      <br />

      <label>
        Location:
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </label>
      <br />

      <label>
        Notes:
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <br />

      <button type="submit" disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Interview"}
      </button>
      <button type="button" onClick={onClose} style={{ marginLeft: 8 }}>
        Cancel
      </button>

      {status && <p>{status}</p>}

      {interview?.status === "Scheduled" && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() =>
              markOutcome(
                interview.id,
                "Hired",
                interview.graduateId,
                interview.jobId,
                interview.jobTitle,
              )
            }
          >
            Mark as Hired
          </button>
          <button
            onClick={() =>
              markOutcome(
                interview.id,
                "Not Hired",
                interview.graduateId,
                interview.jobId,
                interview.jobTitle,
              )
            }
            style={{ marginLeft: 10 }}
          >
            Not Hired
          </button>
        </div>
      )}
    </form>
  );
};

export default ScheduleInterview;

export const ScheduleInterviews = () => <div>Schedule Interviews</div>;
