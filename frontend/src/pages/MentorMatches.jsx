import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import "./mentorMatches.css";

function MentorMatches() {

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requestedUsers, setRequestedUsers] = useState([]);
    const [cooldownInfo, setCooldownInfo] = useState({});

    useEffect(() => {

        if (!user) return;

        setLoading(true);
        setMatches([]);

        const fetchMatches = async () => {

            try {

                const res = await api.post("/matches", {
                    userId: user.id,
                });

                setMatches(res.data.matches ?? []);

            } catch (err) {
                console.error("Error fetching matches", err);
            } finally {
                setLoading(false);
            }

        };

        fetchMatches();
    }, [user.id]);


    const handleSendRequest = async (toUserId) => {
        try {
            await api.post("/request/send", {
                from: user.id,
                to: toUserId,
            });

            setRequestedUsers(prev => [...prev, toUserId]);

        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "You cannot send a request right now.";

            setCooldownInfo(prev => ({
                ...prev,
                [toUserId]: message
            }));
        }
    };


    if (loading) {
        return <p style={{ padding: "20px" }}>Loading matches...</p>
    }

    return (

        <div className="dashboard-layout">

            <div className="mentor-matches-page">

                <div className="page-header">
                    <h2>Mentor Matches</h2>
                    <p>Discover people you can learn from</p>
                </div>

                {matches.length === 0 ? (
                    <div className="empty-state">
                        <h3>No mentor matches yet.</h3>

                        <p>
                            Mentors are matches based on your profile details like skills offered
                            and skills you want to learn.
                        </p>

                        <p>
                            Complete or update your profile so others can discover you.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={() => navigate("/profile")}
                        >
                            Complete Profile
                        </button>
                    </div>
                ) : (
                    <div className="matches-list">
                        {matches.map((match, index) => (
                            <div key={index} className="match-card">

                                <div className="match-header">
                                    <div
                                        className="match-name"
                                        onClick={() => navigate(`/profile/view/${match.userId}`, {
                                            state: { from: location.pathname }
                                        })}
                                    >
                                        {match.name}
                                    </div>

                                </div>

                                {match.bio && (
                                    <div className="match-section">
                                        <span>Bio:</span>
                                        <p>{match.bio}</p>
                                    </div>
                                )}

                                <div className="match-section">
                                    <span>Skills Offered:</span>
                                    <p>{match.skillsOffered.join(", ")}</p>
                                </div>

                                <div className="match-section">
                                    <span>Skills Wanted:</span>
                                    <p>{match.skillsWanted.join(", ")}</p>
                                </div>

                                <div className="match-actions">
                                    {cooldownInfo[match.userId] ? (
                                        <button className="disabled-btn" disabled>
                                            {cooldownInfo[match.userId]}
                                        </button>
                                    ) : match.requestStatus === "pending" || requestedUsers.includes(match.userId) ? (
                                        <button className="disabled-btn" disabled>
                                            Pending
                                        </button>
                                    ) : (
                                        <button
                                            className="primary-btn"
                                            onClick={() => handleSendRequest(match.userId)}
                                        >
                                            Send Request
                                        </button>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                )}


            </div>

        </div>

    );

}

export default MentorMatches;