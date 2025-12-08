// src/components/layout/Navbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { FaMotorcycle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import "../../styles/Navbar.css";
import { useFriendRequestCount } from "../../hooks/friends/useFriendRequestCount";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function Navbar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
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
    <nav className="navbar">
      <div className="nav-left">
        <NavLink to="/" className="nav-logo">
          <img src="/MotoWorld-logo.png" alt="MotoWorld" className="logo-img" />
        </NavLink>
      </div>

      <div className="nav-center">
        <NavLink to="/events" className="nav-icon">
          <img
            src="/events-logo.png"
            alt="Események"
            className="nav-icon-img"
          />
        </NavLink>
        <NavLink to="/marketplace" className="nav-icon">
          <img
            src="/marketplace-logo.png"
            alt="Marketplace"
            className="nav-icon-img"
          />
        </NavLink>
        <NavLink to="/messages" className="nav-icon">
          <img src="/chat-icon.png" alt="Chat" className="nav-icon-img" />
        </NavLink>
      </div>

      {/* Jobb oldal: profil + logout */}
      <div className="nav-right">
        {user && (
          <>
            <NavLink to="/friends" className="friends-link">
              Barátok{" "}
              {friendRequestCount > 0 && (
                <span className="badge">{friendRequestCount}</span>
              )}
            </NavLink>
            <div className="notifications-link">
              <NotificationsDropdown />
              {notifCount > 0 && <span className="badge">{notifCount}</span>}
            </div>
            <NavLink to={`/profile/${user.uid}`} className="profile-link">
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
            <button className="logout-btn" onClick={handleLogout}>
              Kijelentkezés
            </button>
          </>
        )}
        {!user && (
          <>
            <NavLink to="/login">Bejelentkezés</NavLink>
            <NavLink to="/register">Regisztráció</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
