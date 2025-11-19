// src/components/profile/ProfileForm.jsx
import React, { useState, useEffect } from "react";
import { db, storage } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuth } from "../../contexts/AuthContext";
import LoaderWrapper from "../common/LoaderWrapper";
import ProfileImageUploader from "./ProfileImageUploader";

export default function ProfileForm() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bikeName, setBikeName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [bikeImage, setBikeImage] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [bikeFile, setBikeFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [bikePreview, setBikePreview] = useState(null);
  const [noBike, setNoBike] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const DEFAULT_AVATAR = "/default-avatar.png";

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setDisplayName(data.displayName || "");
        setBikeName(data.bikeName || "");
        setPhotoURL(data.photoURL || DEFAULT_AVATAR);
        setBikeImage(data.bikeImage || "");
        if (data.bikeName === "Nincs motorom") setNoBike(true);
      }
    };
    fetchUser();
  }, [user]);

  const uploadImage = async (file, path) => {
    if (!file || !user?.uid) return null;
    const storageRef = ref(storage, `${path}/${user.uid}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const deleteImage = async (url) => {
    if (!url || !url.includes("firebasestorage.googleapis.com")) return;
    try {
      const pathStart = url.indexOf("/o/") + 3;
      const pathEnd = url.indexOf("?");
      const fullPath = decodeURIComponent(url.substring(pathStart, pathEnd));
      await deleteObject(ref(storage, fullPath));
    } catch (err) {
      console.warn("Nem sikerült törölni a régi képet:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    setLoading(true);
    setMessage("");

    try {
      let newPhotoURL = photoURL;
      let newBikeImage = bikeImage;
      let newBikeName = bikeName;

      if (profileFile) {
        if (photoURL) await deleteImage(photoURL);
        newPhotoURL = await uploadImage(profileFile, "profilePics");
      }

      if (noBike) {
        if (bikeImage) await deleteImage(bikeImage);
        newBikeImage = "";
        newBikeName = "Nincs motorom";
      } else if (bikeFile) {
        if (bikeImage) await deleteImage(bikeImage);
        newBikeImage = await uploadImage(bikeFile, "bikePics");
      }

      await setDoc(
        doc(db, "users", user.uid),
        { displayName, bikeName: newBikeName, photoURL: newPhotoURL, bikeImage: newBikeImage },
        { merge: true }
      );

      setPhotoURL(newPhotoURL);
      setBikeImage(newBikeImage);
      setBikeName(newBikeName);
      setProfilePreview(null);
      setBikePreview(null);
      setMessage("Profil sikeresen frissítve!");
    } catch (err) {
      console.error(err);
      setMessage("Hiba történt a mentés közben.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoaderWrapper text="Profil mentése folyamatban..." />;

  return (
    <form onSubmit={handleSave}>
      <label>Név:</label>
      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

      <ProfileImageUploader
        label="Profilkép:"
        imageUrl={photoURL}
        preview={profilePreview}
        onFileChange={(file) => {
          setProfileFile(file);
          if (file) setProfilePreview(URL.createObjectURL(file));
        }}
        onDelete={photoURL !== DEFAULT_AVATAR ? () => deleteImage(photoURL) : null}
      />

      <label>Motor neve:</label>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="text"
          value={bikeName}
          onChange={(e) => setBikeName(e.target.value)}
          disabled={noBike}
        />
        <label>
          <input type="checkbox" checked={noBike} onChange={(e) => setNoBike(e.target.checked)} />
          Nincs motorom
        </label>
      </div>

      <ProfileImageUploader
        label="Motor kép:"
        imageUrl={bikeImage}
        preview={bikePreview}
        onFileChange={(file) => {
          setBikeFile(file);
          if (file) setBikePreview(URL.createObjectURL(file));
        }}
        onDelete={bikeImage ? () => deleteImage(bikeImage) : null}
      />

      <button type="submit">Mentés</button>
      {message && <p>{message}</p>}
    </form>
  );
}
