// src/pages/EditListing.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage, auth } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import LoaderWrapper from "../components/common/LoaderWrapper";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("motor");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [oldImagePath, setOldImagePath] = useState("");

  const [loading, setLoading] = useState(true); // induláskor true, mert betöltjük a hirdetést
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Hirdetés betöltése
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, "marketplace", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (user?.uid !== data.createdByUid) {
            alert("Nincs jogosultságod szerkeszteni ezt a hirdetést!");
            navigate("/marketplace");
            return;
          }
          setTitle(data.title);
          setDesc(data.desc);
          setPrice(data.price);
          setCategory(data.category);
          setImagePreview(data.imageUrl || null);
          setOldImagePath(data.imagePath || "");
        } else {
          alert("Hirdetés nem található!");
          navigate("/marketplace");
        }
      } catch (err) {
        console.error("❌ Hiba a hirdetés betöltésekor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, navigate, user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let imageUrl = imagePreview;
      let imagePath = oldImagePath;

      if (image) {
        if (oldImagePath) {
          await deleteObject(ref(storage, oldImagePath)).catch(() => {});
        }
        const path = `marketplace/${Date.now()}_${image.name}`;
        const imageRef = ref(storage, path);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
        imagePath = path;
      }

      await updateDoc(doc(db, "marketplace", id), {
        title,
        desc,
        price: Number(price),
        category,
        imageUrl,
        imagePath,
      });

      setSuccess("Hirdetés sikeresen frissítve!");
      setTimeout(() => navigate(`/marketplace/${id}`), 1500);
    } catch (err) {
      setError(err.message || "Ismeretlen hiba történt.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoaderWrapper text="Hirdetés betöltése..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="edit-listing-form">
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      {loading && <LoaderWrapper text="Mentés folyamatban..." />}

      <h2>Hirdetés szerkesztése</h2>
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
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imagePreview && (
        <img
          src={imagePreview}
          alt="Előnézet"
          style={{ maxWidth: "300px", marginTop: "1rem" }}
        />
      )}
      <button type="submit">Mentés</button>
    </form>
  );
}
