// src/components/profile/DeleteProfileButton.jsx
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { auth, db, storage } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR = "/default-avatar.png";

// Segédfüggvény: Firebase Storage törlés URL-ből vagy path-ból
async function deleteStorageByPathOrUrl(pathOrUrl) {
  if (!pathOrUrl) return;
  const isFirebaseUrl =
    typeof pathOrUrl === "string" &&
    (pathOrUrl.includes("firebasestorage.googleapis.com") ||
      pathOrUrl.startsWith("profilePics/") ||
      pathOrUrl.startsWith("bikePics/") ||
      pathOrUrl.startsWith("eventImages/") ||
      pathOrUrl.startsWith("marketplace/") ||
      pathOrUrl.startsWith("postImages/"));

  if (!isFirebaseUrl) return;

  try {
    let fullPath = pathOrUrl;
    if (fullPath.includes("firebasestorage.googleapis.com")) {
      const pathStart = fullPath.indexOf("/o/") + 3;
      const pathEnd = fullPath.indexOf("?");
      fullPath = decodeURIComponent(fullPath.substring(pathStart, pathEnd));
    }
    const storageRef = ref(storage, fullPath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn("Storage törlés nem sikerült:", err);
  }
}

// Kaszkád törlés: események + képeik
async function deleteUserEventsCascade(uid) {
  const q = query(collection(db, "events"), where("createdByUid", "==", uid));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    const imagePath = data.imagePath || data.imageUrl || null;
    await deleteStorageByPathOrUrl(imagePath);
    await deleteDoc(doc(db, "events", d.id));
  }
}

// Kaszkád törlés: marketplace hirdetések + képeik
async function deleteUserListingsCascade(uid) {
  const q = query(collection(db, "marketplace"), where("createdByUid", "==", uid));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    const images = Array.isArray(data.images)
      ? data.images
      : [data.imagePath || data.imageUrl].filter(Boolean);

    for (const img of images) {
      await deleteStorageByPathOrUrl(img);
    }
    await deleteDoc(doc(db, "marketplace", d.id));
  }
}

// Kaszkád törlés: posztok + képeik + kommentek
async function deleteUserPostsCascade(uid) {
  const q = query(collection(db, "posts"), where("createdByUid", "==", uid));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();

    const imagePath = data.imagePath || data.imageUrl || null;
    await deleteStorageByPathOrUrl(imagePath);

    const commentsSnap = await getDocs(collection(db, "posts", d.id, "comments"));
    for (const c of commentsSnap.docs) {
      await deleteDoc(doc(db, "posts", d.id, "comments", c.id));
    }

    await deleteDoc(doc(db, "posts", d.id));
  }
}

// Kaszkád törlés: chat beszélgetések + üzenetek
async function deleteUserConversationsCascade(uid) {
  const q = query(collection(db, "conversations"), where("participants", "array-contains", uid));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    // üzenetek törlése
    const messagesSnap = await getDocs(collection(db, "conversations", d.id, "messages"));
    for (const m of messagesSnap.docs) {
      await deleteDoc(doc(db, "conversations", d.id, "messages", m.id));
    }
    // beszélgetés törlése
    await deleteDoc(doc(db, "conversations", d.id));
  }
}

// Kaszkád törlés: felhasználói profil képek (photoURL, bikeImage)
async function deleteUserProfileImages(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const data = snap.data();

  if (data.photoURL && data.photoURL !== DEFAULT_AVATAR) {
    await deleteStorageByPathOrUrl(data.photoURL);
  }
  if (data.bikeImage) {
    await deleteStorageByPathOrUrl(data.bikeImage);
  }
}

export default function DeleteProfileButton() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDeleteProfile = async () => {
    if (!user?.uid) return;

    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd a profilodat? Minden saját eseményed, hirdetésed, posztod és üzeneted is törlődik. A művelet nem visszavonható!"
    );
    if (!confirmed) return;

    try {
      // 1) Reauth
      const providerId = user.providerData[0]?.providerId;
      if (providerId === "password") {
        const password = prompt("Add meg újra a jelszavad a törléshez:");
        if (!password) {
          alert("A törléshez meg kell adnod a jelszavad.");
          return;
        }
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
      } else if (providerId === "google.com") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
      }

      const uid = user.uid;

      // 2) Kaszkád törlés: saját tartalom
      await deleteUserProfileImages(uid);
      await deleteUserEventsCascade(uid);
      await deleteUserListingsCascade(uid);
      await deleteUserPostsCascade(uid);
      await deleteUserConversationsCascade(uid);

      // 3) Users doc törlése
      await deleteDoc(doc(db, "users", uid));

      // 4) Auth user törlése
      await deleteUser(auth.currentUser);

      alert("A profilod és minden saját tartalmad sikeresen törölve lett.");
      navigate("/register");
    } catch (err) {
      console.error("❌ Profil törlési hiba:", err);
      alert("Hiba történt a profil törlése közben: " + err.message);
    }
  };

  return (
    <button
      onClick={handleDeleteProfile}
      style={{
        backgroundColor: "red",
        color: "white",
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Profil törlése
    </button>
  );
}
