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

    // Validation
    if (!date || !time) {
      alert("Please fill in date and time.");
      return;
    }

    if (meetingType === "in-person" && !location.trim()) {
      alert("Please provide a location for in-person meeting.");
      return;
    }

    if (meetingType === "teams" && !teamsLink.trim()) {
      alert("Please provide a Teams meeting link.");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const interviewData = {
        graduateId: application.graduateId,
        jobId: application.jobId,
        employerId: user.uid,
        date: Timestamp.fromDate(new Date(`${date}T${time}`)),
        meetingType,
        location: meetingType === "in-person" ? location : "Online",
        teamsLink: meetingType === "teams" ? teamsLink : "",
        status: "Scheduled",
        notes,
        createdAt: serverTimestamp(),
      };

      const interviewDoc = await addDoc(
        collection(db, "interviews"),
        interviewData,
      );

      setInterview({
        id: interviewDoc.id,
        graduateId: application.graduateId,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        status: "Scheduled",
      });

      // Create notification message based on meeting type
      const meetingDetails =
        meetingType === "teams"
          ? `via Teams meeting: ${teamsLink}`
          : `at ${location}`;

      await addDoc(collection(db, "notifications"), {
        userId: application.graduateId,
        message: `Your interview for "${application.jobTitle}" has been scheduled on ${new Date(`${date}T${time}`).toLocaleString()} ${meetingDetails}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      setStatus("Interview scheduled successfully.");
      if (onClose) setTimeout(onClose, 2000);
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
    <div className="interview-scheduling-overlay">
      <div className="interview-scheduling-modal">
        <div className="interview-modal-header">
          <h3 className="interview-modal-title">Schedule Interview</h3>
          <p className="interview-modal-subtitle">
            Position: {application.jobTitle}
          </p>
          <button
            type="button"
            className="interview-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="interview-form">
          <div className="interview-form-row">
            <div className="employer-form-group">
              <label className="employer-form-label">Interview Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="employer-form-input"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="employer-form-group">
              <label className="employer-form-label">Interview Time *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="employer-form-input"
              />
            </div>
          </div>

          <div className="employer-form-group">
            <label className="employer-form-label">Meeting Type *</label>
            <select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              className="employer-form-select"
            >
              <option value="in-person">In-Person Meeting</option>
              <option value="teams">Microsoft Teams</option>
              <option value="other">Other Online Platform</option>
            </select>
          </div>

          {meetingType === "in-person" && (
            <div className="employer-form-group">
              <label className="employer-form-label">Meeting Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Office Address, Conference Room"
                className="employer-form-input"
              />
            </div>
          )}

          {meetingType === "teams" && (
            <div className="employer-form-group">
              <label className="employer-form-label">
                Teams Meeting Link *
              </label>
              <input
                type="url"
                value={teamsLink}
                onChange={(e) => setTeamsLink(e.target.value)}
                placeholder="https://teams.microsoft.com/l/meetup-join/..."
                className="employer-form-input"
              />
              <small
                style={{
                  color: "var(--text-muted)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Generate this link from Microsoft Teams and paste it here
              </small>
            </div>
          )}

          {meetingType === "other" && (
            <div className="employer-form-group">
              <label className="employer-form-label">Meeting Details *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Zoom link, Google Meet link, etc."
                className="employer-form-input"
              />
            </div>
          )}

          <div className="employer-form-group">
            <label className="employer-form-label">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information for the candidate..."
              className="employer-form-textarea"
              rows={3}
            />
          </div>

          {status && (
            <div
              className={`interview-status ${status.includes("Failed") ? "error" : "success"}`}
            >
              {status}
            </div>
          )}

          <div className="interview-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="employer-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="employer-button-primary"
            >
              {loading ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </form>

        {interview?.status === "Scheduled" && (
          <div className="interview-outcome-section">
            <h4 className="interview-outcome-title">Interview Outcome</h4>
            <div className="interview-outcome-buttons">
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
                className="employer-button-primary"
              >
                ✅ Mark as Hired
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
                className="employer-button-danger"
              >
                ❌ Mark as Not Hired
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleInterview;

export const ScheduleInterviews = () => <div>Schedule Interviews</div>;
