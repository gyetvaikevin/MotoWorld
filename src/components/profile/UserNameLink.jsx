import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/Profile.css";

export default function UserNameLink({ uid, displayName }) {
  const [name, setName] = useState(displayName);

  useEffect(() => {
    // ha van displayName prop, azonnal frissítjük
    if (displayName) {
      setName(displayName);
      return;
    }

    // ha nincs, akkor lekérjük Firestore-ból
    const fetchName = async () => {
      if (uid) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            const data = snap.data();
            setName(data.displayName || "Ismeretlen");
          } else {
            setName("Ismeretlen");
          }
        } catch (err) {
          console.error("❌ Hiba a felhasználó lekérésekor:", err);
          setName("Ismeretlen");
        }
      }
    };
    fetchName();
  }, [uid, displayName]); // fontos: mindkettőre figyelünk

  return (
    <Link to={`/profile/${uid}`} className="profile-link">
      {name || "Ismeretlen"}
    </Link>
  );
}
