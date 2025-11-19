// src/components/notifications/NotificationBell.jsx
import { useAuth } from "../../contexts/AuthContext";
import useNotifications from "../../hooks/notifications/useNotifications";
import "./Notifications.css";

export default function NotificationBell({ onClick }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.uid);

  return (
    <button className="notification-bell" onClick={onClick}>
      🔔
      {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </button>
  );
}
