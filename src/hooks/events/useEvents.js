// src/components/events/useEvents.js
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage, auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { notifyUser } from "../../utils/notifyUser";

export default function useEvents() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("dateDesc");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [stops, setStops] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    const unsubEvents = onSnapshot(
      query(collection(db, "events"), orderBy("createdAt", "desc")),
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubAuth();
      unsubEvents();
    };
  }, []);

  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    setFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const uploadImage = async (file) => {
    const path = `events/${Date.now()}_${file.name}`;
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, file);
    return { url: await getDownloadURL(imageRef), path };
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!user) throw new Error("Be kell jelentkezned!");

      let imageUrl = "",
        imagePath = "";
      if (image)
        ({ url: imageUrl, path: imagePath } = await uploadImage(image));

      // user adatok betöltése Firestore-ból
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const userData = snap.exists() ? snap.data() : {};

      await addDoc(collection(db, "events"), {
        title,
        desc,
        imageUrl,
        imagePath,
        createdAt: serverTimestamp(),
        createdBy: user.email,
        createdByUid: user.uid,
        authorName: userData.displayName || "Ismeretlen",
        authorPhoto: userData.photoURL || "/default-avatar.png",
        likes: [], // csak UID-k
        stops,
        route: stops.map((s) => ({ lat: s.lat, lng: s.lng })),
      });

      setSuccess("Esemény sikeresen hozzáadva!");
      setTitle("");
      setDesc("");
      setImage(null);
      setImagePreview(null);
      setStops([]);

      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Ismeretlen hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let data = { title: editTitle, desc: editDesc };
    if (editImage)
      ({ url: data.imageUrl, path: data.imagePath } = await uploadImage(
        editImage
      ));
    await updateDoc(doc(db, "events", editId), data);
    setEditId(null);
    setEditTitle("");
    setEditDesc("");
    setEditImage(null);
    setEditImagePreview(null);
  };

  const handleDelete = async (id, path) => {
    await deleteDoc(doc(db, "events", id));
    if (path) await deleteObject(ref(storage, path));
  };

  const toggleLike = async (id) => {
    if (!user) return alert("Be kell jelentkezned a like-hoz!");

    const refDoc = doc(db, "events", id);
    const snap = await getDoc(refDoc);
    const data = snap.data();
    const currentLikes = data.likes || [];

    if (currentLikes.includes(user.uid)) {
      await updateDoc(refDoc, {
        likes: arrayRemove(user.uid),
      });
    } else {
      await updateDoc(refDoc, {
        likes: arrayUnion(user.uid),
      });

      // 🔔 Értesítés küldése, ha nem saját esemény
      if (data.createdByUid && data.createdByUid !== user.uid) {
        await notifyUser({
          type: "like",
          senderId: user.uid,
          senderName: user.displayName || "Ismeretlen",
          senderPhoto: user.photoURL || "",
          receiverId: data.createdByUid,
          relatedId: id,
        });
      }
    }
  };

  const openRouteInMaps = (stops) => {
    if (!stops || stops.length < 2) {
      alert("Legalább indulási és érkezési pont szükséges.");
      return;
    }

    const origin = `${stops[0].lat},${stops[0].lng}`;
    const destination = `${stops[stops.length - 1].lat},${
      stops[stops.length - 1].lng
    }`;
    const hasWaypoints = stops.length > 2;
    const waypoints = hasWaypoints
      ? stops
          .slice(1, -1)
          .map((s) => `${s.lat},${s.lng}`)
          .join("|")
      : "";

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}${
      hasWaypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""
    }`;
    const appleUrl = `maps://?saddr=${encodeURIComponent(
      origin
    )}&daddr=${encodeURIComponent(destination)}`;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.open(isIOS ? appleUrl : gmapsUrl, "_blank", "noopener,noreferrer");
  };

  return {
    events,
    title,
    setTitle,
    desc,
    setDesc,
    image,
    setImage,
    imagePreview,
    setImagePreview,
    stops,
    setStops,
    user,
    editId,
    setEditId,
    editTitle,
    setEditTitle,
    editDesc,
    setEditDesc,
    editImage,
    setEditImage,
    editImagePreview,
    setEditImagePreview,
    searchTerm,
    setSearchTerm,
    sortOption,
    setSortOption,
    loading,
    error,
    success,
    handleImageChange,
    handleAddEvent,
    handleUpdate,
    handleDelete,
    toggleLike,
    openRouteInMaps,
  };
}
