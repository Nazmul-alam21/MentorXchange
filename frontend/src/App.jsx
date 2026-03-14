import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Login from "./pages/login";
import Signup from "./pages/signup";

import Dashboard from "./pages/dashboard";
import Profile from "./pages/profile";
import MentorMatches from "./pages/MentorMatches";
import ReceivedRequests from "./pages/ReceivedRequest";
import Notifications from "./pages/Notifications";
import Chats from "./pages/Chats";
import Chat from "./pages/Chat";
import ProfileView from "./pages/ProfileView";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Landing />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" />}
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/matches" element={<MentorMatches />} />
          <Route path="/requests" element={<ReceivedRequests />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/profile/view/:userId" element={<ProfileView />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
