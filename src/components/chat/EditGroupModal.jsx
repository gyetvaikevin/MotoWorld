// src/components/chat/EditGroupModal.jsx
import { useState } from "react";
import { db, storage } from "../../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "../../styles/ChatModal.css";


const DEFAULT_GROUP_AVATAR = "/default-avatar-group.png";

export default function EditGroupModal({ convId, currentName, currentPhoto, onClose }) {
  const [name, setName] = useState(currentName || "Névtelen csoport");
  const [photoURL, setPhotoURL] = useState(currentPhoto || DEFAULT_GROUP_AVATAR);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    try {
      let finalPhotoURL = photoURL || DEFAULT_GROUP_AVATAR;
      if (file) {
        setUploading(true);
        const storageRef = ref(storage, `group-avatars/${convId}/${file.name}`);
        await uploadBytes(storageRef, file);
        finalPhotoURL = await getDownloadURL(storageRef);
        setUploading(false);
      }

      await updateDoc(doc(db, "conversations", convId), {
        name,
        photoURL: finalPhotoURL,
      });

      onClose({ name, photoURL: finalPhotoURL });
    } catch (err) {
      console.error("❌ Csoport frissítési hiba:", err);
      setUploading(false);
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Csoport szerkesztése</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Csoport neve..."
          style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
        />

        <img
          src={photoURL || DEFAULT_GROUP_AVATAR}
          alt="Csoport avatar"
          style={{ width: "64px", height: "64px", borderRadius: "50%", marginBottom: "0.5rem" }}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        <button onClick={handleSave} disabled={uploading}>
          {uploading ? "Feltöltés..." : "Mentés"}
        </button>
        <button onClick={onClose} style={{ marginLeft: "0.5rem" }}>Mégse</button>
      </div>
    </div>
  );
}