
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const DEFAULT_AVATAR = "/default-avatar.png";

export default function usePartner(convMeta, user) {
  const [partner, setPartner] = useState(null);

  useEffect(() => {
    if (!convMeta?.participants || !user?.uid || convMeta?.isGroup) return;
    const partnerId = convMeta.participants.find((uid) => uid !== user.uid);
    if (!partnerId) return;

    const fetchPartner = async () => {
      try {
        const snap = await getDoc(doc(db, "users", partnerId));
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
    };

    fetchPartner();
  }, [convMeta?.id, convMeta?.participants, convMeta?.isGroup, user?.uid]);

  return partner;
}