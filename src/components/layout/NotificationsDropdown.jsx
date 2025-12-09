// src/components/layout/NotificationsDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import NotificationList from "../notifications/NotificationList";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Notifications.css";

export default function NotificationsDropdown({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // Klikk kívülre bezárás
  useEffect(() => {
    const handleClick = (e) => {
      if (!dropdownRef.current) return;
      const clickedInside = dropdownRef.current.contains(e.target);
      if (!clickedInside) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = () => setOpen((prev) => !prev);

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className="notifications-dropdown" ref={dropdownRef}>
      {/* Trigger: nincs class, csak interakció */}
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Értesítések"
      >
        {children}
      </span>

      {open && (
        <div className="dropdown-menu">
          <h4>Értesítések</h4>
          <NotificationList user={user} />
        </div>
      )}
    </div>
  );
}