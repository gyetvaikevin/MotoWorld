// src/hooks/notifications/useNotifications.js

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";

/**
 * Named export so you can import { useNotifications } …
 * Default export so you can import useNotifications …
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      // nincs user → reset state
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // fetch notifications for this user, newest first
    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });

    return () => unsub();
  }, [userId]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error("❌ hiba értesítés olvasottá tételénél:", err);
    }
  };

  /**
   * Helper: ikon + szöveg a type alapján
   */
  const getNotificationContent = (notif, name) => {
    switch (notif.type) {
      case "like":
        return { icon: "👍", text: `${name} lájkolta a bejegyzésedet.` };
      case "comment":
        return { icon: "💬", text: `${name} hozzászólt a bejegyzésedhez.` };
      case "message":
        return { icon: "📩", text: `${name} üzent neked.` };
      case "friendRequest":
        return { icon: "🤝", text: `${name} barátkérést küldött.` };
      default:
        return { icon: "🔔", text: `${name} értesítést küldött.` };
    }
  };

  return { notifications, unreadCount, markAsRead, getNotificationContent };
}

// keep default export for ease of import
export default useNotifications;
