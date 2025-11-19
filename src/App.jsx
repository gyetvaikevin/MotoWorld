// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FriendProvider } from "./contexts/FriendContext";

import Navbar from "./components/layout/Navbar";
import ChatSidebar from "./components/chat/ChatSidebar";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Profile from "./pages/Profile";
import ProfileEdit from "./components/profile/ProfileEdit";
import Friends from "./pages/Friends";
import ChatPage from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Marketplace from "./pages/Marketplace";
import AddListing from "./pages/AddListing";
import ListingDetails from "./pages/ListingDetails";
import EditListing from "./pages/EditListing";
import Login from "./pages/Login";
import Register from "./pages/Register";

import "./styles/App.css";

// 🔒 PrivateRoute komponens
function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <FriendProvider>
        <Router>
          <Navbar />
          <div className="app-container">
            <SidebarArea />
            <main className="page-container">
              <Routes>
                <Route path="/" element={<Home />} />

                {/* Marketplace */}
                <Route path="/marketplace" element={<Marketplace />} />
                <Route
                  path="/marketplace/add"
                  element={
                    <PrivateRoute>
                      <AddListing />
                    </PrivateRoute>
                  }
                />
                <Route path="/marketplace/:id" element={<ListingDetails />} />
                <Route
                  path="/marketplace/edit/:id"
                  element={
                    <PrivateRoute>
                      <EditListing />
                    </PrivateRoute>
                  }
                />

                {/* Események */}
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />

                {/* Chat */}
                <Route
                  path="/chat"
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/chat/:id"
                  element={
                    <PrivateRoute>
                      <ChatPage />
                    </PrivateRoute>
                  }
                />

                {/* Profil és barátok */}
                <Route
                  path="/profile/:uid"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <PrivateRoute>
                      <ProfileEdit />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <PrivateRoute>
                      <Friends />
                    </PrivateRoute>
                  }
                />

                {/* Értesítések */}
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  }
                />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 404 → főoldal */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </FriendProvider>
    </AuthProvider>
  );
}

// Kis komponens a sidebar pozicionálására
function SidebarArea() {
  const { user } = useAuth();
  return user ? <ChatSidebar /> : null;
}
