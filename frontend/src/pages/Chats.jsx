import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Chats.css";

function Chats() {

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!user) return;

        const fetchChats = async () => {

            try {

                const res = await api.post("/messages/chats", {
                    userId: user.id,
                });

                setChats(res.data || []);

            } catch (err) {
                console.error("Error fetching chat list", err);
            } finally {
                setLoading(false);
            }

        };
        fetchChats();

    }, [user]);

    if (loading) {
        return <p className="chats-loading">Loading chats...</p>;
    }

    return (

        <div className="dashboard-layout">
            <div className="dashboard-topbar">
            </div>

            <div className="chats-container">

                <div className="chats-header">

                <div className="page-header">
                    <h2>My Chats</h2>
                    <p>Your mentorship conversations</p>
                </div>
                </div>

                {chats.length === 0 ? (
                    <div className="empty-chats-state">
                        <h3>No conversations yet.</h3>

                        <p>
                            Chats start once a mentorship request is accepted.
                            Find mentors or check your incoming requests to begin.
                        </p>

                        <div className="empty-chats-actions">
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
                    <ul className="chat-list">
                        {chats.map((chat) => (
                            <li
                                key={chat.userId}
                                className="chat-item"
                                onClick={() => navigate(`/chat/${chat.userId}`, {
                                    state: { from: "/chats" }
                                })}
                            >
                                <div className="chat-top">
                                    <span className="chat-name">{chat.name}</span>

                                    {chat.unreadCount > 0 && (
                                        <span
                                            className="chat-unread-badge"
                                        >
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>

                                <div className="chat-last-message">
                                    {chat.lastMessage
                                        ? chat.lastMessage.length > 40
                                            ? chat.lastMessage.slice(0, 40) + "..."
                                            : chat.lastMessage
                                        : "No message yet"}
                                </div>

                                <div className="chat-time">
                                    {chat.lastMessageAt
                                        ? new Date(chat.lastMessageAt).toLocaleString()
                                        : "No messages yet"}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

        </div>

    );

}

export default Chats;