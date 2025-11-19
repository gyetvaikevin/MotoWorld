// src/components/comments/Comments.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import LoaderWrapper from "../common/LoaderWrapper";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import "./Comments.css";
import { notifyUser } from "../../utils/notifyUser";

export default function Comments({ parentId, parentType = "events", user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const commentsQuery = query(
      collection(db, parentType, parentId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(commentsQuery, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [parentType, parentId]);

  const addComment = async (text) => {
    if (!user) {
      return alert("Be kell jelentkezned a kommenteléshez!");
    }
    if (!text.trim()) {
      return;
    }

    // 1) Lekérjük a szülő dokumentumot az értesítéshez
    const parentRef = doc(db, parentType, parentId);
    const parentSnap = await getDoc(parentRef);
    const parentData = parentSnap.exists() ? parentSnap.data() : {};

    // 2) Komment felvitele
    await addDoc(collection(db, parentType, parentId, "comments"), {
      text,
      createdAt: serverTimestamp(),
      createdBy: user.email,
      createdByUid: user.uid,
      authorName: user.displayName || "Ismeretlen",
      authorPhoto: user.photoURL || "/default-avatar.png",
    });

    // 3) Értesítés küldése, ha nem a saját posztod/eseményed alá írtál
    if (parentData.createdByUid && parentData.createdByUid !== user.uid) {
      await notifyUser({
        type: "comment", // típusos értesítés
        senderId: user.uid,
        senderName: user.displayName || "Ismeretlen",
        senderPhoto: user.photoURL || "/default-avatar.png",
        receiverId: parentData.createdByUid,
        relatedId: parentId,
      });
    }
  };

  const deleteComment = async (commentId) => {
    if (!user) return;
    await deleteDoc(doc(db, parentType, parentId, "comments", commentId));
  };

  return (
    <div className="comments-container">
      <h4>Kommentek</h4>

      {loading ? (
        <LoaderWrapper text="Kommentek betöltése..." />
      ) : comments.length > 0 ? (
        comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            user={user}
            onDelete={() => deleteComment(c.id)}
          />
        ))
      ) : (
        <p>Nincsenek kommentek</p>
      )}

      {user && <CommentForm onSubmit={addComment} />}
    </div>
  );
}
