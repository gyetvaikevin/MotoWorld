import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import useConversation from "../../hooks/chat/useConversation";
import usePartner from "../../hooks/chat/usePartner";
import useCurrentUserData from "../../hooks/chat/useCurrentUserData";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatMediaModal from "./ChatMediaModal";
import ChatModals from "./ChatModals";
import "../../styles/ChatWindow.css";

const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";
const DEFAULT_AVATAR = "/default-avatar.png";

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const [convMeta, setConvMeta] = useState(null);
  const partner = usePartner(convMeta, user);
  const currentUserData = useCurrentUserData(user);
  const { messages, sendMessage } = useConversation(conversation, user);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const scrollRef = useRef(null);

  // Meta betöltés beszélgetés alapján
  useEffect(() => {
    let alive = true;
    setConvMeta(null);

    const loadConv = async () => {
      const convId = conversation?.id;
      if (!convId || !user?.uid) return;

      try {
        const refConv = doc(db, "conversations", convId);
        const snap = await getDoc(refConv);
        if (!alive) return;

        if (!snap.exists()) {
          setConvMeta(null);
          return;
        }

        const data = snap.data();
        const parts = Array.isArray(data.participants) ? data.participants : [];
        if (!parts.includes(user.uid)) {
          setConvMeta(null);
          return;
        }

        setConvMeta({
          id: convId,
          participants: parts,
          createdAt: data.createdAt,
          isGroup: !!data.isGroup,
          name: data.name || (data.isGroup ? "Névtelen csoport" : null),
          photoURL: data.photoURL || (data.isGroup ? DEFAULT_GROUP_AVATAR : null),
        });
      } catch (err) {
        console.error("❌ Conversation betöltési hiba:", err);
        setConvMeta(null);
      }
    };

    loadConv();
    return () => {
      alive = false;
    };
  }, [conversation?.id, user?.uid]);

  // Olvasatlan üzenetek olvasottra állítása + autoscroll
  useEffect(() => {
    if (!user?.uid || !convMeta?.id || !convMeta.participants?.includes(user.uid)) {
      return;
    }

    const q = query(
      collection(db, "conversations", convMeta.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      if (snap.docs.length > 0) {
        const batch = writeBatch(db);
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.readBy || !data.readBy.includes(user.uid)) {
            batch.update(docSnap.ref, { readBy: arrayUnion(user.uid) });
          }
        });
        batch.commit();
      }

      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 50);
      }
    });

    return () => unsub();
  }, [user?.uid, convMeta?.id, convMeta?.participants]);

  return (
    <div className="chat-window">
      <ChatHeader
        convMeta={convMeta}
        partner={partner}
        onEdit={() => setShowEditGroup(true)}
        onMembers={() => setShowMembers(true)}
        onAddMember={() => setShowAddMember(true)}
      />

      <div className="chat-messages" ref={scrollRef}>
        <ChatMessages
          messages={messages}
          convMeta={convMeta}
          user={user}
          currentUserData={currentUserData}
          onSelectMedia={setSelectedMedia}
          // privát chat fallback képhez átadjuk a partner fotót
          partnerPhotoURL={partner?.photoURL || DEFAULT_AVATAR}
        />
      </div>

      <ChatInput onSend={sendMessage} />

      <ChatMediaModal
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <ChatModals
        convMeta={convMeta}
        showAddMember={showAddMember}
        setShowAddMember={setShowAddMember}
        showEditGroup={showEditGroup}
        setShowEditGroup={setShowEditGroup}
        showMembers={showMembers}
        setShowMembers={setShowMembers}
        setConvMeta={setConvMeta}
      />
    </div>
  );
}