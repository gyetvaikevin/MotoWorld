// src/components/layout/NotificationsDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import NotificationList from "../notifications/NotificationList";
import { useAuth } from "../../contexts/AuthContext";
import { FaBell } from "react-icons/fa";
import "../notifications/Notifications.css";

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Klikk kívülre bezárás
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FaBell />
      </button>
      {open && (
        <div className="dropdown-menu">
          <h4>Értesítések</h4>
          <NotificationList user={user} />
        </div>
      )}
    </div>
  );
}
