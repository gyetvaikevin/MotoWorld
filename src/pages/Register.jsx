// src/pages/Register.jsx
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth, db, storage } from "../services/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LoaderWrapper from "../components/common/LoaderWrapper";

const DEFAULT_AVATAR = "/default-avatar.png";

// Biztosító rutin: user doc létrehozása/frissítése és photoURL normalizálása
async function ensureUserDocWithDefaults(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  const existing = snap.exists() ? snap.data() : {};

  const photoURL =
    (existing.photoURL && existing.photoURL.trim()) ||
    (user.photoURL && user.photoURL.trim()) ||
    DEFAULT_AVATAR;

  const payload = {
    email: user.email || existing.email || "",
    displayName: user.displayName || existing.displayName || "",
    photoURL,
    bikeName: existing.bikeName || "",
    bikeImage: existing.bikeImage || null,
  };

  await setDoc(userRef, payload, { merge: true });
  return (await getDoc(userRef)).data();
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bikeName, setBikeName] = useState("");
  const [noBike, setNoBike] = useState(false);

  const [profileFile, setProfileFile] = useState(null);
  const [bikeFile, setBikeFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [googleUser, setGoogleUser] = useState(null);

  const uploadImage = async (file, path, uid) => {
    if (!file || !file.name) return null;
    const storageRef = ref(storage, `${path}/${uid}-${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  // Normál regisztráció
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const photoURL = profileFile
        ? await uploadImage(profileFile, "profilePics", user.uid)
        : DEFAULT_AVATAR;

      const bikeImage = bikeFile
        ? await uploadImage(bikeFile, "bikePics", user.uid)
        : null;

      await setDoc(
        doc(db, "users", user.uid),
        {
          email,
          displayName,
          bikeName: noBike ? "Nincs motorom" : bikeName,
          photoURL,
          bikeImage,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await ensureUserDocWithDefaults(user);

      setSuccess("Sikeres regisztráció!");
      setEmail("");
      setPassword("");
      setDisplayName("");
      setBikeName("");
      setNoBike(false);
      setProfileFile(null);
      setBikeFile(null);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError(
          "Ezzel az email címmel már létezik fiók. Kérlek jelentkezz be!"
        );
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google regisztráció / bejelentkezés
  const handleGoogleRegister = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const user = cred.user;
      const info = getAdditionalUserInfo(cred);

      if (info.isNewUser) {
        // Új Google user → csak createdAt, majd második lépésben kérjük a motor adatokat
        await setDoc(
          doc(db, "users", user.uid),
          { createdAt: serverTimestamp() },
          { merge: true }
        );
        setGoogleUser(user);
      } else {
        // Már létező user → sima login
        const userData = await ensureUserDocWithDefaults(user);
        console.log("Google login user doc:", userData);
        setSuccess("Sikeres bejelentkezés Google fiókkal!");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google user motor adatainak mentése (második lépés)
  const handleGoogleBikeSave = async (e) => {
    e.preventDefault();
    if (!googleUser) return;
    setLoading(true);

    try {
      await setDoc(
        doc(db, "users", googleUser.uid),
        {
          bikeName: noBike ? "Nincs motorom" : bikeName,
        },
        { merge: true }
      );

      setSuccess("Sikeres Google regisztráció!");
      setGoogleUser(null);
      setBikeName("");
      setNoBike(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoaderWrapper text="Regisztráció folyamatban..." />;
  }

  return (
    <div className="page form-page">
      <h2>Regisztráció</h2>

      {/* Normál regisztráció + Google gomb */}
      {!googleUser && (
        <>
          <form onSubmit={handleRegister} className="form-container">
            <input
              type="text"
              placeholder="Név"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email cím"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="text"
                placeholder="Motor neve (opcionális)"
                value={bikeName}
                onChange={(e) => setBikeName(e.target.value)}
                disabled={noBike}
              />
              <label>
                <input
                  type="checkbox"
                  checked={noBike}
                  onChange={(e) => setNoBike(e.target.checked)}
                />
                Nincs motorom
              </label>
            </div>

            <label>Profilkép (opcionális):</label>
            <input
              type="file"
              onChange={(e) => setProfileFile(e.target.files[0])}
            />

            <label>Motor kép (opcionális):</label>
            <input
              type="file"
              onChange={(e) => setBikeFile(e.target.files[0])}
            />

            <button type="submit">Regisztrálok</button>
          </form>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={handleGoogleRegister}>
              Google regisztráció / bejelentkezés
            </button>
          </div>
        </>
      )}

      {/* Google új user második lépés: motor adatok */}
      {googleUser && (
        <form onSubmit={handleGoogleBikeSave} className="form-container">
          <h3>Üdv, {googleUser.displayName}!</h3>
          <p>
            Kérlek add meg a motorod nevét, vagy jelöld be, ha nincs motorod.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Motor neve"
              value={bikeName}
              onChange={(e) => setBikeName(e.target.value)}
              disabled={noBike}
            />
            <label>
              <input
                type="checkbox"
                checked={noBike}
                onChange={(e) => setNoBike(e.target.checked)}
              />
              Nincs motorom
            </label>
          </div>

          <button type="submit">Mentés</button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
