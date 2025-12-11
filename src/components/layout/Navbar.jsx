// src/components/layout/Navbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import ChatSidebar from "../chat/ChatSidebar"; // <-- hozzáadva
import "../../styles/Navbar.css";
import { useFriendRequestCount } from "../../hooks/friends/useFriendRequestCount";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function Navbar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false); // mobilos trigger
  const navigate = useNavigate();
  const friendRequestCount = useFriendRequestCount();

  useEffect(() => {
    if (!user?.uid) {
      setProfile(null);
      return;
    }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
      else setProfile(null);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", user.uid),
      where("read", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifCount(snap.size);
    });
    return () => unsub();
  }, [user?.uid]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        {/* Bal oldal: logó */}
        <div className="nav-left">
          <NavLink to="/" className="nav-logo">
            <img
              src="/MotoWorld-logo.png"
              alt="MotoWorld"
              className="logo-img"
            />
          </NavLink>
        </div>

        {/* Közép: ikonok (csak desktopon) */}
        <div className="nav-center desktop-only">
          <NavLink
            to="/events"
            className="nav-icon"
            data-label="Események"
            aria-label="Események"
          >
            <img
              src="/events-logo.png"
              alt="Események"
              className="nav-icon-img"
            />
          </NavLink>

          <NavLink
            to="/marketplace"
            className="nav-icon"
            data-label="Marketplace"
            aria-label="Marketplace"
          >
            <img
              src="/marketplace-logo.png"
              alt="Marketplace"
              className="nav-icon-img"
            />
          </NavLink>

          {/* Desktopon továbbra is a /messages route */}
          <NavLink
            to="/messages"
            className="nav-icon"
            data-label="Chat"
            aria-label="Chat"
          >
            <img src="/chat-icon.png" alt="Chat" className="nav-icon-img" />
          </NavLink>

          <NavLink
            to="/friends"
            className="nav-icon"
            data-label="Ismerősök"
            aria-label="Ismerősök"
          >
            <img
              src="/friends-icon.png"
              alt="Ismerősök"
              className="nav-icon-img"
            />
            {friendRequestCount > 0 && (
              <span className="nav-badge">{friendRequestCount}</span>
            )}
          </NavLink>
        </div>

        {/* Jobb oldal: értesítések + profil + logout */}
        <div className="nav-right">
          {user && (
            <>
              <div
                className="nav-icon"
                data-label="Értesítések"
                aria-label="Értesítések"
              >
                <NotificationsDropdown>
                  <img
                    src="/notifications-icon.png"
                    alt="Értesítések"
                    className="nav-icon-img"
                  />
                </NotificationsDropdown>
                {notifCount > 0 && (
                  <span className="nav-badge">{notifCount}</span>
                )}
              </div>

              <NavLink
                to={`/profile/${user.uid}`}
                className="profile-link"
                aria-label="Profil"
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt="Profil"
                    className="nav-profile-pic"
                  />
                ) : (
                  <div className="nav-profile-placeholder">
                    {profile?.displayName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </NavLink>

              {/* 🔁 Kijelentkezés ikon gombbal */}
              <button
                className="nav-icon"
                aria-label="Kijelentkezés"
                onClick={handleLogout}
                data-label="Kilépés"
              >
                <img
                  src="/logout-icon.png"
                  alt="Logout"
                  className="nav-icon-img"
                />
              </button>
            </>
          )}
          {!user && (
            <>
              {/* Login ikon */}
              <NavLink
                to="/login"
                className="nav-icon"
                aria-label="Bejelentkezés"
                data-label="Belépés"
              >
                <img
                  src="/signin-icon.png"
                  alt="Login"
                  className="nav-icon-img"
                />
              </NavLink>

              {/* Register ikon */}
              <NavLink
                to="/register"
                className="nav-icon"
                aria-label="Regisztráció"
                data-label="Regisztráció"
              >
                <img
                  src="/register-icon.png"
                  alt="Register"
                  className="nav-icon-img"
                />
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {/* Mobilos alsó navbar */}
      <div className="nav-bottom mobile-only">
        <NavLink to="/events" className="nav-icon" aria-label="Események">
          <img
            src="/events-logo.png"
            alt="Események"
            className="nav-icon-img"
          />
        </NavLink>
        <NavLink
          to="/marketplace"
          className="nav-icon"
          aria-label="Marketplace"
        >
          <img
            src="/marketplace-logo.png"
            alt="Marketplace"
            className="nav-icon-img"
          />
        </NavLink>

        {/* Mobilon a Chat ikon → ChatSidebar nyitása/zárása */}
        <button
          className="nav-icon"
          aria-label="Chat"
          onClick={() => setChatOpen(!chatOpen)} // <-- toggle
        >
          <img src="/chat-icon.png" alt="Chat" className="nav-icon-img" />
        </button>

        <NavLink to="/friends" className="nav-icon" aria-label="Ismerősök">
          <img
            src="/friends-icon.png"
            alt="Ismerősök"
            className="nav-icon-img"
          />
          {friendRequestCount > 0 && (
            <span className="nav-badge">{friendRequestCount}</span>
          )}
        </NavLink>
      </div>

      {/* ChatSidebar mobilon, toggle gomb nélkül */}
      {chatOpen && (
        <ChatSidebar
          mobileTrigger={true}
          open={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}
