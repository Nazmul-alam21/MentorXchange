import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import MentorCard from "./MentorCard";
import "./activeMentorships.css";

function ActiveMentorships() {

    const { user } = useContext(AuthContext);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startIndex, setStartIndex] = useState(0);
    const [direction, setDirection] = useState("next");

    useEffect(() => {
        if (!user) return;

        const userId = user._id || user.id;
        if (!userId) return;

        const fetchActiveMentorships = async () => {

            try {

                const res = await api.get(`/mentorship/active?userId=${userId}`);

                setMentors(res.data);

            } catch (err) {
                console.error("Failed to fetch active mentorships", err);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveMentorships();
    }, [user]);

    if (loading) return <p>Loading active mentorships...</p>;

    const visibleMentors = mentors.slice(startIndex, startIndex + 2);

    const canGoLeft = startIndex > 0;
    const canGoRight = startIndex + 2 < mentors.length;

    const handleNext = () => {
        if (!canGoRight) return;
        setDirection("next");
        setStartIndex(prev => prev + 1);
    };

    const handlePrev = () => {
        if (!canGoLeft) return;
        setDirection("prev");
        setStartIndex(prev => prev - 1);
    }

    const handleMentorshipEnded = (mentorshipId) => {
        setMentors(prev => 
            prev.filter(m => m.mentorshipId !== mentorshipId)
        );
    };

    return (

        <div className="active-mentorships">
            <div className="active-header">
                <h2 className="title">Your Active Mentorships</h2>
                <span className="count-inline">{mentors.length}</span>
            </div>

            {mentors.length === 0 ? (
                <p>No active mentorships yet.</p>
            ) : (
                <div className="slider-wrapper">
                    <button
                        className="arrow"
                        disabled={!canGoLeft}
                        onClick={handlePrev}
                    >
                        ◀
                    </button>

                    <div
                    key={startIndex}
                    className={`cards-animated ${direction}`}
                    >
                        {visibleMentors.map((mentor) => (
                            <MentorCard key={mentor.mentorshipId} mentor={mentor} currentUserId={user._id || user.id} onEnd={handleMentorshipEnded} />
                        ))}
                    </div>

                    <button
                        className="arrow"
                        disabled={!canGoRight}
                        onClick={handleNext}
                    >
                        ▶
                    </button>
                </div>
            )}

        </div>

    );
}

export default ActiveMentorships;