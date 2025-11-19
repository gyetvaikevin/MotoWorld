// src/components/layout/Navbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../../services/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { FaMotorcycle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import NotificationsDropdown from "./NotificationsDropdown";
import "./Navbar.css";
import { useFriendRequestCount } from "../../hooks/friends/useFriendRequestCount";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function Navbar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();
  const friendRequestCount = useFriendRequestCount();

  // Saját profil adatok
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

  // Olvasatlan értesítések számláló
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
      <div className="nav-logo">
        <NavLink to="/">
          <FaMotorcycle className="logo-icon" />
          MotoWorld
        </NavLink>
      </div>

      <ul className="nav-links">
        <li><NavLink to="/" end>Kezdőlap</NavLink></li>
        <li><NavLink to="/events">Események</NavLink></li>
        <li><NavLink to="/marketplace">Marketplace</NavLink></li>

        {user && (
          <>
            <li>
              <NavLink to="/friends" className="friends-link">
                Barátok{" "}
                {friendRequestCount > 0 && (
                  <span className="badge">{friendRequestCount}</span>
                )}
              </NavLink>
            </li>
            <li className="notifications-link">
              <NotificationsDropdown />
              {notifCount > 0 && (
                <span className="badge">{notifCount}</span>
              )}
            </li>
            <li>
              {/* 🔥 Itt javítva: mindig paraméteres útvonalra mutat */}
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
            </li>
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Kijelentkezés
              </button>
            </li>
          </>
        )}

        {!user && (
          <>
            <li><NavLink to="/login">Bejelentkezés</NavLink></li>
            <li><NavLink to="/register">Regisztráció</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  );
}
