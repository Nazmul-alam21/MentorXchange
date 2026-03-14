import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import "./notifications.css";

function Notifications() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!user) return;

        try {

            const res = await api.post("/notifications/get", {
                userId: user.id,
            });

            setNotifications(res.data || []);

        } catch (err) {
            console.log("Error fetching notifications", err);
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const handleNotificationClick = async (note) => {

        try {

            if (note.meta?.requestId && !note.isResolved) {
                navigate("/requests");
            }

            if (!note.isRead) {
                await api.post("/notifications/read", {
                    notificationId: note._id,
                });
            }

        } catch (err) {
            console.log("Error handling notification click", err);
        }

    };

    if (loading) {
        return <p style={{ padding: "20px" }}>Loading Notifications...</p>;
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (

        <div className="dashboard-layout">
            <div className="dashboard-topbar">
            </div>

            <div className="notifications-page">

                <div className="page-header">
                    <h2>
                        Notifications
                        <span className="unread-count">
                            {unreadCount} unread
                        </span>
                    </h2>
                    <p>Your latest updates and requests</p>
                </div>

                {notifications.length === 0 ? (
                    <div className="empty-notifications-state">
                        <h3>No notification yet.</h3>
                        <p>
                            You'll see updates here when someone sends you a mentorship request,
                            accepts your request, or message you.
                        </p>

                        <div className="empty-notifications-actions">
                            <button
                            className="primary-btn"
                            onClick={() => navigate("/matches")}
                            >
                                Find Mentors
                            </button>

                            <button
                            className="secondary-btn"
                            onClick={() => navigate("/requests")}
                            >
                                View Requests
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="notifications-list">
                        {notifications.map((note) => (
                            <div
                                key={note._id}
                                className={`notification-card ${!note.isRead ? "unread" : ""}`}
                                onClick={() => handleNotificationClick(note)}
                            >
                                <p className="notification-message">
                                    {note.message}
                                </p>

                                {note.meta?.requestId && !note.isResolved && (
                                    <span className="notification-link">
                                        View details →
                                    </span>

                                )}
                            </div>

                        ))}
                    </div>

                )}

            </div>
        </div>

    );

}

export default Notifications;