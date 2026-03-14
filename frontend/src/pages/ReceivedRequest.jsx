import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import "./receivedRequest.css";

function ReceivedRequests() {

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);


    const fetchRequests = async () => {

        try {

            const userId = user._id || user.id;
            if (!userId) return;

            const res = await api.post("/request/received", {
                userId
            });

            setRequests(res.data || []);

        } catch (err) {
            console.log("Error fetching requests", err);
        } finally {
            setLoading(false);
        }

    };


    useEffect(() => {

        if (!user) return;

        const userId = user._id || user.id;
        if (!userId) return;

        fetchRequests();

        api.post("/notifications/read-by-type", {
            userId,
            type: "request"
        });

    }, [user]);


    const handleRespond = async (requestId, action, fromUserId) => {
        setProcessingId(requestId);


        try {

            await api.post("/request/respond", {
                requestId,
                action,
            });

            setRequests(prev => prev.filter(req => req._id !== requestId));

            if (action === "accepted") {
                setTimeout(() => {
                    navigate(`/chat/${fromUserId}`);
                }, 0);
            }

        } catch (err) {
            console.error("Frontend Error", err.response?.data || err);
            alert(err.response?.data?.message || "Failed to update request");
        } finally {
            setProcessingId(null);
        }

    };

    if (loading) {
        return <p style={{ padding: "20px" }}>Loading requests...</p>;
    }

    return (

        <div className="dashboard-layout">

            <div className="dashboard-topbar">
            </div>

            <div className="received-requests-page">

                <div className="page-header">
                    <h2>Received Requests</h2>
                    <p>Mentorship requests waiting for your response</p>
                </div>

                {requests.length === 0 ? (
                    <div className="empty-requests-state">
                        <h3>No mentorship requests yet.</h3>
                        <p>
                            Requests appear when someone finds your profile and wants to start 
                            a mentorship with you. Make sure your profile is completed and visible.
                        </p>

                        <div className="empty-requests-actions">
                            <button
                            className="primary-btn"
                            onClick={() => navigate("/profile")}
                            >
                                Improve Profile
                            </button>

                            <button
                            className="secondary-btn"
                            onClick={() => navigate("/matches")}
                            >
                                Find Mentors
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((req) => (
                            <div
                                key={req._id}
                                className="request-card">
                                <div className="request-info">
                                    <div
                                        className="request-name"
                                        onClick={() => navigate(`/profile/view/${req.from._id}`, {
                                            state: { from: location.pathname }
                                        })}
                                    >
                                        {req.from.name}
                                    </div>

                                    <div className="request-subtext">
                                        wants to start a mentorship with you.
                                    </div>
                                </div>
                                <div className="request-actions">
                                    <button
                                        className={`primary-btn ${processingId === req._id ? "disabled-btn" : ""}`}
                                        onClick={() => handleRespond(req._id, "accepted", req.from._id)}
                                        disabled={processingId === req._id}
                                    >
                                        {processingId === req._id ? "Accepting..." : "Accept"}
                                    </button>

                                    <button
                                        className={`secondary-btn ${processingId === req._id ? "disabled-btn" : ""}`}
                                        onClick={() => handleRespond(req._id, "rejected")}
                                        disabled={processingId === req._id}
                                    >
                                        {processingId === req._id ? "Rejecting..." : "Reject"}
                                    </button>

                                </div>
                            </div>

                        ))}
                    </div>

                )}

            </div>

        </div>
    );

}

export default ReceivedRequests;