import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import ChatInput from "./ChatInput";
import useConversation from "../../hooks/chat/useConversation";
import { db } from "../../services/firebase";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import "./Chat.css";
import AddMemberModal from "./AddMemberModal";
import EditGroupModal from "./EditGroupModal";
import GroupMembersModal from "./GroupMembersModal"; // 🔧 új komponens import

const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export default function ChatThread({
  conversation,
  onBack,
  onNavigateToConversation,
}) {
  const { user } = useAuth();
  const { messages, sendMessage } = useConversation(conversation);
  const [partner, setPartner] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showMembers, setShowMembers] = useState(false); // 🔧 új state
  const [convMeta, setConvMeta] = useState(conversation);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setCurrentUserData(snap.data());
    });
  }, [user]);

  useEffect(() => {
    const loadPartner = async () => {
      if (!convMeta?.participants || !user?.uid || convMeta?.isGroup) return;
      const partnerId = convMeta.participants.find((id) => id !== user.uid);
      if (!partnerId) return;
      const snap = await getDoc(doc(db, "users", partnerId));
      if (snap.exists()) setPartner(snap.data());
    };
    loadPartner();
  }, [convMeta, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (messages.length > 0 && user?.uid && convMeta?.id) {
      const batch = writeBatch(db);
      messages.forEach((m) => {
        if (!m.readBy || !m.readBy.includes(user.uid)) {
          batch.update(
            doc(db, "conversations", convMeta.id, "messages", m.id),
            { readBy: [...(m.readBy || []), user.uid] }
          );
        }
      });
      batch.commit();
    }
  }, [messages, user, convMeta?.id]);

  return (
    <div className="chat-thread">
      <button onClick={onBack}>← Vissza</button>

      <div className="chat-header">
        {convMeta.isGroup ? (
          <>
            <img
              src={convMeta.photoURL || DEFAULT_GROUP_AVATAR}
              alt={convMeta.name || "Csoport"}
              className="chat-header-avatar"
            />
            <h3 className="chat-header-name">
              {convMeta.name || "Névtelen csoport"}
              <button
                className="edit-group-btn"
                onClick={() => setShowEditGroup(true)}
              >
                ✎
              </button>
              <button
                className="members-btn"
                onClick={() => setShowMembers(true)}
              >
                👥
              </button>
            </h3>
          </>
        ) : (
          <>
            <img
              src={partner?.photoURL || DEFAULT_AVATAR}
              alt={partner?.displayName || "Partner"}
              className="chat-header-avatar"
            />
            <h3 className="chat-header-name">
              {partner?.displayName || "Ismeretlen"}
            </h3>
          </>
        )}

        <button
          className="add-member-btn"
          onClick={() => setShowAddMember(true)}
        >
          +
        </button>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-message ${
              m.senderId === user.uid ? "self" : "partner"
            }`}
          >
            <img
              src={
                m.senderId === user.uid
                  ? currentUserData?.photoURL || DEFAULT_AVATAR
                  : convMeta.isGroup
                  ? m.senderPhotoURL || DEFAULT_AVATAR
                  : partner?.photoURL || DEFAULT_AVATAR
              }
              alt="avatar"
              className="chat-avatar"
            />
            {(!m.type || m.type === "text") && (
              <div className="bubble">{m.text}</div>
            )}
            {m.type === "image" && (
              <img
                src={m.mediaUrl}
                alt="kép"
                className="chat-media"
                onClick={() =>
                  setSelectedMedia({ url: m.mediaUrl, type: "image" })
                }
              />
            )}
            {m.type === "video" && (
              <video
                controls
                className="chat-media"
                onClick={() =>
                  setSelectedMedia({ url: m.mediaUrl, type: "video" })
                }
              >
                <source src={m.mediaUrl} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
      </div>

      <ChatInput onSend={sendMessage} />

      {selectedMedia && (
        <div
          className="chat-modal-overlay"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="chat-modal-content">
            {selectedMedia.type === "image" ? (
              <img src={selectedMedia.url} alt="Nagyított kép" />
            ) : (
              <video controls autoPlay>
                <source src={selectedMedia.url} type="video/mp4" />
              </video>
            )}
          </div>
        </div>
      )}

      {showAddMember && (
        <AddMemberModal
          convId={convMeta.id}
          onClose={(result) => {
            setShowAddMember(false);
            if (result?.newConvId) {
              onNavigateToConversation(result.newConvId);
            }
          }}
        />
      )}

      {showEditGroup && (
        <EditGroupModal
          convId={convMeta.id}
          currentName={convMeta.name}
          currentPhoto={convMeta.photoURL}
          onClose={(updated) => {
            setShowEditGroup(false);
            if (updated) {
              setConvMeta((prev) => ({
                ...prev,
                name: updated.name,
                photoURL: updated.photoURL,
                isGroup: true,
              }));
            }
          }}
        />
      )}

      {showMembers && (
        <GroupMembersModal
          participants={convMeta.participants}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}
