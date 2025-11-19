// src/pages/AddListing.jsx
import { useState } from "react";
import { db, storage, auth } from "../services/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import LoaderWrapper from "../components/common/LoaderWrapper";

export default function AddListing() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("motor");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!user) throw new Error("Be kell jelentkezned!");

      let imageUrl = "",
        imagePath = "";
      if (image) {
        const path = `marketplace/${Date.now()}_${image.name}`;
        const imageRef = ref(storage, path);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
        imagePath = path;
      }

      await addDoc(collection(db, "marketplace"), {
        title,
        desc,
        price: Number(price),
        category,
        imageUrl,
        imagePath,
        createdAt: serverTimestamp(),
        createdBy: user.email,
        createdByUid: user.uid,
      });

      setSuccess("Hirdetés sikeresen feladva!");
      setTimeout(() => navigate("/marketplace"), 1500);
    } catch (err) {
      setError(err.message || "Ismeretlen hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-listing-form">
      {loading && <LoaderWrapper text="Hirdetés feltöltése..." />}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <h2>Új hirdetés feladása</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Cím"
        required
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Leírás"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Ár"
        required
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="motor">Motor</option>
        <option value="felszerelés">Felszerelés</option>
        <option value="szerszám">Szerszám</option>
      </select>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button type="submit">Hirdetés feladása</button>
    </form>
  );
}
