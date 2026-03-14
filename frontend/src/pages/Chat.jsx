import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./Chat.css";

function Chat() {
    const { user } = useContext(AuthContext);
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [otherUserName, setOtherUserName] = useState("");


    // Fetch conversation
    useEffect(() => {

        let intervalId;

        const fetchConversation = async () => {

            try {

                const res = await api.post("/messages/conversation", {
                    userId: user.id,
                    otherUserId: userId,
                });

                setMessages(res.data);

            } catch (err) {
                console.error("Error loading conversation", err);
            } finally {
                setLoading(false);
            }

        };

        const fetchOtherUser = async () => {

            try {

                const res = await api.get(`/profile/${userId}`);
                setOtherUserName(res.data.user.name);

            } catch (err) {
                console.error("Error loading user profile", err);
            }

        };

        const markMessagesAsRead = async () => {

            try { 
                await api.post("/messages/mark-read", {
                    userId: user.id,
                    otherUserId: userId,
                });
            } catch (err) {
                console.error("Error marking messages as read", err);
            }
        };

        const initChat = async () => {
            try {
            await fetchOtherUser();
            await fetchConversation();
            await markMessagesAsRead();

            window.dispatchEvent(new Event("chat-read"));

            } catch (err) {
                console.error("Error initializing chat", err);
            } finally {
                setLoading(false);
            }
        };

        initChat();

        intervalId = setInterval(fetchConversation, 3000);

        return () => clearInterval(intervalId);
    }, [user.id, userId]);


    // Send message
    const handleSend = async (e) => {
        e.preventDefault();

        if (!content.trim()) return;

        try {

            const res = await api.post("/messages/send", {
                from: user.id,
                to: userId,
                content,
            });

            setMessages([...messages, res.data.data]);
            setContent("");

        } catch (err) {
            console.error("Error sending message", err);
        }
    };

    const handleBrowserBack = () => {
        if (location.state?.from) {
            navigate(location.state.from);
        } else {
            navigate("/chats");
        }
    };

    useEffect(() => {
        const onPopState = () => {
            handleBrowserBack();
        };

        window.addEventListener("popstate", onPopState);

        return () => {
            window.removeEventListener("popstate", onPopState);
        };
    }, []);

    if (loading) {
        return <p style={{ padding: "20px" }}>Loading chat...</p>;
    }

    return (

        <div className="dashboard-layout">

            <div className="dashboard-topbar">
            </div>

            <div className="chat-page">

                <div className="chat-box">
                    {messages.length === 0 ? (
                        <p className="chat-empty">No messages yet.</p>
                    ) : (
                        messages.map((msg) => {
                            const senderId =
                                typeof msg.sender === "string"
                                    ? msg.sender
                                    : msg.sender?._id;

                            const isMe = senderId === user.id;

                            return (
                                <div
                                    key={msg._id}
                                    className={`chat-message ${isMe ? "chat-me" : "chat-other"}`}
                                >

                                    <div className="chat-bubble">
                                        <div
                                            className={`chat-sender ${!isMe ? "clickable" : ""}`}
                                            onClick={() => {
                                                if (!isMe) navigate(`/profile/view/${userId}`)
                                            }}
                                        >
                                            {isMe ? "You" : otherUserName || "User"}
                                        </div>

                                        <div className="chat-text">
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <form className="chat-input-area" onSubmit={handleSend} >
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type a message..."
                        className="chat-input"
                    />

                    <button type="submit" className="chat-send-btn">
                        Send
                    </button>
                </form>

            </div>

        </div>
    );
}

export default Chat;