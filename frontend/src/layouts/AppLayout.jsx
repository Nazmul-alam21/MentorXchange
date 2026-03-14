import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { User, Users, Inbox, Bell, MessageCircle, LogOut, Home } from "lucide-react";
import "../styles/layout.css";

function AppLayout() {
  const { user, logout } = useContext(AuthContext);
  const userId = user?.id || user?._id;
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);


  const fetchUnreadChats = async () => {
    try {
      const res = await api.post("/messages/unread-count", {
        userId,
      });
      setUnreadChatsCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread chats count", error);
    }
  };


  const fetchUnreadNotifications = async () => {
    try {
      const res = await api.post("/notifications/unread-count", {
        userId,
      });
      setUnreadNotificationsCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread notifications count", error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnreadChats();
    fetchUnreadNotifications();
  }, [user]);

  useEffect(() => {
    const handleChatRead = () => {
      if (!user) return;
      fetchUnreadChats();
    };

    window.addEventListener("chat-read", handleChatRead);

    return () => {
      window.removeEventListener("chat-read", handleChatRead);
    };
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          Mentor<span className="brand-x">X</span>change
        </div>

        <nav className="sidebar-nav">

          <button
          onClick={() => navigate("/dashboard")}
          className={location.pathname === "/dashboard" ? "active" : ""}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </button>

          <button 
          onClick={() => navigate("/profile")}
          className={location.pathname === "/profile" ? "active" : ""}
          >
            <User size={18} />
            <span>My Profile</span>
          </button>

          <button 
          onClick={() => navigate("/matches")}
          className={location.pathname === "/matches" ? "active" : ""}
          >
            <Users size={18} />
            <span>Find Mentors</span>
          </button>

          <button 
          onClick={() => navigate("/requests")}
          className={location.pathname === "/requests" ? "active" : ""}
          >
            <Inbox size={18} />
            <span>Received Requests</span>
          </button>

          <button 
          onClick={() => {
            setUnreadNotificationsCount(0);
            navigate("/notifications");
          }} 
          className={location.pathname === "/notifications" ? "active" : ""}
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="badge">{unreadNotificationsCount}</span>
            )}
          </button>

          <button 
          onClick={() => navigate("/chats")} 
          className={location.pathname === "/chats" ? "active" : ""}
          >
            <MessageCircle size={18} />
            <span>My Chats</span>
            {unreadChatsCount > 0 && (
              <span className="badge">{unreadChatsCount}</span>
            )}
          </button>
        </nav>
      </aside>

      {/* MAIN AREA */}
      <div className="main">
        <header className="topbar">
          <span className="user-name">{user?.name}</span>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
