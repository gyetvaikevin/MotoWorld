// src/components/chat/ChatWindow.jsx
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
  writeBatch,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebase";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "./Chat.css";
import ChatInput from "./ChatInput";
import UserNameLink from "../profile/UserNameLink";
import EditGroupModal from "./EditGroupModal";
import AddMemberModal from "./AddMemberModal";
import GroupMembersModal from "./GroupMembersModal";

const DEFAULT_AVATAR = "/default-avatar.png";
const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();

  const [convMeta, setConvMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const scrollRef = useRef(null);

  // Saját user Firestore adatai
  useEffect(() => {
    if (!user?.uid) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) setCurrentUserData(snap.data());
    });
  }, [user?.uid]);

  // Conversation meta lekérése és id-váltáskor állapot reset
  useEffect(() => {
    let alive = true;

    // id-váltáskor azonnal töröljük a régi állapotokat, hogy ne villogjon a korábbi név
    setConvMeta(null);
    setPartner(null);
    setMessages([]);

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

        // Ne jeleníts meg olyan beszélgetést, ahol nem résztvevő az aktuális user
        if (!parts.includes(user.uid)) {
          setConvMeta(null);
          return;
        }

        setConvMeta({
          id: convId,
          participants: parts,
          createdAt: data.createdAt,
          isGroup: data.isGroup || false,
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

  // Partner adatainak lekérése privát chatnél, versenyhelyzet-védelem
  useEffect(() => {
    // minden convMeta-váltáskor nullázzuk a partner-t
    setPartner(null);

    const fetchPartner = async () => {
      if (!convMeta?.participants || !user?.uid || convMeta?.isGroup) return;

      const currentConvId = convMeta.id;
      const partnerId = convMeta.participants.find((uid) => uid !== user.uid);
      if (!partnerId) return;

      // token az aktuális conv-hoz
      let alive = true;

      try {
        const refUser = doc(db, "users", partnerId);
        const snap = await getDoc(refUser);
        if (!alive) return;

        if (snap.exists()) {
          const d = snap.data();
          setPartner({
            id: partnerId,
            displayName: d.displayName || partnerId,
            photoURL: d.photoURL || DEFAULT_AVATAR,
          });
        } else {
          setPartner({
            id: partnerId,
            displayName: partnerId,
            photoURL: DEFAULT_AVATAR,
          });
        }
      } catch (err) {
        console.error("❌ Partner betöltési hiba:", err);
      }

      // cleanup csak akkor, ha közben új konverzióra váltottunk
      return () => {
        alive = false;
      };
    };

    const cleanup = fetchPartner();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [convMeta?.id, convMeta?.participants, convMeta?.isGroup, user?.uid]);

  // Üzenetek snapshot + olvasatlanok olvasottra állítása
  useEffect(() => {
    if (!user?.uid || !convMeta?.id || !convMeta.participants?.includes(user.uid)) {
      return;
    }

    const q = query(
      collection(db, "conversations", convMeta.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);

      if (list.length > 0) {
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
        // kis delay a gördítéshez
        setTimeout(() => {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }, 50);
      }
    });

    return () => unsub();
  }, [user?.uid, convMeta?.id, convMeta?.participants]);

  // Üzenetküldés
  const sendMessage = async (msg) => {
    if (!user?.uid || !convMeta?.participants || !convMeta?.id) return;

    try {
      if (msg.type === "text") {
        await addDoc(collection(db, "conversations", convMeta.id, "messages"), {
          senderId: user.uid,
          type: "text",
          text: msg.text,
          createdAt: serverTimestamp(),
          readBy: [user.uid], // a küldő olvasottnak számít
        });
      } else if (msg.type === "file") {
        const fileRef = ref(
          storage,
          `chat/${convMeta.id}/${Date.now()}-${msg.file.name}`
        );
        await uploadBytes(fileRef, msg.file);
        const url = await getDownloadURL(fileRef);

        await addDoc(collection(db, "conversations", convMeta.id, "messages"), {
          senderId: user.uid,
          type: msg.file.type.startsWith("video") ? "video" : "image",
          mediaUrl: url,
          createdAt: serverTimestamp(),
          readBy: [user.uid],
        });
      }
    } catch (err) {
      console.error("❌ Üzenetküldési hiba:", err);
    }
  };

  return (
    <div className="chat-window">
      {/* Fejléc */}
      <div className="chat-header">
        {convMeta?.isGroup ? (
          <>
            <img
              src={convMeta?.photoURL || DEFAULT_GROUP_AVATAR}
              alt={convMeta?.name || "Csoport"}
              className="chat-header-avatar"
            />
            <h3 className="chat-header-name">
              {convMeta?.name || "Névtelen csoport"}
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
              src={(partner && partner.photoURL) || DEFAULT_AVATAR}
              alt={(partner && partner.displayName) || "Partner"}
              className="chat-header-avatar"
            />
            <h3 className="chat-header-name">
              {partner?.id ? (
                <UserNameLink uid={partner.id} displayName={partner.displayName} />
              ) : (
                "Betöltés..."
              )}
            </h3>
          </>
        )}

        {/* Plusz gomb mindig látszik */}
        <button
          className="add-member-btn"
          onClick={() => setShowAddMember(true)}
        >
          +
        </button>
      </div>

      {/* Üzenetek */}
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${
              msg.senderId === user?.uid ? "self" : "partner"
            }`}
          >
            <img
              src={
                msg.senderId === user?.uid
                  ? currentUserData?.photoURL || DEFAULT_AVATAR
                  : convMeta?.isGroup
                  ? msg.senderPhotoURL || DEFAULT_AVATAR
                  : (partner && partner.photoURL) || DEFAULT_AVATAR
              }
              alt="avatar"
              className="chat-avatar"
            />
            {(!msg.type || msg.type === "text") && (
              <div className="bubble">{msg.text}</div>
            )}
            {msg.type === "image" && (
              <img
                src={msg.mediaUrl}
                alt="kép"
                className="chat-media"
                onClick={() =>
                  setSelectedMedia({ url: msg.mediaUrl, type: "image" })
                }
              />
            )}
            {msg.type === "video" && (
              <video
                controls
                className="chat-media"
                onClick={() =>
                  setSelectedMedia({ url: msg.mediaUrl, type: "video" })
                }
              >
                <source src={msg.mediaUrl} type="video/mp4" />
              </video>
            )}
          </div>
        ))}
      </div>

      {/* Üzenetküldő komponens */}
      {/* Ha nálad ChatInput külön fájl, maradjon így: */}
      {/* importált ChatInput használata */}
      {/* Itt csak meghívjuk */}
      {/* Ha inline szeretnéd, át tudom írni külön kérésre */}
      {/* eslint-disable-next-line */}
      <ChatInput onSend={sendMessage} />

      {/* Média nagyítás */}
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

      {/* Tag hozzáadás */}
      {showAddMember && (
        <AddMemberModal
          convId={convMeta?.id}
          onClose={(result) => {
            setShowAddMember(false);
            if (result?.newConvId) {
              // csak az id-t frissítjük, a meta újra lekérődik az useEffect-ből
              setConvMeta((prev) =>
                prev ? { ...prev, id: result.newConvId } : prev
              );
            }
          }}
        />
      )}

      {/* Csoport szerkesztés */}
      {showEditGroup && (
        <EditGroupModal
          convId={convMeta?.id}
          currentName={convMeta?.name}
          currentPhoto={convMeta?.photoURL}
          onClose={(updated) => {
            setShowEditGroup(false);
            if (updated) {
              setConvMeta((prev) =>
                prev
                  ? {
                      ...prev,
                      name: updated.name,
                      photoURL: updated.photoURL,
                      isGroup: true,
                    }
                  : prev
              );
            }
          }}
        />
      )}

      {/* Taglista megnyitása */}
      {showMembers && convMeta?.participants && (
        <GroupMembersModal
          participants={convMeta.participants}
          onClose={() => setShowMembers(false)}
        />
      )}
    </div>
  );
}

