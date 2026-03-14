import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ActiveMentorships from "../components/dashboard/ActiveMentorships";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeCount, setActiveCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const userId = user._id || user.id;

    const fetchActiveCount = async () => {
      try {
        const res = await api.get(`/mentorship/active?userId=${userId}`);
        setActiveCount(res.data.length);
        console.log("Active mentorships response:", res.data);
      } catch (err) {
        console.error("Failed to fetch active mentorships", err);
        setActiveCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCount();
  }, [user]);

  if (loading) return null;

  return (
  <div>
    <h1>Welcome, {user?.name}</h1>

    <p style={{ marginTop: "10px", color: "#94a3b8", fontSize: "14px" }}>
      This is your skill exchange space — learn what you want by teaching what you know.
    </p>

    {activeCount > 0 && (
      <div style={{ marginTop: "24px" }}>
        <ActiveMentorships />
      </div>
    )}

    {activeCount === 0 && (
      <div style={{ marginTop: "32px", maxWidth: "520px" }}>
        <h2>Start your first skill exchange </h2>

        <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: "1.6" }}>
          Before finding mentors, complete your profile so others know
          what you can teach and what you want to learn.
        </p>

        <ul style={{ marginTop: "16px", color: "#cbd5f5", fontSize: "14px" }}>
          <li>Complete your profile</li>
          <li>Find mentors who need your skills</li>
          <li>Send a mentorship request</li>
          <li>Chat, learn, and grow together</li>
        </ul>

        <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
          <button
            className="primary-btn"
            onClick={() => navigate("/profile")}
          >
            Complete Profile
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate("/matches")}
          >
            Find Mentors
          </button>
        </div>
      </div>
    )}
  </div>
);
}

export default Dashboard;