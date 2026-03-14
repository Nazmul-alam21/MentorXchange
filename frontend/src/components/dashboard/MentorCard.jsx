import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./mentorCard.css";
import { useState } from "react";

function MentorCard({ mentor, onEnd, currentUserId }) {

    const navigate = useNavigate();
    const [showConfirm, setShowConfirm] = useState(false);
    const [ending, setEnding] = useState(false);

    const confirmEndMentorship = async () => {

        if (!mentor.mentorshipId) return;

        try {

            setEnding(true);

            await api.post("/mentorship/end", {
                mentorshipId: mentor.mentorshipId,
                userId: currentUserId,
            });

            onEnd(mentor.mentorshipId);
            setShowConfirm(false);

        } catch (err) {
            alert(
                err?.response?.data?.message || "Failed to end mentorship."
            );
            console.error(err);
        } finally {
            setEnding(false);
        }
    };


    return (

        <>

            <div className="mentor-card">
                <div className="mentor-card-header">
                    <h3 className="mentor-name">{mentor.name}</h3>
                </div>

                {mentor.bio && (
                    <p className="mentor-bio">{mentor.bio}</p>
                )}

                <div className="mentor-meta">
                    {mentor.education && (
                        <span className="mentor-tag">{mentor.education}</span>
                    )}
                    {mentor.experience && (
                        <span className="mentor-tag">{mentor.experience}</span>
                    )}
                </div>

                <div className="mentor-actions">
                    <button
                        className="secondary-btn"
                        onClick={() => navigate(`/profile/view/${mentor._id}`)}
                    >
                        View Profile
                    </button>

                    <button
                        className="primary-btn"
                        onClick={() => navigate(`/chat/${mentor._id}`)}
                    >
                        Chat
                    </button>

                    <button
                        className="danger-btn"
                        onClick={() => setShowConfirm(true)}
                    >
                        End Mentorship
                    </button>

                </div>
            </div>

            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>End Mentorship?</h3>
                        <p>
                            Are you sure you want to end the mentorship with 
                            <strong>{mentor.name}</strong>?
                            This action cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button
                                className="secondary-btn"
                                onClick={() => setShowConfirm(false)}
                                disabled={ending}
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-btn solid"
                                onClick={confirmEndMentorship}
                                disabled={ending}
                            >
                                {ending ? "Ending..." : "End Mentorship"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>

    );
}

export default MentorCard;