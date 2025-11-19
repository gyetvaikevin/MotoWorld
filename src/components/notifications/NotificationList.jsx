// src/components/notifications/NotificationList.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/notifications/useNotifications";
import useUsers from "../../hooks/useUsers";
import { formatDistanceToNow } from "date-fns";
import "./Notifications.css";

export default function NotificationList({ user }) {
  const { notifications, markAsRead } = useNotifications(user?.uid);
  const navigate = useNavigate();

  const senderIds = useMemo(
    () => notifications.map((n) => n.senderId).filter(Boolean),
    [notifications]
  );

  const usersMap = useUsers(senderIds);

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return <p className="no-notifications">Nincsenek új értesítéseid</p>;
  }

  const getNotificationContent = (n, name) => {
    switch (n.type) {
      case "like":
        return (
          <>
            <span className="notif-icon">👍</span> {name} lájkolta az eseményedet.
          </>
        );
      case "comment":
        return (
          <>
            <span className="notif-icon">💬</span> {name} hozzászólt az eseményedhez.
          </>
        );
      case "message":
        return (
          <>
            <span className="notif-icon">📩</span> {name} üzent neked.
          </>
        );
      case "friendRequest":
        return (
          <>
            <span className="notif-icon">🤝</span> {name} barátkérést küldött.
          </>
        );
      case "friendRequestAccepted":
        return (
          <>
            <span className="notif-icon">✅</span> {name} elfogadta a barátkérésedet.
          </>
        );
      default:
        return (
          <>
            <span className="notif-icon">🔔</span> {name} értesítést küldött.
          </>
        );
    }
  };

  const handleClick = async (n) => {
    await markAsRead(n.id);

    switch (n.type) {
      case "like":
      case "comment":
        if (n.relatedId) navigate(`/events/${n.relatedId}`);
        break;
      case "message":
        if (n.relatedId) navigate(`/chat/${n.relatedId}`);
        else navigate("/chat");
        break;
      case "friendRequest":
      case "friendRequestAccepted":
        if (n.relatedId) navigate(`/profile/${n.relatedId}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="notification-list">
      {notifications.map((n) => {
        const profile = usersMap[n.senderId] || {};
        const name = profile.displayName || n.senderName || "Ismeretlen";
        const photo = profile.photoURL || n.senderPhoto || "";

        return (
          <div
            key={n.id}
            className={`notification-item${n.read ? "" : " unread"}`}
            onClick={() => handleClick(n)}
          >
            {photo && (
              <img
                src={photo}
                alt={name}
                className="notification-avatar"
              />
            )}
            <div className="notification-content">
              <p className="notification-text">
                {getNotificationContent(n, name)}
              </p>
              <span className="notification-time">
                {n.createdAt
                  ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true })
                  : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
